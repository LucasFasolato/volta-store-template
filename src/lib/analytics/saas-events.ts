'use client'

import {
  SAAS_CAMPAIGN_COOKIE,
  SAAS_CAMPAIGN_MAX_LENGTH,
  SAAS_SESSION_COOKIE,
  SAAS_SOURCE_COOKIE,
  SAAS_SOURCE_MAX_LENGTH,
  normalizeSaasToken,
  type ClientSaasFunnelEventType,
} from '@/lib/analytics/saas-contract'

type TrackSaasEventOptions = {
  ctaLocation?: string | null
  plan?: 'free' | 'volta' | 'pro' | null
  dedupeKey?: string
}

type Attribution = {
  source: string | null
  campaign: string | null
}

const ATTRIBUTION_KEY = 'volta-saas-attribution'
const EVENT_PREFIX = 'volta:saas:event:'

function persistSessionCookie(name: string, value: string | null) {
  if (!value) return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`
}

function getSessionId() {
  let sessionId = window.sessionStorage.getItem(SAAS_SESSION_COOKIE)
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(SAAS_SESSION_COOKIE, sessionId)
  }

  persistSessionCookie(SAAS_SESSION_COOKIE, sessionId)
  return sessionId
}

function persistAttributionCookies(attribution: Attribution) {
  persistSessionCookie(SAAS_SOURCE_COOKIE, attribution.source)
  persistSessionCookie(SAAS_CAMPAIGN_COOKIE, attribution.campaign)
}

function getAttribution(): Attribution {
  const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Attribution
      const attribution = {
        source: typeof parsed.source === 'string' ? parsed.source : null,
        campaign: typeof parsed.campaign === 'string' ? parsed.campaign : null,
      }
      persistAttributionCookies(attribution)
      return attribution
    } catch {
      window.sessionStorage.removeItem(ATTRIBUTION_KEY)
    }
  }

  const params = new URLSearchParams(window.location.search)
  const attribution: Attribution = {
    source: normalizeSaasToken(params.get('src') || params.get('utm_source'), SAAS_SOURCE_MAX_LENGTH),
    campaign: normalizeSaasToken(params.get('campaign') || params.get('utm_campaign'), SAAS_CAMPAIGN_MAX_LENGTH),
  }
  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
  persistAttributionCookies(attribution)
  return attribution
}

function deviceLabel(width: number) {
  if (width < 768) return 'mobile'
  if (width < 1100) return 'tablet'
  return 'desktop'
}

export function trackSaasEvent(type: ClientSaasFunnelEventType, options: TrackSaasEventOptions = {}) {
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
