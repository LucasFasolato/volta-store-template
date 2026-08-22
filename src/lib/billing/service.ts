import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import {
  getPaidPlanDefinition,
  normalizeCommercialPlan,
  VOLTA_BILLING_PLAN,
} from '@/lib/billing/plan'
import { normalizeProviderBillingStatus } from '@/lib/billing/status'
import { resolveProcessorEconomics } from '@/lib/billing/unit-economics'
import {
  getMercadoPagoPayment,
  getMercadoPagoSubscription,
  parseBillingExternalReference,
  searchMercadoPagoAuthorizedPayments,
  updateMercadoPagoSubscriptionAmount,
  type MercadoPagoAuthorizedPayment,
  type MercadoPagoSubscription,
} from '@/lib/billing/mercado-pago'

const CURRENT_CONTRACT_STATUSES = new Set(['creating', 'pending', 'active', 'paused'])

function toAmount(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function toNonNegativeAmount(value: number | string | null | undefined) {
  if (value == null || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

async function resolveStoreId(providerSubscription: MercadoPagoSubscription) {
  const fromReference = parseBillingExternalReference(providerSubscription.external_reference)
  const admin = await createAdminClient()
  const db = admin as any

  if (fromReference) {
    const { data: store } = await db.from('stores').select('id').eq('id', fromReference).maybeSingle()
    if (store?.id) return store.id as string
  }

  const { data: existing } = await db
    .from('billing_subscriptions')
    .select('store_id')
    .eq('provider_subscription_id', providerSubscription.id)
    .maybeSingle()

  return existing?.store_id as string | undefined
}

async function syncStorePlanFromSubscription(db: any, storeId: string, subscription: any) {
  const planCode = normalizeCommercialPlan(subscription.plan_code)
  if (planCode === 'free') return

  if (subscription.status === 'active') {
    const { error } = await db
      .from('stores')
      .update({
        plan_code: planCode,
        plan_access_until: subscription.next_payment_date ?? null,
      })
      .eq('id', storeId)
    if (error) throw new Error(`No pudimos activar el plan de la tienda: ${error.message}`)
    return
  }

  if (subscription.status === 'canceled') {
    const [{ data: store, error: storeReadError }, { count: approvedPayments, error: paymentCountError }] = await Promise.all([
      db.from('stores').select('plan_access_until').eq('id', storeId).maybeSingle(),
      db.from('billing_payments').select('id', { count: 'exact', head: true }).eq('billing_subscription_id', subscription.id).eq('payment_status', 'approved'),
    ])
    if (storeReadError) throw new Error(`No pudimos confirmar la vigencia del plan: ${storeReadError.message}`)
    if (paymentCountError) throw new Error(`No pudimos confirmar los períodos pagos: ${paymentCountError.message}`)

    // Canceling an unpaid/pending checkout must not grant a paid plan. If there
    // was a real approved payment, preserve access until the paid period ends.
    if (Number(approvedPayments || 0) > 0) {
      const accessUntil = subscription.next_payment_date ?? store?.plan_access_until ?? null
      const { error } = await db
        .from('stores')
        .update({ plan_code: planCode, plan_access_until: accessUntil })
        .eq('id', storeId)
      if (error) throw new Error(`No pudimos guardar la vigencia del plan: ${error.message}`)
    }
  }
}

export async function persistProviderSubscription(
  storeId: string,
  providerSubscription: MercadoPagoSubscription,
  options: { priceUpgradedAt?: string | null } = {},
) {
  const admin = await createAdminClient()
  const db = admin as any
  const { data: existing, error: existingError } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('store_id', storeId)
    .maybeSingle()

  if (existingError) {
    throw new Error(`No pudimos leer el estado actual de la suscripción: ${existingError.message}`)
  }

  if (
    existing?.provider_subscription_id &&
    existing.provider_subscription_id !== providerSubscription.id &&
    CURRENT_CONTRACT_STATUSES.has(existing.status)
  ) {
    return existing
  }

  const providerStatus = providerSubscription.status || existing?.provider_status || null
  const localStatus = providerStatus
    ? normalizeProviderBillingStatus(providerStatus)
    : (existing?.status || 'pending')
  const planCode = normalizeCommercialPlan(existing?.plan_code || 'volta')
  const plan = planCode === 'free' ? VOLTA_BILLING_PLAN : getPaidPlanDefinition(planCode)
  const fallbackAmount = Number(existing?.current_amount) || plan.introAmount
  const currentAmount = toAmount(
    providerSubscription.auto_recurring?.transaction_amount,
    fallbackAmount,
  )
  const now = new Date().toISOString()

  const patch: Record<string, unknown> = {
    provider: 'mercado_pago',
    provider_subscription_id: providerSubscription.id,
    provider_status: providerStatus,
    status: localStatus,
    currency: providerSubscription.auto_recurring?.currency_id || existing?.currency || plan.currency,
    current_amount: currentAmount,
    next_payment_date: providerSubscription.next_payment_date ?? existing?.next_payment_date ?? null,
    checkout_url: providerSubscription.init_point ?? existing?.checkout_url ?? null,
    last_error: null,
    last_synced_at: now,
  }

  if (providerSubscription.payer_email) patch.payer_email = providerSubscription.payer_email
  if (localStatus === 'canceled') patch.canceled_at = existing?.canceled_at || now
  if (localStatus !== 'canceled' && existing?.canceled_at) patch.canceled_at = null
  if (options.priceUpgradedAt !== undefined) patch.price_upgraded_at = options.priceUpgradedAt

  const { data, error } = await db
    .from('billing_subscriptions')
    .upsert({ store_id: storeId, ...patch }, { onConflict: 'store_id' })
    .select('*')
    .single()

  if (error) throw new Error(`No pudimos sincronizar la suscripción: ${error.message}`)
  await syncStorePlanFromSubscription(db, storeId, data)
  return data
}

export async function syncProviderSubscription(providerSubscription: MercadoPagoSubscription) {
  const storeId = await resolveStoreId(providerSubscription)
  if (!storeId) return null
  return persistProviderSubscription(storeId, providerSubscription)
}

export async function syncProviderSubscriptionById(providerSubscriptionId: string) {
  const providerSubscription = await getMercadoPagoSubscription(providerSubscriptionId)
  return syncProviderSubscription(providerSubscription)
}

async function loadPaymentEconomics(providerPaymentId: string | null, grossAmount: number) {
  if (!providerPaymentId) return { netReceivedAmount: null, processorDeductionsAmount: null }

  try {
    const payment = await getMercadoPagoPayment(providerPaymentId)
    const netReceivedAmount = toNonNegativeAmount(payment.transaction_details?.net_received_amount)
    const feeDetails = payment.fee_details || []
    const explicitFees = feeDetails.reduce((total, fee) => total + (toNonNegativeAmount(fee.amount) || 0), 0)
    const economics = resolveProcessorEconomics({
      amount: grossAmount,
      netReceivedAmount,
      processorDeductionsAmount: explicitFees > 0 ? explicitFees : null,
    })

    return {
      netReceivedAmount: economics.net,
      processorDeductionsAmount: economics.fees,
    }
  } catch {
    return { netReceivedAmount: null, processorDeductionsAmount: null }
  }
}

export async function recordAuthorizedPayment(invoice: MercadoPagoAuthorizedPayment) {
  const admin = await createAdminClient()
  const db = admin as any

  let { data: localSubscription } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('provider_subscription_id', invoice.preapproval_id)
    .maybeSingle()

  if (!localSubscription) {
    const providerSubscription = await getMercadoPagoSubscription(invoice.preapproval_id)
    localSubscription = await syncProviderSubscription(providerSubscription)
  }

  if (!localSubscription) return null

  const planCode = normalizeCommercialPlan(localSubscription.plan_code || 'volta')
  const paymentStatus = invoice.payment?.status || invoice.status || 'unknown'
  const providerPaymentId = invoice.payment?.id == null ? null : String(invoice.payment.id)
  const paidAt = paymentStatus === 'approved'
    ? invoice.last_modified || invoice.debit_date || invoice.date_created || new Date().toISOString()
    : null
  const amount = toAmount(invoice.transaction_amount, 0)
  const economics = paymentStatus === 'approved'
    ? await loadPaymentEconomics(providerPaymentId, amount)
    : { netReceivedAmount: null, processorDeductionsAmount: null }

  const { error: paymentError } = await db.from('billing_payments').upsert({
    store_id: localSubscription.store_id,
    billing_subscription_id: localSubscription.id,
    plan_code: planCode === 'free' ? 'volta' : planCode,
    provider_invoice_id: String(invoice.id),
    provider_payment_id: providerPaymentId,
    provider_subscription_id: invoice.preapproval_id,
    payment_status: paymentStatus,
    payment_status_detail: invoice.payment?.status_detail || null,
    amount,
    net_received_amount: economics.netReceivedAmount,
    processor_deductions_amount: economics.processorDeductionsAmount,
    currency: invoice.currency_id || VOLTA_BILLING_PLAN.currency,
    debit_date: invoice.debit_date || null,
    paid_at: paidAt,
  }, { onConflict: 'provider_invoice_id' })

  if (paymentError) throw new Error(`No pudimos registrar el cobro: ${paymentError.message}`)

  const { count, error: countError } = await db
    .from('billing_payments')
    .select('id', { count: 'exact', head: true })
    .eq('billing_subscription_id', localSubscription.id)
    .eq('plan_code', 'volta')
    .eq('payment_status', 'approved')

  if (countError) throw new Error(`No pudimos calcular los ciclos pagos: ${countError.message}`)

  const approvedVoltaCycles = Math.max(0, Number(count || 0))
  const introCyclesPaid = Math.min(approvedVoltaCycles, VOLTA_BILLING_PLAN.introCycles)

  const { error: cycleError } = await db
    .from('billing_subscriptions')
    .update({ intro_cycles_paid: introCyclesPaid, last_synced_at: new Date().toISOString() })
    .eq('id', localSubscription.id)

  if (cycleError) throw new Error(`No pudimos actualizar el progreso del plan: ${cycleError.message}`)

  const currentProviderSubscriptionId = localSubscription.provider_subscription_id as string | null
  if (
    planCode === 'volta' &&
    approvedVoltaCycles >= VOLTA_BILLING_PLAN.introCycles &&
    Number(localSubscription.current_amount) < VOLTA_BILLING_PLAN.standardAmount &&
    localSubscription.status === 'active' &&
    currentProviderSubscriptionId
  ) {
    const upgraded = await updateMercadoPagoSubscriptionAmount(
      currentProviderSubscriptionId,
      VOLTA_BILLING_PLAN.standardAmount,
    )
    await persistProviderSubscription(localSubscription.store_id, upgraded, {
      priceUpgradedAt: new Date().toISOString(),
    })
  }

  return { approvedCycles: approvedVoltaCycles, introCyclesPaid }
}

export async function reconcileAuthorizedPayments(subscriptionId: string) {
  const invoices = await searchMercadoPagoAuthorizedPayments(subscriptionId)
  const ordered = [...invoices].sort((a, b) => {
    const left = Date.parse(a.debit_date || a.date_created || '') || 0
    const right = Date.parse(b.debit_date || b.date_created || '') || 0
    return left - right
  })
  for (const invoice of ordered) {
    await recordAuthorizedPayment(invoice)
  }
  return ordered.length
}

export async function refreshStoreBilling(storeId: string) {
  const admin = await createAdminClient()
  const db = admin as any
  const { data: subscription, error } = await db
    .from('billing_subscriptions')
    .select('provider_subscription_id')
    .eq('store_id', storeId)
    .maybeSingle()

  if (error) throw new Error(`No pudimos leer la suscripción: ${error.message}`)
  if (!subscription?.provider_subscription_id) return null

  const providerSubscription = await getMercadoPagoSubscription(subscription.provider_subscription_id)
  const synced = await persistProviderSubscription(storeId, providerSubscription)
  await reconcileAuthorizedPayments(subscription.provider_subscription_id)
  return synced
}
