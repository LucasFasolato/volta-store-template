import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildProductPublicUrl,
  buildProductShareMessage,
  buildStorePublicUrl,
  buildStoreShareMessage,
  buildSuggestedStoreMessages,
  buildWhatsAppShareUrl,
} from './links.ts'

test('builds a stable store URL', () => {
  assert.equal(
    buildStorePublicUrl('strongprotein', 'https://www.voltastore.app/ignored/path'),
    'https://www.voltastore.app/tienda/strongprotein',
  )
})

test('builds storefront-compatible product deep links', () => {
  const url = buildProductPublicUrl('strongprotein', 'collagen-whey', 'https://www.voltastore.app')
  assert.equal(url, 'https://www.voltastore.app/tienda/strongprotein?producto=collagen-whey')
})

test('encodes WhatsApp share messages safely', () => {
  const message = 'Mirá esto 👇\nhttps://example.com/?a=1&b=2'
  assert.equal(buildWhatsAppShareUrl(message), `https://wa.me/?text=${encodeURIComponent(message)}`)
})

test('creates concise store and product share copy', () => {
  const storeUrl = 'https://www.voltastore.app/tienda/strongprotein'
  assert.match(buildStoreShareMessage('Strong.Protein', storeUrl), /Strong\.Protein/)
  assert.match(buildProductShareMessage('Strong.Protein', 'Whey', `${storeUrl}?producto=whey`), /Whey/)
})

test('provides distinct ready-to-use store messages', () => {
  const messages = buildSuggestedStoreMessages('Strong.Protein', 'https://example.com/store')
  assert.equal(messages.length, 3)
  assert.equal(new Set(messages.map((item) => item.id)).size, 3)
  assert.ok(messages.every((item) => item.text.includes('https://example.com/store')))
})
