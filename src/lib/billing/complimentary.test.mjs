import assert from 'node:assert/strict'
import test from 'node:test'
import { ensureMercadoPagoCancellation } from './complimentary.ts'

const storeId = 'store-a'
const localActive = { status: 'active', providerSubscriptionId: 'subscription-a' }

function dependencies(states, options = {}) {
  const calls = []
  return {
    calls,
    value: {
      async getSubscription(id) {
        calls.push(`get:${id}`)
        const next = states.shift()
        if (next instanceof Error) throw next
        return next
      },
      async cancelSubscription(id) {
        calls.push(`cancel:${id}`)
        if (options.cancelError) throw options.cancelError
        return options.cancelResult ?? { id, status: 'canceled' }
      },
      async persistSubscription(id, subscription) {
        calls.push(`persist:${id}:${subscription.status}`)
      },
    },
  }
}

test('cancels an active subscription and persists only the confirmed canceled state', async () => {
  const deps = dependencies([
    { id: 'subscription-a', status: 'authorized' },
    { id: 'subscription-a', status: 'canceled' },
  ])

  await ensureMercadoPagoCancellation(storeId, localActive, deps.value)

  assert.deepEqual(deps.calls, [
    'get:subscription-a',
    'cancel:subscription-a',
    'get:subscription-a',
    'persist:store-a:canceled',
  ])
})

test('is idempotent when Mercado Pago already reports the subscription canceled', async () => {
  const deps = dependencies([{ id: 'subscription-a', status: 'canceled' }])

  await ensureMercadoPagoCancellation(storeId, localActive, deps.value)

  assert.deepEqual(deps.calls, [
    'get:subscription-a',
    'persist:store-a:canceled',
  ])
})

test('fails closed when Mercado Pago times out', async () => {
  const deps = dependencies([new Error('timeout')])

  await assert.rejects(
    ensureMercadoPagoCancellation(storeId, localActive, deps.value),
    /timeout/,
  )
  assert.deepEqual(deps.calls, ['get:subscription-a'])
})

test('fails closed when the provider rejects cancellation', async () => {
  const deps = dependencies(
    [{ id: 'subscription-a', status: 'authorized' }],
    { cancelError: new Error('provider error') },
  )

  await assert.rejects(
    ensureMercadoPagoCancellation(storeId, localActive, deps.value),
    /provider error/,
  )
  assert.deepEqual(deps.calls, ['get:subscription-a', 'cancel:subscription-a'])
})

test('fails closed on an unexpected provider status', async () => {
  const deps = dependencies([{ id: 'subscription-a', status: 'pending_cancel' }])

  await assert.rejects(
    ensureMercadoPagoCancellation(storeId, localActive, deps.value),
    /unexpected subscription status/,
  )
  assert.deepEqual(deps.calls, ['get:subscription-a'])
})

test('does not persist when cancellation returns success but confirmation is still active', async () => {
  const deps = dependencies([
    { id: 'subscription-a', status: 'authorized' },
    { id: 'subscription-a', status: 'authorized' },
  ])

  await assert.rejects(
    ensureMercadoPagoCancellation(storeId, localActive, deps.value),
    /did not confirm/,
  )
  assert.deepEqual(deps.calls, [
    'get:subscription-a',
    'cancel:subscription-a',
    'get:subscription-a',
  ])
})
