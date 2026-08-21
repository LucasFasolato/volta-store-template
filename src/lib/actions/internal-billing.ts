'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireInternalAdmin } from '@/lib/internal/auth'
import {
  cancelMercadoPagoSubscription,
  getMercadoPagoSubscription,
  isMercadoPagoConfigured,
} from '@/lib/billing/mercado-pago'
import { ensureMercadoPagoCancellation } from '@/lib/billing/complimentary'
import { persistProviderSubscription } from '@/lib/billing/service'

const grantSchema = z.object({
  storeId: z.string().uuid(),
  expiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  note: z.string().trim().max(500).nullable(),
})

const storeSchema = z.string().uuid()

function endOfArgentinaDay(date: string) {
  const parsed = new Date(`${date}T23:59:59.999-03:00`)
  if (Number.isNaN(parsed.getTime())) throw new Error('La fecha elegida no es válida.')
  return parsed.toISOString()
}

export async function grantComplimentaryAccess(input: {
  storeId: string
  expiresOn: string | null
  note: string | null
}) {
  const user = await requireInternalAdmin()
  const parsed = grantSchema.safeParse({
    ...input,
    expiresOn: input.expiresOn || null,
    note: input.note?.trim() || null,
  })
  if (!parsed.success) return { error: 'Revisá los datos del acceso bonificado.' }

  const expiresAt = parsed.data.expiresOn ? endOfArgentinaDay(parsed.data.expiresOn) : null
  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    return { error: 'La fecha de vencimiento tiene que ser futura.' }
  }

  const admin = await createAdminClient()
  const db = admin as any
  const { data: store, error: storeError } = await db
    .from('stores')
    .select('id')
    .eq('id', parsed.data.storeId)
    .maybeSingle()
  if (storeError || !store) return { error: 'No encontramos esa tienda.' }

  const { data: subscription, error: subscriptionError } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('store_id', parsed.data.storeId)
    .maybeSingle()
  if (subscriptionError) return { error: 'No pudimos comprobar la suscripción actual.' }

  const requiresProviderCheck = subscription && !(
    subscription.status === 'canceled' ||
    (subscription.status === 'not_started' && !subscription.provider_subscription_id)
  )
  if (requiresProviderCheck) {
    if (!subscription.provider_subscription_id) {
      return { error: 'La tienda tiene una suscripción en curso sin identificador de proveedor. Revisala antes de bonificar.' }
    }
    if (!isMercadoPagoConfigured()) {
      return { error: 'No podemos bonificar mientras exista un cobro recurrente sin poder cancelarlo en Mercado Pago.' }
    }

    try {
      await ensureMercadoPagoCancellation(
        parsed.data.storeId,
        {
          status: subscription.status,
          providerSubscriptionId: subscription.provider_subscription_id,
        },
        {
          getSubscription: getMercadoPagoSubscription,
          cancelSubscription: cancelMercadoPagoSubscription,
          persistSubscription: persistProviderSubscription,
        },
      )
    } catch {
      return { error: 'Mercado Pago no confirmó la cancelación. No aplicamos la bonificación para evitar un cobro accidental.' }
    }
  }

  const { error } = await db.from('billing_access_overrides').upsert({
    store_id: parsed.data.storeId,
    access_type: 'complimentary',
    is_enabled: true,
    expires_at: expiresAt,
    internal_note: parsed.data.note,
    updated_by: user.id,
  }, { onConflict: 'store_id' })

  if (error) return { error: `No pudimos guardar la bonificación: ${error.message}` }

  revalidatePath('/internal/billing')
  revalidatePath('/admin/plan')
  return { success: true }
}

export async function revokeComplimentaryAccess(storeId: string) {
  const user = await requireInternalAdmin()
  const parsed = storeSchema.safeParse(storeId)
  if (!parsed.success) return { error: 'Tienda inválida.' }

  const admin = await createAdminClient()
  const db = admin as any
  const { error } = await db
    .from('billing_access_overrides')
    .update({ is_enabled: false, updated_by: user.id })
    .eq('store_id', parsed.data)

  if (error) return { error: `No pudimos quitar la bonificación: ${error.message}` }

  revalidatePath('/internal/billing')
  revalidatePath('/admin/plan')
  return { success: true }
}
