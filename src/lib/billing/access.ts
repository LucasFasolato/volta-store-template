import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import type { BillingAccess, BillingSubscription } from '@/lib/billing/types'

type BillingAccessOverrideRow = {
  store_id: string
  access_type: 'complimentary'
  is_enabled: boolean
  expires_at: string | null
}

export function isComplimentaryOverrideActive(
  row: BillingAccessOverrideRow | null | undefined,
  now = new Date(),
) {
  if (!row?.is_enabled || row.access_type !== 'complimentary') return false
  if (!row.expires_at) return true
  const expiresAt = Date.parse(row.expires_at)
  return Number.isFinite(expiresAt) && expiresAt > now.getTime()
}

export function buildBillingAccess(
  override: BillingAccessOverrideRow | null | undefined,
  subscription: BillingSubscription | null,
): BillingAccess {
  const complimentary = isComplimentaryOverrideActive(override)
  if (complimentary) {
    return {
      mode: 'complimentary',
      hasAccess: true,
      complimentaryUntil: override?.expires_at || null,
    }
  }

  return {
    mode: 'subscription',
    hasAccess: subscription?.status === 'active',
    complimentaryUntil: null,
  }
}

export async function getBillingAccessOverride(storeId: string) {
  const admin = await createAdminClient()
  const db = admin as any
  const { data, error } = await db
    .from('billing_access_overrides')
    .select('store_id, access_type, is_enabled, expires_at')
    .eq('store_id', storeId)
    .maybeSingle()

  if (error) throw new Error(`No pudimos leer el acceso comercial: ${error.message}`)
  return data as BillingAccessOverrideRow | null
}

export async function hasActiveComplimentaryAccess(storeId: string) {
  return isComplimentaryOverrideActive(await getBillingAccessOverride(storeId))
}

export function isBillingEnforcementEnabled() {
  return process.env.VOLTA_BILLING_ENFORCEMENT?.trim().toLowerCase() === 'true'
}
