'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import {
  cancelMercadoPagoSubscription,
  createMercadoPagoSubscription,
  findMercadoPagoStoreSubscription,
  getMercadoPagoSubscription,
  isMercadoPagoConfigured,
  MercadoPagoApiError,
} from '@/lib/billing/mercado-pago'
import { persistProviderSubscription } from '@/lib/billing/service'

function billingError(error: unknown) {
  if (error instanceof MercadoPagoApiError) {
    return error.status === 503
      ? 'Falta terminar la conexión de Mercado Pago.'
      : 'Mercado Pago no pudo completar la operación. Probá nuevamente en unos minutos.'
  }
  return error instanceof Error ? error.message : 'No pudimos completar la operación.'
}

export async function startVoltaSubscription() {
  const { user, store } = await requireAuthenticatedStoreContext()
  const payerEmail = user.email?.trim()
  if (!payerEmail) return { error: 'Tu cuenta necesita un email válido para activar el plan.' }
  if (!isMercadoPagoConfigured()) return { error: 'Falta terminar la conexión de Mercado Pago.' }

  const admin = await createAdminClient()
  const db = admin as any
  const { data: claimRows, error: claimError } = await db.rpc('billing_claim_checkout', {
    p_store_id: store.id,
    p_payer_email: payerEmail,
  })

  if (claimError) return { error: `No pudimos preparar la suscripción: ${claimError.message}` }

  const claim = Array.isArray(claimRows) ? claimRows[0] : claimRows
  if (!claim) return { error: 'No pudimos preparar la suscripción.' }

  if (!claim.should_create) {
    if (claim.current_status === 'active') return { error: 'Tu suscripción ya está activa.' }
    if (claim.current_status === 'paused') return { error: 'Tu suscripción está pausada. Contactanos para reactivarla.' }
    if (claim.existing_checkout_url) return { success: true, redirectUrl: claim.existing_checkout_url as string }
    return { error: 'Ya estamos preparando tu activación. Esperá unos segundos y volvé a intentar.' }
  }

  const { data: localBilling, error: billingLookupError } = await db
    .from('billing_subscriptions')
    .select('current_amount')
    .eq('store_id', store.id)
    .single()
  if (billingLookupError) return { error: `No pudimos confirmar el precio de tu plan: ${billingLookupError.message}` }

  const recurringAmount = Number(localBilling?.current_amount)
  if (!Number.isFinite(recurringAmount) || recurringAmount <= 0) {
    return { error: 'No pudimos confirmar el precio de tu plan.' }
  }

  try {
    // A provider lookup makes interrupted requests recoverable without creating a
    // second recurring contract if the API succeeded but the local save did not.
    const recoveredSubscription = await findMercadoPagoStoreSubscription({
      storeId: store.id,
      payerEmail,
    })

    if (recoveredSubscription?.id) {
      await persistProviderSubscription(store.id, recoveredSubscription)
      revalidatePath('/admin/plan')
      if (recoveredSubscription.status === 'pending' && recoveredSubscription.init_point) {
        return { success: true, redirectUrl: recoveredSubscription.init_point }
      }
      return { success: true }
    }

    const providerSubscription = await createMercadoPagoSubscription({
      storeId: store.id,
      payerEmail,
      idempotencyKey: String(claim.idempotency_key),
      amount: recurringAmount,
    })

    if (!providerSubscription.id || !providerSubscription.init_point) {
      throw new Error('Mercado Pago no devolvió un enlace de activación válido.')
    }

    await persistProviderSubscription(store.id, providerSubscription)
    revalidatePath('/admin/plan')
    return { success: true, redirectUrl: providerSubscription.init_point }
  } catch (error) {
    await db
      .from('billing_subscriptions')
      .update({ status: 'error', last_error: billingError(error) })
      .eq('store_id', store.id)
    return { error: billingError(error) }
  }
}

export async function cancelVoltaSubscription() {
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
  if (subscription.status === 'canceled') return { success: true }

  try {
    const providerSubscription = await cancelMercadoPagoSubscription(subscription.provider_subscription_id)
    await persistProviderSubscription(store.id, providerSubscription)
    revalidatePath('/admin/plan')
    return { success: true }
  } catch (error) {
    return { error: billingError(error) }
  }
}

export async function syncVoltaSubscription() {
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
    revalidatePath('/admin/plan')
    return { success: true }
  } catch (error) {
    return { error: billingError(error) }
  }
}
