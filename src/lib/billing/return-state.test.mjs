import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveBillingReturnState } from './return-state.ts'

function overview(status) {
  return { subscription: status ? { status } : null }
}

test('billing return resolves successful and pending outcomes', () => {
  assert.equal(resolveBillingReturnState(overview('active')), 'success')
  assert.equal(resolveBillingReturnState(overview('pending')), 'pending')
  assert.equal(resolveBillingReturnState(overview('canceled')), 'canceled')
  assert.equal(resolveBillingReturnState(overview('error')), 'error')
})

test('explicit cancellation return wins over stale provider state', () => {
  assert.equal(resolveBillingReturnState(overview('active'), 'canceled'), 'canceled')
})
