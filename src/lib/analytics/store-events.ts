'use client'

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

const SESSION_KEY = 'volta-store-session-id'

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

export function trackStoreEvent({ storeId, type, productId = null, dedupeKey }: TrackStoreEventInput) {
  if (typeof window === 'undefined' || !storeId) return

  const storageKey = dedupeKey ? `volta:event:${storeId}:${dedupeKey}` : null
  if (storageKey && window.sessionStorage.getItem(storageKey)) return

  const supabase = createClient()
  const sessionId = getSessionId()

  void supabase
    .from('store_events')
    .insert({
      store_id: storeId,
      event_type: type,
      product_id: productId,
      session_id: sessionId,
    })
    .then(({ error }) => {
      if (!error && storageKey) {
        window.sessionStorage.setItem(storageKey, '1')
      }
    })
}
