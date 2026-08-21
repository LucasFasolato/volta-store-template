import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCommercialOpportunities } from './commercial-insights.ts'

function snapshot(overrides = {}) {
  return {
    days: 30,
    visits: { value: 20, previousValue: 10, changePercent: 100 },
    productViews: { value: 12, previousValue: 8, changePercent: 50 },
    addToCart: { value: 3, previousValue: 1, changePercent: 200 },
    whatsappClicks: { value: 1, previousValue: 0, changePercent: null },
    conversionRate: 5,
    daily: [],
    topProducts: [],
    topCategory: null,
    insight: null,
    hasData: true,
    ...overrides,
  }
}

test('flags a high-interest product with weak cart conversion', () => {
  const opportunities = buildCommercialOpportunities(snapshot({
    topProducts: [{ id: 'p1', name: 'Producto A', imageUrl: null, views: 20, addToCart: 1, cartRate: 5 }],
  }))
  assert.equal(opportunities[0].tone, 'opportunity')
  assert.match(opportunities[0].title, /Producto A/)
})

test('flags cart intent that never reaches WhatsApp', () => {
  const opportunities = buildCommercialOpportunities(snapshot({ whatsappClicks: { value: 0, previousValue: 0, changePercent: 0 } }))
  assert.ok(opportunities.some((item) => item.id === 'cart-without-whatsapp'))
})

test('surfaces a strong product as a sharing opportunity', () => {
  const opportunities = buildCommercialOpportunities(snapshot({
    topProducts: [{ id: 'p2', name: 'Ganador', imageUrl: null, views: 8, addToCart: 4, cartRate: 50 }],
  }))
  assert.ok(opportunities.some((item) => item.id === 'strong-product:p2' && item.tone === 'positive'))
})

test('returns a neutral signal when data exists but no strong pattern does', () => {
  const opportunities = buildCommercialOpportunities(snapshot({
    visits: { value: 2, previousValue: 0, changePercent: null },
    productViews: { value: 1, previousValue: 0, changePercent: null },
    addToCart: { value: 0, previousValue: 0, changePercent: 0 },
    whatsappClicks: { value: 0, previousValue: 0, changePercent: 0 },
    conversionRate: 0,
  }))
  assert.deepEqual(opportunities.map((item) => item.id), ['collect-more-signal'])
})
