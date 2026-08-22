'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import { hasActiveComplimentaryAccess } from '@/lib/billing/access'
import { getStoreCommercialAccess } from '@/lib/billing/commercial-access'
import {
  getPaidPlanDefinition,
  normalizeCommercialPlan,
  type PaidPlanCode,
  VOLTA_PRO_PLAN,
} from '@/lib/billing/plan'
import {
  cancelMercadoPagoSubscription,
  createMercadoPagoSubscription,
  findMercadoPagoStoreSubscription,
  getMercadoPagoSubscription,
  isMercadoPagoConfigured,
  MercadoPagoApiError,
  updateMercadoPagoSubscriptionAmount,
} from '@/lib/billing/mercado-pago'
import { persistProviderSubscription, reconcileAuthorizedPayments } from '@/lib/billing/service'

type BillingActionResult = { success?: boolean; error?: string; redirectUrl?: string }

function billingError(error: unknown) {
  if (error instanceof MercadoPagoApiError) {
    return error.status === 503
      ? 'Falta terminar la conexión de Mercado Pago.'
      : 'Mercado Pago no pudo completar la operación. Probá nuevamente en unos minutos.'
  }
  return error instanceof Error ? error.message : 'No pudimos completar la operación.'
}

function revalidateBilling() {
  revalidatePath('/admin')
  revalidatePath('/admin/plan')
  revalidatePath('/admin/rendimiento')
  revalidatePath('/admin/compartir')
  revalidatePath('/billing/return')
}

export async function startPaidPlanSubscription(planCode: PaidPlanCode): Promise<BillingActionResult> {
  const { user, store } = await requireAuthenticatedStoreContext()
  if (await hasActiveComplimentaryAccess(store.id)) {
    return { error: 'Tu cuenta tiene acceso bonificado a VOLTA. No necesitás activar una suscripción.' }
  }

  const payerEmail = user.email?.trim()
  if (!payerEmail) return { error: 'Tu cuenta necesita un email válido para activar el plan.' }
  if (!isMercadoPagoConfigured()) return { error: 'Falta terminar la conexión de Mercado Pago.' }

  const admin = await createAdminClient()
  const db = admin as any
  const plan = getPaidPlanDefinition(planCode)
  const commercialAccess = await getStoreCommercialAccess(store.id)
  if (commercialAccess.planCode === 'pro' && planCode === 'volta') {
    return { error: 'Tu acceso PRO sigue vigente. Cuando termine el período pago vas a poder elegir VOLTA o continuar en Gratis.' }
  }

  const { data: beforeClaim, error: beforeClaimError } = await db
    .from('billing_subscriptions')
    .select('plan_code, status, provider_subscription_id')
    .eq('store_id', store.id)
    .maybeSingle()
  if (beforeClaimError) return { error: `No pudimos leer tu plan actual: ${beforeClaimError.message}` }

  const currentPlan = normalizeCommercialPlan(beforeClaim?.plan_code)
  if (beforeClaim?.status === 'active') {
    if (currentPlan === planCode) return { error: `Tu plan ${plan.name} ya está activo.` }
    if (currentPlan === 'volta' && planCode === 'pro') return upgradeVoltaSubscriptionToPro()
    if (currentPlan === 'pro' && planCode === 'volta') {
      return { error: 'Para volver a VOLTA, cancelá la renovación de PRO. Vas a conservar PRO hasta el final del período pago.' }
    }
  }

  if (beforeClaim && currentPlan !== planCode && ['creating', 'pending'].includes(beforeClaim.status)) {
    if (!beforeClaim.provider_subscription_id) {
      return { error: 'Todavía estamos cerrando la activación anterior. Esperá unos segundos y volvé a intentar.' }
    }
    try {
      const canceledPrevious = await cancelMercadoPagoSubscription(beforeClaim.provider_subscription_id)
      await persistProviderSubscription(store.id, canceledPrevious)
    } catch (error) {
      return { error: `No pudimos cerrar la activación anterior antes de cambiar de plan. ${billingError(error)}` }
    }
  }

  const { data: claimRows, error: claimError } = await db.rpc('billing_claim_plan_checkout', {
    p_store_id: store.id,
    p_payer_email: payerEmail,
    p_plan_code: plan.code,
    p_intro_price: plan.introAmount,
    p_standard_price: plan.standardAmount,
    p_intro_cycles_total: plan.introCycles,
  })

  if (claimError) return { error: `No pudimos preparar la suscripción: ${claimError.message}` }

  const claim = Array.isArray(claimRows) ? claimRows[0] : claimRows
  if (!claim) return { error: 'No pudimos preparar la suscripción.' }

  if (!claim.should_create) {
    if (claim.current_status === 'active') return { error: `Tu plan ${plan.name} ya está activo.` }
    if (claim.current_status === 'paused') return { error: 'Tu suscripción está pausada. Contactanos para reactivarla.' }
    if (claim.existing_checkout_url) return { success: true, redirectUrl: claim.existing_checkout_url as string }
    return { error: 'Ya estamos preparando tu activación. Esperá unos segundos y volvé a intentar.' }
  }

  const { data: localBilling, error: billingLookupError } = await db
    .from('billing_subscriptions')
    .select('current_amount, plan_code')
    .eq('store_id', store.id)
    .single()
  if (billingLookupError) return { error: `No pudimos confirmar el precio de tu plan: ${billingLookupError.message}` }

  const recurringAmount = Number(localBilling?.current_amount)
  if (!Number.isFinite(recurringAmount) || recurringAmount <= 0) {
    return { error: 'No pudimos confirmar el precio de tu plan.' }
  }

  try {
    const shouldRecoverExistingProviderContract = currentPlan === planCode
    if (shouldRecoverExistingProviderContract) {
      const recoveredSubscription = await findMercadoPagoStoreSubscription({
        storeId: store.id,
        payerEmail,
      })

      if (recoveredSubscription?.id) {
        await persistProviderSubscription(store.id, recoveredSubscription)
        if (recoveredSubscription.status === 'authorized') {
          await reconcileAuthorizedPayments(recoveredSubscription.id)
        }
        revalidateBilling()
        if (recoveredSubscription.status === 'pending' && recoveredSubscription.init_point) {
          return { success: true, redirectUrl: recoveredSubscription.init_point }
        }
        return { success: true, redirectUrl: '/billing/return' }
      }
    }

    const providerSubscription = await createMercadoPagoSubscription({
      storeId: store.id,
      payerEmail,
      idempotencyKey: String(claim.idempotency_key),
      amount: recurringAmount,
      planName: plan.name,
    })

    if (!providerSubscription.id || !providerSubscription.init_point) {
      throw new Error('Mercado Pago no devolvió un enlace de activación válido.')
    }

    await persistProviderSubscription(store.id, providerSubscription)
    revalidateBilling()
    return { success: true, redirectUrl: providerSubscription.init_point }
  } catch (error) {
    await db
      .from('billing_subscriptions')
      .update({ status: 'error', last_error: billingError(error) })
      .eq('store_id', store.id)
    return { error: billingError(error) }
  }
}

export async function startVoltaSubscription(): Promise<BillingActionResult> {
  return startPaidPlanSubscription('volta')
}

export async function upgradeVoltaSubscriptionToPro(): Promise<BillingActionResult> {
  const { store } = await requireAuthenticatedStoreContext()
  if (await hasActiveComplimentaryAccess(store.id)) {
    return { error: 'Tu cuenta está bonificada en VOLTA. PRO requiere una suscripción propia.' }
  }
  if (!isMercadoPagoConfigured()) return { error: 'Falta terminar la conexión de Mercado Pago.' }

  const admin = await createAdminClient()
  const db = admin as any
  const { data: subscription, error: lookupError } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('store_id', store.id)
    .maybeSingle()

  if (lookupError) return { error: lookupError.message }
  if (!subscription?.provider_subscription_id || subscription.status !== 'active') {
    return startPaidPlanSubscription('pro')
  }
  if (normalizeCommercialPlan(subscription.plan_code) === 'pro') {
    return { success: true, redirectUrl: '/billing/return' }
  }

  const previousAmount = Number(subscription.current_amount)

  try {
    const providerSubscription = await updateMercadoPagoSubscriptionAmount(
      subscription.provider_subscription_id,
      VOLTA_PRO_PLAN.standardAmount,
    )

    const { error: localUpdateError } = await db
      .from('billing_subscriptions')
      .update({
        plan_code: 'pro',
        intro_price: VOLTA_PRO_PLAN.introAmount,
        standard_price: VOLTA_PRO_PLAN.standardAmount,
        intro_cycles_total: VOLTA_PRO_PLAN.introCycles,
        current_amount: VOLTA_PRO_PLAN.standardAmount,
        last_error: null,
      })
      .eq('id', subscription.id)

    if (localUpdateError) {
      if (Number.isFinite(previousAmount) && previousAmount > 0) {
        await updateMercadoPagoSubscriptionAmount(subscription.provider_subscription_id, previousAmount).catch(() => null)
      }
      return { error: 'No pudimos completar el cambio a PRO. Tu plan anterior sigue siendo la referencia.' }
    }

    await persistProviderSubscription(store.id, providerSubscription)
    revalidateBilling()
    return { success: true, redirectUrl: '/billing/return?kind=upgrade' }
  } catch (error) {
    return { error: billingError(error) }
  }
}

export async function cancelVoltaSubscription(): Promise<BillingActionResult> {
  const { store } = await requireAuthenticatedStoreContext()
  const admin = await createAdminClient()
  const db = admin as any
  const { data: subscription, error: lookupError } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('store_id', store.id)
    .maybeSingle()

  if (lookupError) return { error: lookupError.message }
  if (!subscription?.provider_subscription_id) return { error: 'No encontramos una suscripción activa para cancelar.' }
  if (subscription.status === 'canceled') return { success: true, redirectUrl: '/billing/return?kind=canceled' }

  try {
    const providerSubscription = await cancelMercadoPagoSubscription(subscription.provider_subscription_id)
    await persistProviderSubscription(store.id, providerSubscription)
    revalidateBilling()
    return { success: true, redirectUrl: '/billing/return?kind=canceled' }
  } catch (error) {
    return { error: billingError(error) }
  }
}

export async function syncVoltaSubscription(): Promise<BillingActionResult> {
  const { store } = await requireAuthenticatedStoreContext()
  const admin = await createAdminClient()
  const db = admin as any
  const { data: subscription, error: lookupError } = await db
    .from('billing_subscriptions')
    .select('provider_subscription_id')
    .eq('store_id', store.id)
    .maybeSingle()

  if (lookupError) return { error: lookupError.message }
  if (!subscription?.provider_subscription_id) return { error: 'Todavía no hay una suscripción para sincronizar.' }

  try {
    const providerSubscription = await getMercadoPagoSubscription(subscription.provider_subscription_id)
    await persistProviderSubscription(store.id, providerSubscription)
    await reconcileAuthorizedPayments(subscription.provider_subscription_id)
    revalidateBilling()
    return { success: true }
  } catch (error) {
    return { error: billingError(error) }
  }
}
