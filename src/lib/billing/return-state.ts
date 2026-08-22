import type { BillingOverview } from '@/lib/billing/types'

export type BillingReturnState = 'success' | 'pending' | 'canceled' | 'error'

export function resolveBillingReturnState(overview: BillingOverview, requestedKind?: string | null): BillingReturnState {
  if (requestedKind === 'canceled') return 'canceled'
  const status = overview.subscription?.status
  if (status === 'active') return 'success'
  if (status === 'canceled') return 'canceled'
  if (status === 'error') return 'error'
  return 'pending'
}
