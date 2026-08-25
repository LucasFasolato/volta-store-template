'use client'

export type SaasFunnelEventType =
  | 'landing_view'
  | 'landing_primary_cta_click'
  | 'landing_real_store_click'
  | 'landing_pricing_view'
  | 'landing_free_cta_click'
  | 'landing_volta_cta_click'
  | 'landing_pro_cta_click'
  | 'signup_started'

type TrackSaasEventOptions = {
  ctaLocation?: string | null
  plan?: 'free' | 'volta' | 'pro' | null
  dedupeKey?: string
}

type Attribution = {
  source: string | null
  campaign: string | null
}

const SESSION_KEY = 'volta-saas-session-id'
const ATTRIBUTION_KEY = 'volta-saas-attribution'
const EVENT_PREFIX = 'volta:saas:event:'

function normalize(value: string | null, maxLength: number) {
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

function getSessionId() {
  let sessionId = window.sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

function getAttribution(): Attribution {
  const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Attribution
      return {
        source: typeof parsed.source === 'string' ? parsed.source : null,
        campaign: typeof parsed.campaign === 'string' ? parsed.campaign : null,
      }
    } catch {
      window.sessionStorage.removeItem(ATTRIBUTION_KEY)
    }
  }

  const params = new URLSearchParams(window.location.search)
  const attribution: Attribution = {
    source: normalize(params.get('src') || params.get('utm_source'), 64),
    campaign: normalize(params.get('campaign') || params.get('utm_campaign'), 80),
  }
  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
  return attribution
}

function deviceLabel(width: number) {
  if (width < 768) return 'mobile'
  if (width < 1100) return 'tablet'
  return 'desktop'
}

export function trackSaasEvent(type: SaasFunnelEventType, options: TrackSaasEventOptions = {}) {
  if (typeof window === 'undefined') return

  const storageKey = options.dedupeKey ? `${EVENT_PREFIX}${options.dedupeKey}` : null
  if (storageKey && window.sessionStorage.getItem(storageKey)) return

  const attribution = getAttribution()
  const payload = {
    event_type: type,
    session_id: getSessionId(),
    traffic_source: attribution.source,
    campaign: attribution.campaign,
    device: deviceLabel(window.innerWidth),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    cta_location: options.ctaLocation ?? null,
    plan: options.plan ?? null,
    path: window.location.pathname,
  }

  void fetch('/api/analytics/saas', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).then((response) => {
    if (response.ok && storageKey) window.sessionStorage.setItem(storageKey, '1')
  }).catch(() => null)
}
