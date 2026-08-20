export const VOLTA_BILLING_PLAN = {
  code: 'volta-monthly',
  name: 'VOLTA',
  currency: 'ARS',
  introAmount: 15000,
  standardAmount: 30000,
  introCycles: 3,
  frequency: 'monthly',
} as const

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
