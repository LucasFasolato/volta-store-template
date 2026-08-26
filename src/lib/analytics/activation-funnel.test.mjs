import assert from 'node:assert/strict'
import test from 'node:test'
import { buildActivationFunnel } from './activation-funnel.ts'

function event(event_type, created_at, overrides = {}) {
  return {
    event_type,
    created_at,
    session_id: 'session-a',
    user_id: null,
    store_id: null,
    traffic_source: null,
    campaign: null,
    device: null,
    ...overrides,
  }
}

test('builds the acquisition and activation stages from first milestones', () => {
  const snapshot = buildActivationFunnel([
    event('landing_view', '2026-08-26T10:00:00Z'),
    event('signup_started', '2026-08-26T10:01:00Z', { traffic_source: 'instagram', device: 'mobile' }),
    event('signup_completed', '2026-08-26T10:02:00Z', { user_id: 'user-a' }),
    event('store_created', '2026-08-26T10:03:00Z', { user_id: 'user-a', store_id: 'store-a' }),
    event('first_product', '2026-08-26T10:05:00Z', { user_id: 'user-a', store_id: 'store-a' }),
    event('published', '2026-08-26T10:07:00Z', { user_id: 'user-a', store_id: 'store-a' }),
    event('first_share', '2026-08-26T10:09:00Z', { user_id: 'user-a', store_id: 'store-a' }),
    event('first_share', '2026-08-26T10:10:00Z', { user_id: 'user-a', store_id: 'store-a' }),
  ])

  assert.deepEqual(snapshot.stages.map((stage) => stage.count), [1, 1, 1, 1, 1, 1, 1])
  assert.equal(snapshot.medianSignupToFirstShareMinutes, 8)
  assert.equal(snapshot.medianStoreToFirstShareMinutes, 6)
  assert.equal(snapshot.sessionJoinCoveragePercent, 100)
  assert.deepEqual(snapshot.sources, [{ label: 'instagram', stores: 1, shared: 1, shareRate: 100 }])
  assert.deepEqual(snapshot.devices, [{ label: 'mobile', stores: 1, shared: 1, shareRate: 100 }])
})

test('keeps activation milestones scoped to stores created in the selected cohort', () => {
  const snapshot = buildActivationFunnel([
    event('store_created', '2026-08-26T10:00:00Z', { store_id: 'store-new', user_id: 'user-new' }),
    event('first_product', '2026-08-26T10:01:00Z', { store_id: 'store-old', user_id: 'user-old' }),
    event('published', '2026-08-26T10:02:00Z', { store_id: 'store-old', user_id: 'user-old' }),
    event('first_share', '2026-08-26T10:03:00Z', { store_id: 'store-old', user_id: 'user-old' }),
  ])

  const counts = Object.fromEntries(snapshot.stages.map((stage) => [stage.key, stage.count]))
  assert.equal(counts.store_created, 1)
  assert.equal(counts.first_product, 0)
  assert.equal(counts.published, 0)
  assert.equal(counts.first_share, 0)
})

test('reports partial session join coverage instead of inventing Time to First Share', () => {
  const snapshot = buildActivationFunnel([
    event('store_created', '2026-08-26T10:00:00Z', {
      session_id: 'auth-user-a',
      store_id: 'store-a',
      user_id: 'user-a',
    }),
    event('first_share', '2026-08-26T10:06:00Z', {
      session_id: 'auth-user-a',
      store_id: 'store-a',
      user_id: 'user-a',
    }),
  ])

  assert.equal(snapshot.medianSignupToFirstShareMinutes, null)
  assert.equal(snapshot.medianStoreToFirstShareMinutes, 6)
  assert.equal(snapshot.sessionJoinCoveragePercent, 0)
})
