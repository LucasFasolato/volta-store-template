import test from 'node:test'
import assert from 'node:assert/strict'
import { buildStoreSlugRedirectPath } from './slug-history.ts'

test('redirects an old store slug to the canonical store path', () => {
  assert.equal(
    buildStoreSlugRedirectPath('olivia-deco', {}),
    '/tienda/olivia-deco',
  )
})

test('preserves product deep links and attribution through slug redirects', () => {
  const redirected = buildStoreSlugRedirectPath('olivia-deco', {
    producto: 'lampara-mesa',
    src: 'instagram',
    campaign: 'promo-agosto',
  })

  assert.equal(
    redirected,
    '/tienda/olivia-deco?producto=lampara-mesa&src=instagram&campaign=promo-agosto',
  )
})

test('preserves UTM and repeated query parameters without creating an open redirect', () => {
  const redirected = buildStoreSlugRedirectPath('olivia deco', {
    utm_source: 'instagram',
    utm_campaign: 'lanzamiento',
    tag: ['uno', 'dos'],
  })

  assert.equal(
    redirected,
    '/tienda/olivia%20deco?utm_source=instagram&utm_campaign=lanzamiento&tag=uno&tag=dos',
  )
  assert.ok(redirected.startsWith('/tienda/'))
})
