'use client'

import { parseStoreAttribution } from '@/lib/analytics/attribution'
import { createClient } from '@/lib/supabase/client'

export type StoreEventType =
  | 'store_view'
  | 'product_view'
  | 'add_to_cart'
  | 'cart_open'
  | 'whatsapp_checkout'

type TrackStoreEventInput = {
  storeId: string
  type: StoreEventType
  productId?: string | null
  dedupeKey?: string
}

type SessionAttribution = {
  source: string | null
  campaign: string | null
}

const SESSION_KEY = 'volta-store-session-id'
const ATTRIBUTION_KEY = 'volta-store-attribution'

function getSessionId() {
  if (typeof window === 'undefined') return null

  let sessionId = window.sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

function getSessionAttribution(): SessionAttribution {
  if (typeof window === 'undefined') return { source: null, campaign: null }

  const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as SessionAttribution
      return {
        source: typeof parsed.source === 'string' ? parsed.source : null,
        campaign: typeof parsed.campaign === 'string' ? parsed.campaign : null,
      }
    } catch {
      window.sessionStorage.removeItem(ATTRIBUTION_KEY)
    }
  }

  const explicit = parseStoreAttribution(window.location.search)
  const attribution: SessionAttribution = explicit
    ? { source: explicit.source, campaign: explicit.campaign }
    : { source: null, campaign: null }

  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
  return attribution
}

function isMissingAttributionColumn(error: { message?: string | null }) {
  const message = error.message?.toLowerCase() || ''
  return message.includes('traffic_source') || message.includes('campaign')
}

export function trackStoreEvent({ storeId, type, productId = null, dedupeKey }: TrackStoreEventInput) {
  if (typeof window === 'undefined' || !storeId) return

  const storageKey = dedupeKey ? `volta:event:${storeId}:${dedupeKey}` : null
  if (storageKey && window.sessionStorage.getItem(storageKey)) return

  const supabase = createClient()
  // The additive migration is already live; keep this narrow cast until the next
  // generated Database type refresh so preview rollouts remain backward-safe.
  const events = supabase.from('store_events') as any
  const sessionId = getSessionId()
  const attribution = getSessionAttribution()
  const basePayload = {
    store_id: storeId,
    event_type: type,
    product_id: productId,
    session_id: sessionId,
  }

  void events
    .insert({
      ...basePayload,
      traffic_source: attribution.source,
      campaign: attribution.campaign,
    })
    .then(async ({ error }: { error: { message?: string | null } | null }) => {
      let finalError = error

      // Preview deployments can briefly run before the additive migration reaches
      // their connected database. Keep analytics alive during that safe rollout window.
      if (error && isMissingAttributionColumn(error)) {
        const fallback = await events.insert(basePayload)
        finalError = fallback.error
      }

      if (!finalError && storageKey) {
        window.sessionStorage.setItem(storageKey, '1')
      }
    })
}
