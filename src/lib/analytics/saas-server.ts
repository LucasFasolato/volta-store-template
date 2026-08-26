import 'server-only'

import { cookies } from 'next/headers'
import {
  SAAS_CAMPAIGN_COOKIE,
  SAAS_CAMPAIGN_MAX_LENGTH,
  SAAS_SESSION_COOKIE,
  SAAS_SOURCE_COOKIE,
  SAAS_SOURCE_MAX_LENGTH,
  isValidSaasSessionId,
  normalizeSaasToken,
} from '@/lib/analytics/saas-contract'
import { createAdminClient } from '@/lib/supabase/server'

export type ServerSaasMilestoneEvent =
  | 'signup_completed'
  | 'store_created'
  | 'first_product'
  | 'published'

type RecordSaasMilestoneInput = {
  eventType: ServerSaasMilestoneEvent
  userId: string
  storeId?: string | null
  path: string
  ctaLocation?: string | null
  plan?: 'free' | 'volta' | 'pro' | null
}

function fallbackSessionId(userId: string) {
  return `auth-${userId}`
}

export async function recordSaasMilestone({
  eventType,
  userId,
  storeId = null,
  path,
  ctaLocation = null,
  plan = null,
}: RecordSaasMilestoneInput) {
  const cookieStore = await cookies()
  const cookieSessionId = cookieStore.get(SAAS_SESSION_COOKIE)?.value ?? null
  const sessionId = isValidSaasSessionId(cookieSessionId)
    ? cookieSessionId!
    : fallbackSessionId(userId)

  const trafficSource = normalizeSaasToken(
    cookieStore.get(SAAS_SOURCE_COOKIE)?.value,
    SAAS_SOURCE_MAX_LENGTH,
  )
  const campaign = normalizeSaasToken(
    cookieStore.get(SAAS_CAMPAIGN_COOKIE)?.value,
    SAAS_CAMPAIGN_MAX_LENGTH,
  )

  const supabase = await createAdminClient()
  // Generated Database types are refreshed after the migration lands. Keep the
  // service-role write isolated here in the meantime.
  const events = supabase.from('saas_funnel_events' as never) as any
  const { error } = await events.insert({
    event_type: eventType,
    session_id: sessionId,
    traffic_source: trafficSource,
    campaign,
    device: null,
    viewport_width: null,
    viewport_height: null,
    cta_location: ctaLocation,
    plan,
    path,
    user_id: userId,
    store_id: storeId,
  })

  if (!error || error.code === '23505') {
    return { ok: true as const, duplicate: error?.code === '23505' }
  }

  console.warn('Failed to record VOLTA SaaS activation milestone.', {
    eventType,
    code: error.code ?? null,
    message: error.message,
  })
  return { ok: false as const }
}
