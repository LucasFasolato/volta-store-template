import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import { isComplimentaryOverrideActive } from '@/lib/billing/access'
import { resolveCommercialAccess } from '@/lib/billing/commercial-access-core'
import type { CommercialPlanCode } from '@/lib/billing/plan'
import { summarizeUnitEconomics } from '@/lib/billing/unit-economics'

export type InternalBillingStore = {
  id: string
  name: string
  slug: string
  ownerEmail: string | null
  planCode: CommercialPlanCode
  planAccessUntil: string | null
  subscriptionStatus: string | null
  providerSubscriptionId: string | null
  currentAmount: number | null
  complimentary: boolean
  complimentaryUntil: string | null
  internalNote: string | null
  overrideUpdatedAt: string | null
}

export type InternalBillingEconomics = ReturnType<typeof summarizeUnitEconomics>

export async function getInternalBillingStores(): Promise<InternalBillingStore[]> {
  const admin = await createAdminClient()
  const db = admin as any
  const [storesResult, profilesResult, subscriptionsResult, overridesResult] = await Promise.all([
    db.from('stores').select('id, name, slug, owner_id, plan_code, plan_access_until, plan_grandfathered').order('created_at', { ascending: true }),
    db.from('profiles').select('id, email'),
    db.from('billing_subscriptions').select('store_id, plan_code, status, current_amount, provider_subscription_id'),
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
    const commercialAccess = resolveCommercialAccess({
      storePlanCode: store.plan_code,
      storeAccessUntil: store.plan_access_until || null,
      grandfathered: Boolean(store.plan_grandfathered),
      subscriptionPlanCode: subscription?.plan_code,
      subscriptionStatus: subscription?.status || null,
      complimentary: isComplimentaryOverrideActive(override),
      complimentaryUntil: override?.expires_at || null,
    })

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      ownerEmail: profiles.get(store.owner_id) || null,
      planCode: commercialAccess.planCode,
      planAccessUntil: commercialAccess.accessUntil,
      subscriptionStatus: subscription?.status || null,
      providerSubscriptionId: subscription?.provider_subscription_id || null,
      currentAmount: subscription?.current_amount == null ? null : Number(subscription.current_amount),
      complimentary: isComplimentaryOverrideActive(override),
      complimentaryUntil: override?.expires_at || null,
      internalNote: override?.internal_note || null,
      overrideUpdatedAt: override?.updated_at || null,
    }
  })
}

export async function getInternalBillingUnitEconomics(): Promise<InternalBillingEconomics> {
  const admin = await createAdminClient()
  const db = admin as any
  const { data, error } = await db
    .from('billing_payments')
    .select('amount, net_received_amount, processor_deductions_amount')
    .eq('payment_status', 'approved')

  if (error) throw new Error(`No pudimos calcular unit economics: ${error.message}`)
  return summarizeUnitEconomics((data || []).map((row: any) => ({
    amount: Number(row.amount),
    netReceivedAmount: row.net_received_amount == null ? null : Number(row.net_received_amount),
    processorDeductionsAmount: row.processor_deductions_amount == null ? null : Number(row.processor_deductions_amount),
  })))
}
