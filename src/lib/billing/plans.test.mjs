import test from 'node:test'
import assert from 'node:assert/strict'
import { FREE_PLAN, VOLTA_BILLING_PLAN, VOLTA_PRO_PLAN, getPaidPlanDefinition } from './plan.ts'
import { resolveCommercialAccess } from './commercial-access-core.ts'
import { normalizeProviderBillingStatus } from './status.ts'
import { summarizeUnitEconomics } from './unit-economics.ts'

test('commercial plans keep the intended pricing ladder', () => {
  assert.equal(FREE_PLAN.monthlyAmount, 0)
  assert.equal(FREE_PLAN.productLimit, 10)
  assert.equal(FREE_PLAN.imagesPerProductLimit, 1)
  assert.equal(VOLTA_BILLING_PLAN.introAmount, 15000)
  assert.equal(VOLTA_BILLING_PLAN.standardAmount, 30000)
  assert.equal(VOLTA_BILLING_PLAN.introCycles, 3)
  assert.equal(VOLTA_PRO_PLAN.standardAmount, 70000)
  assert.equal(VOLTA_PRO_PLAN.introCycles, 0)
  assert.equal(getPaidPlanDefinition('pro').standardAmount, 70000)
})

test('expired paid access falls back to free while explicit grandfathering returns to VOLTA', () => {
  const now = new Date('2026-08-21T20:00:00Z')
  assert.equal(resolveCommercialAccess({ storePlanCode: 'volta', grandfathered: true, now }).planCode, 'volta')
  const grandfathered = resolveCommercialAccess({ storePlanCode: 'volta', grandfathered: true, now })
  assert.equal(grandfathered.source, 'grandfathered')
  assert.equal(grandfathered.grandfathered, true)
  assert.equal(resolveCommercialAccess({ storePlanCode: 'pro', storeAccessUntil: '2026-08-20T00:00:00Z', grandfathered: true, now }).planCode, 'volta')
  assert.equal(resolveCommercialAccess({ storePlanCode: 'pro', storeAccessUntil: '2026-08-20T00:00:00Z', grandfathered: false, now }).planCode, 'free')
  assert.equal(resolveCommercialAccess({ storePlanCode: 'volta', storeAccessUntil: '2026-09-21T00:00:00Z', grandfathered: false, now }).source, 'paid_until')
})

test('complimentary access grants VOLTA but not implicit PRO', () => {
  const access = resolveCommercialAccess({ storePlanCode: 'free', complimentary: true })
  assert.equal(access.planCode, 'volta')
  assert.equal(access.source, 'complimentary')
})

test('Mercado Pago canceled spellings map to a clean canceled state', () => {
  assert.equal(normalizeProviderBillingStatus('canceled'), 'canceled')
  assert.equal(normalizeProviderBillingStatus('cancelled'), 'canceled')
  assert.equal(normalizeProviderBillingStatus('authorized'), 'active')
})

test('unit economics computes gross, net and effective processor cost', () => {
  const result = summarizeUnitEconomics([
    { amount: 15000, netReceivedAmount: 13000 },
    { amount: 30000, netReceivedAmount: 26000 },
  ])
  assert.equal(result.grossRevenue, 45000)
  assert.equal(result.knownNetRevenue, 39000)
  assert.equal(result.processorFees, 6000)
  assert.equal(result.knownNetPayments, 2)
  assert.equal(result.effectiveFeeRate, 6000 / 45000)
})

test('unknown processor economics stay unknown instead of becoming zero', () => {
  const result = summarizeUnitEconomics([{ amount: 15000 }])
  assert.equal(result.knownNetPayments, 0)
  assert.equal(result.knownNetRevenue, 0)
  assert.equal(result.processorFees, 0)
  assert.equal(result.effectiveFeeRate, null)
})
