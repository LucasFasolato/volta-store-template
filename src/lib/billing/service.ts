import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import { VOLTA_BILLING_PLAN } from '@/lib/billing/plan'
import {
  getMercadoPagoSubscription,
  parseBillingExternalReference,
  searchMercadoPagoAuthorizedPayments,
  updateMercadoPagoSubscriptionAmount,
  type MercadoPagoAuthorizedPayment,
  type MercadoPagoSubscription,
} from '@/lib/billing/mercado-pago'
import type { BillingStatus } from '@/lib/billing/types'

function toAmount(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function mapProviderStatus(status: string | null | undefined): BillingStatus {
  switch (status) {
    case 'authorized': return 'active'
    case 'pending': return 'pending'
    case 'paused': return 'paused'
    case 'canceled': return 'canceled'
    default: return status ? 'error' : 'pending'
  }
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

  const providerStatus = providerSubscription.status || existing?.provider_status || null
  const localStatus = providerStatus ? mapProviderStatus(providerStatus) : (existing?.status || 'pending')
  const fallbackAmount = Number(existing?.current_amount) || VOLTA_BILLING_PLAN.introAmount
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
    currency: providerSubscription.auto_recurring?.currency_id || existing?.currency || VOLTA_BILLING_PLAN.currency,
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

  const paymentStatus = invoice.payment?.status || invoice.status || 'unknown'
  const providerPaymentId = invoice.payment?.id == null ? null : String(invoice.payment.id)
  const paidAt = paymentStatus === 'approved'
    ? invoice.last_modified || invoice.debit_date || invoice.date_created || new Date().toISOString()
    : null

  const { error: paymentError } = await db.from('billing_payments').upsert({
    store_id: localSubscription.store_id,
    billing_subscription_id: localSubscription.id,
    provider_invoice_id: String(invoice.id),
    provider_payment_id: providerPaymentId,
    provider_subscription_id: invoice.preapproval_id,
    payment_status: paymentStatus,
    payment_status_detail: invoice.payment?.status_detail || null,
    amount: toAmount(invoice.transaction_amount, 0),
    currency: invoice.currency_id || VOLTA_BILLING_PLAN.currency,
    debit_date: invoice.debit_date || null,
    paid_at: paidAt,
  }, { onConflict: 'provider_invoice_id' })

  if (paymentError) throw new Error(`No pudimos registrar el cobro: ${paymentError.message}`)

  const { count, error: countError } = await db
    .from('billing_payments')
    .select('id', { count: 'exact', head: true })
    .eq('billing_subscription_id', localSubscription.id)
    .eq('payment_status', 'approved')

  if (countError) throw new Error(`No pudimos calcular los ciclos pagos: ${countError.message}`)

  const approvedCycles = Math.max(0, Number(count || 0))
  const introCyclesPaid = Math.min(approvedCycles, VOLTA_BILLING_PLAN.introCycles)

  const { error: cycleError } = await db
    .from('billing_subscriptions')
    .update({ intro_cycles_paid: introCyclesPaid, last_synced_at: new Date().toISOString() })
    .eq('id', localSubscription.id)

  if (cycleError) throw new Error(`No pudimos actualizar el progreso del plan: ${cycleError.message}`)

  if (
    approvedCycles >= VOLTA_BILLING_PLAN.introCycles &&
    Number(localSubscription.current_amount) < VOLTA_BILLING_PLAN.standardAmount &&
    localSubscription.status === 'active'
  ) {
    const upgraded = await updateMercadoPagoSubscriptionAmount(
      invoice.preapproval_id,
      VOLTA_BILLING_PLAN.standardAmount,
    )
    await persistProviderSubscription(localSubscription.store_id, upgraded, {
      priceUpgradedAt: new Date().toISOString(),
    })
  }

  return { approvedCycles, introCyclesPaid }
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
