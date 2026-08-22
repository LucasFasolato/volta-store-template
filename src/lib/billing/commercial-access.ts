import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import { isComplimentaryOverrideActive } from '@/lib/billing/access'
import { resolveCommercialAccess, type CommercialAccess } from '@/lib/billing/commercial-access-core'

export async function getStoreCommercialAccess(storeId: string): Promise<CommercialAccess> {
  const admin = await createAdminClient()
  const db = admin as any
  const [storeResult, subscriptionResult, overrideResult] = await Promise.all([
    db.from('stores').select('plan_code, plan_access_until, plan_grandfathered').eq('id', storeId).maybeSingle(),
    db.from('billing_subscriptions').select('plan_code, status').eq('store_id', storeId).maybeSingle(),
    db.from('billing_access_overrides').select('store_id, access_type, is_enabled, expires_at').eq('store_id', storeId).maybeSingle(),
  ])

  if (storeResult.error) throw new Error(`No pudimos leer tu plan: ${storeResult.error.message}`)
  if (subscriptionResult.error) throw new Error(`No pudimos leer tu suscripción: ${subscriptionResult.error.message}`)
  if (overrideResult.error) throw new Error(`No pudimos leer tu acceso comercial: ${overrideResult.error.message}`)

  const override = overrideResult.data
  return resolveCommercialAccess({
    storePlanCode: storeResult.data?.plan_code,
    storeAccessUntil: storeResult.data?.plan_access_until ?? null,
    grandfathered: Boolean(storeResult.data?.plan_grandfathered),
    subscriptionPlanCode: subscriptionResult.data?.plan_code,
    subscriptionStatus: subscriptionResult.data?.status ?? null,
    complimentary: isComplimentaryOverrideActive(override),
    complimentaryUntil: override?.expires_at ?? null,
  })
}
