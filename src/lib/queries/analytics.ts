import { createClient } from '@/lib/supabase/server'

export type StoreAnalyticsSummary = {
  visits: number
  productViews: number
  addToCart: number
  cartOpens: number
  whatsappClicks: number
  conversionRate: number
  topProduct: { id: string; name: string; views: number } | null
  hasData: boolean
  available: boolean
}

const EMPTY_ANALYTICS: StoreAnalyticsSummary = {
  visits: 0,
  productViews: 0,
  addToCart: 0,
  cartOpens: 0,
  whatsappClicks: 0,
  conversionRate: 0,
  topProduct: null,
  hasData: false,
  available: true,
}

export async function getStoreAnalytics(storeId: string): Promise<StoreAnalyticsSummary> {
  const supabase = await createClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events, error } = await supabase
    .from('store_events')
    .select('event_type, product_id')
    .eq('store_id', storeId)
    .gte('created_at', since)
    .limit(10000)

  if (error) {
    return { ...EMPTY_ANALYTICS, available: false }
  }

  const rows = events ?? []
  const visits = rows.filter((event) => event.event_type === 'store_view').length
  const productViews = rows.filter((event) => event.event_type === 'product_view').length
  const addToCart = rows.filter((event) => event.event_type === 'add_to_cart').length
  const cartOpens = rows.filter((event) => event.event_type === 'cart_open').length
  const whatsappClicks = rows.filter((event) => event.event_type === 'whatsapp_checkout').length
  const conversionRate = visits > 0 ? (whatsappClicks / visits) * 100 : 0

  const productViewCounts = new Map<string, number>()
  for (const event of rows) {
    if (event.event_type !== 'product_view' || !event.product_id) continue
    productViewCounts.set(event.product_id, (productViewCounts.get(event.product_id) ?? 0) + 1)
  }

  const topEntry = [...productViewCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  let topProduct: StoreAnalyticsSummary['topProduct'] = null

  if (topEntry) {
    const [productId, views] = topEntry
    const { data: product } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .eq('store_id', storeId)
      .maybeSingle()

    if (product) {
      topProduct = { id: product.id, name: product.name, views }
    }
  }

  return {
    visits,
    productViews,
    addToCart,
    cartOpens,
    whatsappClicks,
    conversionRate,
    topProduct,
    hasData: rows.length > 0,
    available: true,
  }
}
