import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveMagicLinkOrigin, sanitizeInternalRedirect } from './redirects.ts'

test('uses the configured application origin instead of attacker-controlled headers', () => {
  assert.equal(
    resolveMagicLinkOrigin(
      { NODE_ENV: 'production', NEXT_PUBLIC_APP_URL: 'https://voltastore.app/' },
      'attacker.example',
    ),
    'https://voltastore.app',
  )
})

test('uses the Vercel branch URL for preview deployments', () => {
  assert.equal(
    resolveMagicLinkOrigin({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      VERCEL_BRANCH_URL: 'volta-git-auth-example.vercel.app',
      NEXT_PUBLIC_APP_URL: 'https://voltastore.app',
    }),
    'https://volta-git-auth-example.vercel.app',
  )
})

test('only accepts a loopback request host as the development fallback', () => {
  assert.equal(
    resolveMagicLinkOrigin({ NODE_ENV: 'development' }, 'localhost:3001'),
    'http://localhost:3001',
  )
  assert.throws(
    () => resolveMagicLinkOrigin({ NODE_ENV: 'development' }, 'localhost.attacker.example'),
    /trusted application origin/,
  )
})

test('rejects unsafe configured origins', () => {
  assert.throws(
    () => resolveMagicLinkOrigin({ NODE_ENV: 'production', NEXT_PUBLIC_APP_URL: 'http://voltastore.app' }),
    /trusted application origin/,
  )
})

test('keeps ordinary internal destinations including query strings', () => {
  assert.equal(sanitizeInternalRedirect('/admin/productos?tab=active'), '/admin/productos?tab=active')
})

test('rejects external, backslash and encoded-separator redirects', () => {
  for (const value of [
    'https://attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    '/%5cattacker.example',
    '/%2fattacker.example',
    '/admin\r\nLocation: https://attacker.example',
  ]) {
    assert.equal(sanitizeInternalRedirect(value), '/admin')
  }
})
