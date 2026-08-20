import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import { isComplimentaryOverrideActive } from '@/lib/billing/access'

export type InternalBillingStore = {
  id: string
  name: string
  slug: string
  ownerEmail: string | null
  subscriptionStatus: string | null
  providerSubscriptionId: string | null
  complimentary: boolean
  complimentaryUntil: string | null
  internalNote: string | null
  overrideUpdatedAt: string | null
}

export async function getInternalBillingStores(): Promise<InternalBillingStore[]> {
  const admin = await createAdminClient()
  const db = admin as any
  const [storesResult, profilesResult, subscriptionsResult, overridesResult] = await Promise.all([
    db.from('stores').select('id, name, slug, owner_id').order('created_at', { ascending: true }),
    db.from('profiles').select('id, email'),
    db.from('billing_subscriptions').select('store_id, status, provider_subscription_id'),
    db.from('billing_access_overrides').select('*'),
  ])

  for (const result of [storesResult, profilesResult, subscriptionsResult, overridesResult]) {
    if (result.error) throw new Error(`No pudimos cargar el control interno: ${result.error.message}`)
  }

  const profiles = new Map((profilesResult.data || []).map((row: any) => [row.id, row.email]))
  const subscriptions = new Map((subscriptionsResult.data || []).map((row: any) => [row.store_id, row]))
  const overrides = new Map((overridesResult.data || []).map((row: any) => [row.store_id, row]))

  return (storesResult.data || []).map((store: any) => {
    const subscription = subscriptions.get(store.id) as any
    const override = overrides.get(store.id) as any
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      ownerEmail: profiles.get(store.owner_id) || null,
      subscriptionStatus: subscription?.status || null,
      providerSubscriptionId: subscription?.provider_subscription_id || null,
      complimentary: isComplimentaryOverrideActive(override),
      complimentaryUntil: override?.expires_at || null,
      internalNote: override?.internal_note || null,
      overrideUpdatedAt: override?.updated_at || null,
    }
  })
}
