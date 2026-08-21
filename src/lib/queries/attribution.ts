import { trafficSourceLabel } from '@/lib/analytics/attribution'
import type { AnalyticsPeriodKey } from '@/lib/queries/analytics'
import { createClient } from '@/lib/supabase/server'

export type AttributionSourcePerformance = {
  source: string
  campaign: string | null
  label: string
  visits: number
  whatsapp: number
  conversionRate: number
}

export type AttributionPeriodSnapshot = {
  sources: AttributionSourcePerformance[]
  hasData: boolean
  hasAttributedData: boolean
}

export type StoreAttributionSummary = {
  periods: Record<AnalyticsPeriodKey, AttributionPeriodSnapshot>
  available: boolean
}

type AttributionEventRow = {
  event_type: 'store_view' | 'whatsapp_checkout'
  session_id: string | null
  traffic_source: string | null
  campaign: string | null
  created_at: string
}

type SourceAccumulator = {
  source: string
  campaign: string | null
  visits: Set<string>
  whatsapp: Set<string>
}

const DAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 1000

function emptyPeriod(): AttributionPeriodSnapshot {
  return { sources: [], hasData: false, hasAttributedData: false }
}

export async function getStoreAttribution(storeId: string): Promise<StoreAttributionSummary> {
  const supabase = await createClient()
  const db = supabase as any
  const now = new Date()
  const oldestNeeded = new Date(now.getTime() - 90 * DAY_MS).toISOString()
  const rows: AttributionEventRow[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from('store_events')
      .select('event_type, session_id, traffic_source, campaign, created_at')
      .eq('store_id', storeId)
      .in('event_type', ['store_view', 'whatsapp_checkout'])
      .gte('created_at', oldestNeeded)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    // During the additive rollout an older preview can point to a schema without
    // attribution columns. Hide only this panel instead of breaking Rendimiento.
    if (error) {
      return {
        periods: { '7d': emptyPeriod(), '30d': emptyPeriod(), '90d': emptyPeriod() },
        available: false,
      }
    }

    const page = (data ?? []) as AttributionEventRow[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  return {
    periods: {
      '7d': buildPeriod(rows, 7, now),
      '30d': buildPeriod(rows, 30, now),
      '90d': buildPeriod(rows, 90, now),
    },
    available: true,
  }
}

function buildPeriod(rows: AttributionEventRow[], days: number, now: Date): AttributionPeriodSnapshot {
  const start = now.getTime() - days * DAY_MS
  const accumulators = new Map<string, SourceAccumulator>()
  let fallbackSequence = 0

  for (const row of rows) {
    if (new Date(row.created_at).getTime() < start) continue

    const source = row.traffic_source || 'direct'
    const campaign = row.campaign || null
    const key = `${source}\u0000${campaign || ''}`
    const current = accumulators.get(key) ?? {
      source,
      campaign,
      visits: new Set<string>(),
      whatsapp: new Set<string>(),
    }
    const sessionKey = row.session_id || `anonymous:${row.created_at}:${fallbackSequence++}`

    if (row.event_type === 'store_view') current.visits.add(sessionKey)
    if (row.event_type === 'whatsapp_checkout') current.whatsapp.add(sessionKey)
    accumulators.set(key, current)
  }

  const sources = [...accumulators.values()]
    .map((item) => ({
      source: item.source,
      campaign: item.campaign,
      label: trafficSourceLabel(item.source, item.campaign),
      visits: item.visits.size,
      whatsapp: item.whatsapp.size,
      conversionRate: item.visits.size > 0 ? (item.whatsapp.size / item.visits.size) * 100 : 0,
    }))
    .sort((a, b) => b.visits - a.visits || b.whatsapp - a.whatsapp)
    .slice(0, 6)

  return {
    sources,
    hasData: sources.length > 0,
    hasAttributedData: sources.some((item) => item.source !== 'direct'),
  }
}
