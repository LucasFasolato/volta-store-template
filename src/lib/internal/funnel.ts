import 'server-only'

import {
  buildActivationFunnel,
  type ActivationFunnelEvent,
} from '@/lib/analytics/activation-funnel'
import { createAdminClient } from '@/lib/supabase/server'

export type InternalFunnelDays = 7 | 30 | 90

export async function getInternalActivationFunnel(days: InternalFunnelDays) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const supabase = await createAdminClient()
  const events = supabase.from('saas_funnel_events' as never) as any

  const { data, error } = await events
    .select('event_type, session_id, user_id, store_id, traffic_source, campaign, device, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(10_000)

  if (error) {
    throw new Error(`Failed to load internal activation funnel: ${error.message}`)
  }

  const rows = (data ?? []) as ActivationFunnelEvent[]
  return {
    days,
    since,
    eventCount: rows.length,
    snapshot: buildActivationFunnel(rows),
  }
}
