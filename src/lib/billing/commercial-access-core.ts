export type CommercialPlanCode = 'free' | 'volta' | 'pro'

function normalizeCommercialPlan(value: unknown): CommercialPlanCode {
  return value === 'pro' || value === 'volta' ? value : 'free'
}

export type CommercialAccessSource =
  | 'free'
  | 'grandfathered'
  | 'paid_until'
  | 'subscription'
  | 'complimentary'

export type CommercialAccess = {
  planCode: CommercialPlanCode
  source: CommercialAccessSource
  accessUntil: string | null
  complimentaryUntil: string | null
  grandfathered: boolean
}

export function resolveCommercialAccess(input: {
  storePlanCode: unknown
  storeAccessUntil?: string | null
  grandfathered?: boolean
  subscriptionPlanCode?: unknown
  subscriptionStatus?: string | null
  complimentary?: boolean
  complimentaryUntil?: string | null
  now?: Date
}): CommercialAccess {
  const now = input.now ?? new Date()

  if (input.complimentary) {
    return {
      planCode: 'volta',
      source: 'complimentary',
      accessUntil: input.complimentaryUntil ?? null,
      complimentaryUntil: input.complimentaryUntil ?? null,
      grandfathered: Boolean(input.grandfathered),
    }
  }

  const subscriptionPlan = normalizeCommercialPlan(input.subscriptionPlanCode)
  if (input.subscriptionStatus === 'active' && subscriptionPlan !== 'free') {
    return {
      planCode: subscriptionPlan,
      source: 'subscription',
      accessUntil: input.storeAccessUntil ?? null,
      complimentaryUntil: null,
      grandfathered: Boolean(input.grandfathered),
    }
  }

  const storePlan = normalizeCommercialPlan(input.storePlanCode)
  if (storePlan === 'free') {
    return { planCode: 'free', source: 'free', accessUntil: null, complimentaryUntil: null, grandfathered: false }
  }

  if (!input.storeAccessUntil) {
    if (input.grandfathered) {
      return {
        planCode: 'volta',
        source: 'grandfathered',
        accessUntil: null,
        complimentaryUntil: null,
        grandfathered: true,
      }
    }

    return { planCode: 'free', source: 'free', accessUntil: null, complimentaryUntil: null, grandfathered: false }
  }

  const accessUntilMs = Date.parse(input.storeAccessUntil)
  if (Number.isFinite(accessUntilMs) && accessUntilMs > now.getTime()) {
    return {
      planCode: storePlan,
      source: 'paid_until',
      accessUntil: input.storeAccessUntil,
      complimentaryUntil: null,
      grandfathered: Boolean(input.grandfathered),
    }
  }

  if (input.grandfathered) {
    return {
      planCode: 'volta',
      source: 'grandfathered',
      accessUntil: null,
      complimentaryUntil: null,
      grandfathered: true,
    }
  }

  return { planCode: 'free', source: 'free', accessUntil: null, complimentaryUntil: null, grandfathered: false }
}

export function canUseMeasuredLinks(planCode: CommercialPlanCode) {
  return planCode === 'volta' || planCode === 'pro'
}

export function canUseAdvancedAnalytics(planCode: CommercialPlanCode) {
  return planCode === 'volta' || planCode === 'pro'
}

export function canUseGrowthIntelligence(planCode: CommercialPlanCode) {
  return planCode === 'pro'
}

export function canUseCampaigns(planCode: CommercialPlanCode) {
  return planCode === 'pro'
}
