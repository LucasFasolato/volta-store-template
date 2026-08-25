'use client'

import { useEffect } from 'react'
import { trackSaasEvent } from '@/lib/analytics/saas-events'

export function SignupStartTracker() {
  useEffect(() => {
    trackSaasEvent('signup_started', { dedupeKey: 'signup-started', ctaLocation: 'login' })
  }, [])

  return null
}
