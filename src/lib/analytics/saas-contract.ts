export const SAAS_FUNNEL_EVENT_TYPES = [
  'landing_view',
  'landing_primary_cta_click',
  'landing_real_store_click',
  'landing_pricing_view',
  'landing_free_cta_click',
  'landing_volta_cta_click',
  'landing_pro_cta_click',
  'signup_started',
  'signup_completed',
  'store_created',
  'first_product',
  'published',
  'first_share',
] as const

export type SaasFunnelEventType = (typeof SAAS_FUNNEL_EVENT_TYPES)[number]

export const CLIENT_SAAS_FUNNEL_EVENT_TYPES = [
  'landing_view',
  'landing_primary_cta_click',
  'landing_real_store_click',
  'landing_pricing_view',
  'landing_free_cta_click',
  'landing_volta_cta_click',
  'landing_pro_cta_click',
  'signup_started',
  'first_share',
] as const satisfies readonly SaasFunnelEventType[]

export type ClientSaasFunnelEventType = (typeof CLIENT_SAAS_FUNNEL_EVENT_TYPES)[number]

export const SAAS_SESSION_COOKIE = 'volta-saas-session-id'
export const SAAS_SOURCE_COOKIE = 'volta-saas-source'
export const SAAS_CAMPAIGN_COOKIE = 'volta-saas-campaign'

export const SAAS_SESSION_MAX_LENGTH = 120
export const SAAS_SOURCE_MAX_LENGTH = 64
export const SAAS_CAMPAIGN_MAX_LENGTH = 80

export function normalizeSaasToken(value: string | null | undefined, maxLength: number) {
  if (!value) return null
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, maxLength)

  return normalized || null
}

export function isValidSaasSessionId(value: string | null | undefined) {
  return Boolean(
    value &&
      value.length >= 8 &&
      value.length <= SAAS_SESSION_MAX_LENGTH &&
      /^[a-zA-Z0-9-]+$/.test(value),
  )
}
