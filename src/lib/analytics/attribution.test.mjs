import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStoreAttribution, trafficSourceLabel } from './attribution.ts'

test('reads VOLTA source and campaign parameters', () => {
  assert.deepEqual(
    parseStoreAttribution('?src=instagram&campaign=Promo%20Agosto'),
    { source: 'instagram', campaign: 'promo-agosto' },
  )
})

test('accepts standard UTM parameters as an external compatibility path', () => {
  assert.deepEqual(
    parseStoreAttribution('?utm_source=facebook&utm_campaign=Vuelta%20a%20Clases'),
    { source: 'facebook', campaign: 'vuelta-a-clases' },
  )
})

test('ignores a campaign when there is no source', () => {
  assert.equal(parseStoreAttribution('?campaign=promo'), null)
})

test('sanitizes attribution values to database-safe tokens', () => {
  assert.deepEqual(
    parseStoreAttribution('?src=Instagram%20Stories!!&campaign=Ni%C3%B1os%20%26%20Cole'),
    { source: 'instagram-stories', campaign: 'ninos-cole' },
  )
})

test('creates merchant-friendly labels', () => {
  assert.equal(trafficSourceLabel('qr'), 'QR')
  assert.equal(trafficSourceLabel('campaign', 'promo-agosto'), 'Campaña · Promo Agosto')
  assert.equal(trafficSourceLabel(null), 'Directo')
})
