export type CommercialPlanCode = 'free' | 'volta' | 'pro'

export const FREE_PLAN = {
  code: 'free',
  name: 'Gratis',
  currency: 'ARS',
  monthlyAmount: 0,
  productLimit: 10,
  imagesPerProductLimit: 1,
} as const

export const VOLTA_BILLING_PLAN = {
  code: 'volta',
  name: 'VOLTA',
  currency: 'ARS',
  introAmount: 15000,
  standardAmount: 30000,
  introCycles: 3,
  frequency: 'monthly',
} as const

export const VOLTA_PRO_PLAN = {
  code: 'pro',
  name: 'VOLTA PRO',
  currency: 'ARS',
  introAmount: 70000,
  standardAmount: 70000,
  introCycles: 0,
  frequency: 'monthly',
} as const

export type PaidPlanCode = typeof VOLTA_BILLING_PLAN.code | typeof VOLTA_PRO_PLAN.code

export function normalizeCommercialPlan(value: unknown): CommercialPlanCode {
  return value === 'pro' || value === 'volta' ? value : 'free'
}

export function isPaidPlan(value: unknown): value is PaidPlanCode {
  return value === 'volta' || value === 'pro'
}

export function getPaidPlanDefinition(planCode: PaidPlanCode) {
  return planCode === 'pro' ? VOLTA_PRO_PLAN : VOLTA_BILLING_PLAN
}

export function formatBillingAmount(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: VOLTA_BILLING_PLAN.currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatBillingDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
