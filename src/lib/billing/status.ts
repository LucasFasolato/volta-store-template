import type { BillingStatus } from '@/lib/billing/types'

export function normalizeProviderBillingStatus(status: string | null | undefined): BillingStatus {
  switch ((status || '').toLowerCase()) {
    case 'authorized':
      return 'active'
    case 'pending':
      return 'pending'
    case 'paused':
      return 'paused'
    case 'canceled':
    case 'cancelled':
      return 'canceled'
    case '':
      return 'pending'
    default:
      return 'error'
  }
}
