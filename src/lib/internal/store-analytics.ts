import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'

export type InternalStoreAnalyticsDays = 7 | 30 | 90

export type InternalStoreAnalyticsStore = {
  id: string
  name: string
  slug: string
  status: string
  isActive: boolean
  visits: number
  productViews: number
  addToCart: number
  cartOpens: number
  whatsapp: number
  conversionRate: number
  lastEventAt: string | null
}

export type InternalStoreAnalyticsSource = {
  source: string
  visits: number
  whatsapp: number
  conversionRate: number
}

export type InternalStoreAnalyticsDailyPoint = {
  date: string
  visits: number
  whatsapp: number
}

export type InternalStoreAnalyticsSnapshot = {
  days: InternalStoreAnalyticsDays
  since: string
  eventCount: number
  storesTotal: number
  activeStores: number
  storesWithTraffic: number
  visits: number
  productViews: number
  addToCart: number
  cartOpens: number
  whatsapp: number
  conversionRate: number
  stores: InternalStoreAnalyticsStore[]
  sources: InternalStoreAnalyticsSource[]
  daily: InternalStoreAnalyticsDailyPoint[]
}

type StoreRow = {
  id: string
  name: string
  slug: string
  status: string
  is_active: boolean
}

type EventType = 'store_view' | 'product_view' | 'add_to_cart' | 'cart_open' | 'whatsapp_checkout'

type EventRow = {
  id: string
  store_id: string
  event_type: EventType
  session_id: string | null
  traffic_source: string | null
  created_at: string
}

type StoreAccumulator = {
  visits: Set<string>
  productViews: number
  addToCart: number
  cartOpens: number
  whatsapp: Set<string>
  lastEventAt: string | null
}

type SourceAccumulator = {
  visits: Set<string>
  whatsapp: Set<string>
}

const PAGE_SIZE = 1000
const DAY_MS = 24 * 60 * 60 * 1000

export async function getInternalStoreAnalytics(days: InternalStoreAnalyticsDays): Promise<InternalStoreAnalyticsSnapshot> {
  const since = new Date(Date.now() - days * DAY_MS).toISOString()
  const supabase = await createAdminClient()

  const { data: storesData, error: storesError } = await supabase
    .from('stores')
    .select('id, name, slug, status, is_active')
    .order('created_at', { ascending: true })

  if (storesError) {
    throw new Error(`Failed to load stores for internal analytics: ${storesError.message}`)
  }

  const events: EventRow[] = []
  const storeEvents = supabase.from('store_events') as any

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await storeEvents
      .select('id, store_id, event_type, session_id, traffic_source, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`Failed to load store events for internal analytics: ${error.message}`)
    }

    const page = (data ?? []) as EventRow[]
    events.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  return buildInternalStoreAnalytics((storesData ?? []) as StoreRow[], events, days, since)
}

function buildInternalStoreAnalytics(
  stores: StoreRow[],
  events: EventRow[],
  days: InternalStoreAnalyticsDays,
  since: string,
): InternalStoreAnalyticsSnapshot {
  const byStore = new Map<string, StoreAccumulator>()
  const bySource = new Map<string, SourceAccumulator>()
  const globalVisits = new Set<string>()
  const globalWhatsapp = new Set<string>()
  const daily = buildEmptyDaily(days)
  const dailyByDate = new Map(daily.map((point) => [point.date, point]))

  let productViews = 0
  let addToCart = 0
  let cartOpens = 0

  for (const event of events) {
    const accumulator = byStore.get(event.store_id) ?? createStoreAccumulator()
    const sessionKey = `${event.store_id}:${event.session_id ?? event.id}`

    if (event.event_type === 'store_view') {
      accumulator.visits.add(sessionKey)
      globalVisits.add(sessionKey)
      const source = normalizeSource(event.traffic_source)
      const sourceAccumulator = bySource.get(source) ?? createSourceAccumulator()
      sourceAccumulator.visits.add(sessionKey)
      bySource.set(source, sourceAccumulator)

      const point = dailyByDate.get(event.created_at.slice(0, 10))
      if (point) point.visits += 1
    } else if (event.event_type === 'product_view') {
      accumulator.productViews += 1
      productViews += 1
    } else if (event.event_type === 'add_to_cart') {
      accumulator.addToCart += 1
      addToCart += 1
    } else if (event.event_type === 'cart_open') {
      accumulator.cartOpens += 1
      cartOpens += 1
    } else if (event.event_type === 'whatsapp_checkout') {
      accumulator.whatsapp.add(sessionKey)
      globalWhatsapp.add(sessionKey)
      const source = normalizeSource(event.traffic_source)
      const sourceAccumulator = bySource.get(source) ?? createSourceAccumulator()
      sourceAccumulator.whatsapp.add(sessionKey)
      bySource.set(source, sourceAccumulator)

      const point = dailyByDate.get(event.created_at.slice(0, 10))
      if (point) point.whatsapp += 1
    }

    if (!accumulator.lastEventAt || event.created_at > accumulator.lastEventAt) {
      accumulator.lastEventAt = event.created_at
    }

    byStore.set(event.store_id, accumulator)
  }

  const storeRows = stores
    .map((store): InternalStoreAnalyticsStore => {
      const accumulator = byStore.get(store.id) ?? createStoreAccumulator()
      const visits = accumulator.visits.size
      const whatsapp = accumulator.whatsapp.size

      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        status: store.status,
        isActive: store.is_active,
        visits,
        productViews: accumulator.productViews,
        addToCart: accumulator.addToCart,
        cartOpens: accumulator.cartOpens,
        whatsapp,
        conversionRate: visits > 0 ? (whatsapp / visits) * 100 : 0,
        lastEventAt: accumulator.lastEventAt,
      }
    })
    .sort((a, b) => b.visits - a.visits || b.whatsapp - a.whatsapp || a.name.localeCompare(b.name, 'es'))

  const sources = [...bySource.entries()]
    .map(([source, accumulator]): InternalStoreAnalyticsSource => ({
      source,
      visits: accumulator.visits.size,
      whatsapp: accumulator.whatsapp.size,
      conversionRate: accumulator.visits.size > 0
        ? (accumulator.whatsapp.size / accumulator.visits.size) * 100
        : 0,
    }))
    .sort((a, b) => b.visits - a.visits || b.whatsapp - a.whatsapp)
    .slice(0, 8)

  return {
    days,
    since,
    eventCount: events.length,
    storesTotal: stores.length,
    activeStores: stores.filter((store) => store.is_active).length,
    storesWithTraffic: storeRows.filter((store) => store.visits > 0).length,
    visits: globalVisits.size,
    productViews,
    addToCart,
    cartOpens,
    whatsapp: globalWhatsapp.size,
    conversionRate: globalVisits.size > 0 ? (globalWhatsapp.size / globalVisits.size) * 100 : 0,
    stores: storeRows,
    sources,
    daily,
  }
}

function createStoreAccumulator(): StoreAccumulator {
  return {
    visits: new Set<string>(),
    productViews: 0,
    addToCart: 0,
    cartOpens: 0,
    whatsapp: new Set<string>(),
    lastEventAt: null,
  }
}

function createSourceAccumulator(): SourceAccumulator {
  return {
    visits: new Set<string>(),
    whatsapp: new Set<string>(),
  }
}

function normalizeSource(source: string | null) {
  return source?.trim().toLowerCase() || 'directo / sin atribución'
}

function buildEmptyDaily(days: InternalStoreAnalyticsDays): InternalStoreAnalyticsDailyPoint[] {
  const points: InternalStoreAnalyticsDailyPoint[] = []
  const now = new Date()
  const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(anchor.getTime() - offset * DAY_MS)
    points.push({
      date: date.toISOString().slice(0, 10),
      visits: 0,
      whatsapp: 0,
    })
  }

  return points
}
