'use client'

import { useEffect } from 'react'
import { trackSaasEvent } from '@/lib/analytics/saas-events'

const SHARE_ACTION_LABELS = ['copiar', 'whatsapp', 'compartir']

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function actionLocation(element: Element) {
  const label = normalizeLabel(element.textContent ?? '')
  if (label.includes('whatsapp')) return 'share_whatsapp'
  if (label.includes('campana')) return 'share_campaign_copy'
  if (label.includes('texto')) return 'share_message_copy'
  if (label.includes('compartir')) return 'share_native'
  if (label.includes('copiar')) return 'share_link_copy'
  return 'share_action'
}

export function ShareMilestoneTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return

      const action = target.closest('button, a')
      if (!action) return

      const label = normalizeLabel(action.textContent ?? '')
      if (!SHARE_ACTION_LABELS.some((needle) => label.includes(needle))) return

      // first_share means the merchant deliberately initiated distribution from
      // VOLTA (copy, WhatsApp or native share). It does not claim recipient
      // delivery or a completed sale.
      trackSaasEvent('first_share', {
        dedupeKey: 'first-share',
        ctaLocation: actionLocation(action),
      })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
