export type BillingStatus =
  | 'not_started'
  | 'creating'
  | 'pending'
  | 'active'
  | 'paused'
  | 'canceled'
  | 'error'

export type BillingSubscription = {
  id: string
  storeId: string
  providerSubscriptionId: string | null
  providerStatus: string | null
  status: BillingStatus
  payerEmail: string | null
  currency: string
  introPrice: number
  standardPrice: number
  introCyclesTotal: number
  introCyclesPaid: number
  currentAmount: number
  nextPaymentDate: string | null
  checkoutUrl: string | null
  priceUpgradedAt: string | null
  canceledAt: string | null
  lastError: string | null
  lastSyncedAt: string | null
  createdAt: string
  updatedAt: string
}

export type BillingPayment = {
  id: string
  providerInvoiceId: string
  providerPaymentId: string | null
  paymentStatus: string
  paymentStatusDetail: string | null
  amount: number
  currency: string
  debitDate: string | null
  paidAt: string | null
  createdAt: string
}

export type BillingAccess = {
  mode: 'subscription' | 'complimentary'
  hasAccess: boolean
  complimentaryUntil: string | null
}

export type BillingOverview = {
  subscription: BillingSubscription | null
  payments: BillingPayment[]
  access: BillingAccess
  providerConfigured: boolean
  webhookConfigured: boolean
}
