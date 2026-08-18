import { createClient } from '@/lib/supabase/server'
import type { ProductWithImages } from '@/types/store'

export type AnalyticsPeriodKey = '7d' | '30d' | '90d'

export type AnalyticsComparableMetric = {
  value: number
  previousValue: number
  changePercent: number | null
}

export type AnalyticsDailyPoint = {
  date: string
  visits: number
  whatsapp: number
}

export type AnalyticsProductPerformance = {
  id: string
  name: string
  imageUrl: string | null
  views: number
  addToCart: number
  cartRate: number
}

export type AnalyticsCategoryPerformance = {
  id: string
  name: string
  views: number
  addToCart: number
}

export type AnalyticsInsight = {
  tone: 'positive' | 'opportunity'
  title: string
  body: string
}

export type StoreAnalyticsSnapshot = {
  days: number
  visits: AnalyticsComparableMetric
  productViews: AnalyticsComparableMetric
  addToCart: AnalyticsComparableMetric
  whatsappClicks: AnalyticsComparableMetric
  conversionRate: number
  daily: AnalyticsDailyPoint[]
  topProducts: AnalyticsProductPerformance[]
  topCategory: AnalyticsCategoryPerformance | null
  insight: AnalyticsInsight | null
  hasData: boolean
}

export type StoreAnalyticsSummary = {
  periods: Record<AnalyticsPeriodKey, StoreAnalyticsSnapshot>
  hasData: boolean
  available: boolean
}

type AnalyticsEventRow = {
  event_type: 'store_view' | 'product_view' | 'add_to_cart' | 'cart_open' | 'whatsapp_checkout'
  product_id: string | null
  session_id: string | null
  created_at: string
}

type ProductAccumulator = {
  views: number
  addToCart: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 1000

function emptyMetric(): AnalyticsComparableMetric {
  return { value: 0, previousValue: 0, changePercent: 0 }
}

function emptySnapshot(days: number): StoreAnalyticsSnapshot {
  return {
    days,
    visits: emptyMetric(),
    productViews: emptyMetric(),
    addToCart: emptyMetric(),
    whatsappClicks: emptyMetric(),
    conversionRate: 0,
    daily: buildEmptyDailySeries(days, new Date()),
    topProducts: [],
    topCategory: null,
    insight: null,
    hasData: false,
  }
}

const EMPTY_ANALYTICS: StoreAnalyticsSummary = {
  periods: {
    '7d': emptySnapshot(7),
    '30d': emptySnapshot(30),
    '90d': emptySnapshot(90),
  },
  hasData: false,
  available: true,
}

export async function getStoreAnalytics(
  storeId: string,
  products: ProductWithImages[],
): Promise<StoreAnalyticsSummary> {
  const supabase = await createClient()
  const now = new Date()
  const oldestNeeded = new Date(now.getTime() - 180 * DAY_MS).toISOString()
  const rows: AnalyticsEventRow[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('store_events')
      .select('event_type, product_id, session_id, created_at')
      .eq('store_id', storeId)
      .gte('created_at', oldestNeeded)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      return { ...EMPTY_ANALYTICS, available: false }
    }

    const page = (data ?? []) as AnalyticsEventRow[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const periods: StoreAnalyticsSummary['periods'] = {
    '7d': buildSnapshot(rows, 7, now, productMap),
    '30d': buildSnapshot(rows, 30, now, productMap),
    '90d': buildSnapshot(rows, 90, now, productMap),
  }

  return {
    periods,
    hasData: rows.length > 0,
    available: true,
  }
}

function buildSnapshot(
  rows: AnalyticsEventRow[],
  days: number,
  now: Date,
  productMap: Map<string, ProductWithImages>,
): StoreAnalyticsSnapshot {
  const nowMs = now.getTime()
  const currentStart = nowMs - days * DAY_MS
  const previousStart = currentStart - days * DAY_MS

  const currentRows: AnalyticsEventRow[] = []
  const previousRows: AnalyticsEventRow[] = []

  for (const row of rows) {
    const time = new Date(row.created_at).getTime()
    if (time >= currentStart && time <= nowMs) currentRows.push(row)
    else if (time >= previousStart && time < currentStart) previousRows.push(row)
  }

  const currentVisits = countType(currentRows, 'store_view')
  const currentProductViews = countType(currentRows, 'product_view')
  const currentAddToCart = countType(currentRows, 'add_to_cart')
  const currentWhatsapp = countType(currentRows, 'whatsapp_checkout')

  const previousVisits = countType(previousRows, 'store_view')
  const previousProductViews = countType(previousRows, 'product_view')
  const previousAddToCart = countType(previousRows, 'add_to_cart')
  const previousWhatsapp = countType(previousRows, 'whatsapp_checkout')

  const visitSessions = countUniqueSessions(currentRows, 'store_view')
  const whatsappSessions = countUniqueSessions(currentRows, 'whatsapp_checkout')
  const topProducts = buildTopProducts(currentRows, productMap)
  const topCategory = buildTopCategory(currentRows, productMap)
  const whatsappMetric = comparableMetric(currentWhatsapp, previousWhatsapp)

  return {
    days,
    visits: comparableMetric(currentVisits, previousVisits),
    productViews: comparableMetric(currentProductViews, previousProductViews),
    addToCart: comparableMetric(currentAddToCart, previousAddToCart),
    whatsappClicks: whatsappMetric,
    conversionRate: visitSessions > 0 ? (whatsappSessions / visitSessions) * 100 : 0,
    daily: buildDailySeries(currentRows, days, now),
    topProducts,
    topCategory,
    insight: buildInsight(topProducts, whatsappMetric),
    hasData: currentRows.length > 0,
  }
}

function comparableMetric(value: number, previousValue: number): AnalyticsComparableMetric {
  if (previousValue === 0) {
    return {
      value,
      previousValue,
      changePercent: value === 0 ? 0 : null,
    }
  }

  return {
    value,
    previousValue,
    changePercent: ((value - previousValue) / previousValue) * 100,
  }
}

function countType(rows: AnalyticsEventRow[], type: AnalyticsEventRow['event_type']) {
  let count = 0
  for (const row of rows) {
    if (row.event_type === type) count += 1
  }
  return count
}

function countUniqueSessions(rows: AnalyticsEventRow[], type: AnalyticsEventRow['event_type']) {
  const sessions = new Set<string>()
  let anonymousWithoutSession = 0

  for (const row of rows) {
    if (row.event_type !== type) continue
    if (row.session_id) sessions.add(row.session_id)
    else anonymousWithoutSession += 1
  }

  return sessions.size + anonymousWithoutSession
}

function buildTopProducts(
  rows: AnalyticsEventRow[],
  productMap: Map<string, ProductWithImages>,
): AnalyticsProductPerformance[] {
  const counts = new Map<string, ProductAccumulator>()

  for (const row of rows) {
    if (!row.product_id || (row.event_type !== 'product_view' && row.event_type !== 'add_to_cart')) continue
    const current = counts.get(row.product_id) ?? { views: 0, addToCart: 0 }
    if (row.event_type === 'product_view') current.views += 1
    if (row.event_type === 'add_to_cart') current.addToCart += 1
    counts.set(row.product_id, current)
  }

  const products: AnalyticsProductPerformance[] = []

  for (const [productId, count] of counts.entries()) {
    const product = productMap.get(productId)
    if (!product) continue

    products.push({
      id: product.id,
      name: product.name,
      imageUrl: product.images?.[0]?.url ?? null,
      views: count.views,
      addToCart: count.addToCart,
      cartRate: count.views > 0 ? (count.addToCart / count.views) * 100 : 0,
    })
  }

  return products
    .sort((a, b) => b.views - a.views || b.addToCart - a.addToCart)
    .slice(0, 5)
}

function buildTopCategory(
  rows: AnalyticsEventRow[],
  productMap: Map<string, ProductWithImages>,
): AnalyticsCategoryPerformance | null {
  const counts = new Map<string, AnalyticsCategoryPerformance>()

  for (const row of rows) {
    if (!row.product_id || (row.event_type !== 'product_view' && row.event_type !== 'add_to_cart')) continue
    const category = productMap.get(row.product_id)?.category
    if (!category) continue

    const current = counts.get(category.id) ?? {
      id: category.id,
      name: category.name,
      views: 0,
      addToCart: 0,
    }

    if (row.event_type === 'product_view') current.views += 1
    if (row.event_type === 'add_to_cart') current.addToCart += 1
    counts.set(category.id, current)
  }

  return [...counts.values()].sort((a, b) => b.views - a.views || b.addToCart - a.addToCart)[0] ?? null
}

function buildInsight(
  topProducts: AnalyticsProductPerformance[],
  whatsapp: AnalyticsComparableMetric,
): AnalyticsInsight | null {
  const opportunity = topProducts.find((product) => product.views >= 5 && product.cartRate < 8)
  if (opportunity) {
    return {
      tone: 'opportunity',
      title: 'Mucho interés, pocos carritos',
      body: `${opportunity.name} recibió ${opportunity.views} vistas y ${opportunity.addToCart} agregados al carrito. Puede valer la pena revisar precio, fotos o información.`,
    }
  }

  const strongestProduct = [...topProducts].sort((a, b) => b.addToCart - a.addToCart)[0]
  if (strongestProduct && strongestProduct.addToCart >= 2) {
    return {
      tone: 'positive',
      title: 'Producto con mejor intención de compra',
      body: `${strongestProduct.name} es el producto que más veces agregaron al carrito en este período.`,
    }
  }

  if (whatsapp.value >= 2 && whatsapp.changePercent != null && whatsapp.changePercent >= 20) {
    return {
      tone: 'positive',
      title: 'Más personas avanzan a WhatsApp',
      body: `Los pedidos a WhatsApp subieron ${Math.round(whatsapp.changePercent)}% frente al período anterior.`,
    }
  }

  return null
}

function buildDailySeries(rows: AnalyticsEventRow[], days: number, now: Date): AnalyticsDailyPoint[] {
  const points = buildEmptyDailySeries(days, now)
  const byDate = new Map(points.map((point) => [point.date, point]))

  for (const row of rows) {
    if (row.event_type !== 'store_view' && row.event_type !== 'whatsapp_checkout') continue
    const key = row.created_at.slice(0, 10)
    const point = byDate.get(key)
    if (!point) continue
    if (row.event_type === 'store_view') point.visits += 1
    if (row.event_type === 'whatsapp_checkout') point.whatsapp += 1
  }

  return points
}

function buildEmptyDailySeries(days: number, now: Date): AnalyticsDailyPoint[] {
  const points: AnalyticsDailyPoint[] = []
  const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(anchor.getTime() - offset * DAY_MS)
    points.push({ date: date.toISOString().slice(0, 10), visits: 0, whatsapp: 0 })
  }

  return points
}
