import type { SaasFunnelEventType } from '@/lib/analytics/saas-contract'

export type ActivationFunnelEvent = {
  event_type: SaasFunnelEventType | string
  session_id: string
  user_id: string | null
  store_id: string | null
  traffic_source: string | null
  campaign: string | null
  device: string | null
  created_at: string
}

export type FunnelStage = {
  key: SaasFunnelEventType
  label: string
  count: number
  conversionFromPrevious: number | null
}

export type FunnelSegment = {
  label: string
  stores: number
  shared: number
  shareRate: number | null
}

export type ActivationFunnelSnapshot = {
  stages: FunnelStage[]
  medianSignupToFirstShareMinutes: number | null
  medianStoreToFirstShareMinutes: number | null
  sessionJoinCoveragePercent: number | null
  sources: FunnelSegment[]
  devices: FunnelSegment[]
}

const STAGE_LABELS: Array<[SaasFunnelEventType, string]> = [
  ['landing_view', 'Landing'],
  ['signup_started', 'Signup iniciado'],
  ['signup_completed', 'Signup completado'],
  ['store_created', 'Tienda creada'],
  ['first_product', 'Primer producto'],
  ['published', 'Publicada'],
  ['first_share', 'Primer share'],
]

function firstBy<T>(items: T[], key: (item: T) => string | null) {
  const map = new Map<string, T>()
  for (const item of items) {
    const id = key(item)
    if (!id || map.has(id)) continue
    map.set(id, item)
  }
  return map
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10
}

function ratio(current: number, previous: number) {
  if (previous <= 0) return null
  return roundPercent((current / previous) * 100)
}

function median(values: number[]) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const midpoint = Math.floor(sorted.length / 2)
  const value = sorted.length % 2
    ? sorted[midpoint]
    : (sorted[midpoint - 1] + sorted[midpoint]) / 2
  return Math.round(value * 10) / 10
}

function minutesBetween(startIso: string, endIso: string) {
  const start = Date.parse(startIso)
  const end = Date.parse(endIso)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  return (end - start) / 60_000
}

function buildSegments(
  cohort: Map<string, ActivationFunnelEvent>,
  shares: Map<string, ActivationFunnelEvent>,
  signupBySession: Map<string, ActivationFunnelEvent>,
  field: 'traffic_source' | 'device',
) {
  const map = new Map<string, { stores: number; shared: number }>()

  for (const [storeId, created] of cohort.entries()) {
    const signup = signupBySession.get(created.session_id)
    const raw = signup?.[field] ?? created[field]
    const label = raw || (field === 'traffic_source' ? 'direct' : 'unknown')
    const current = map.get(label) ?? { stores: 0, shared: 0 }
    current.stores += 1
    if (shares.has(storeId)) current.shared += 1
    map.set(label, current)
  }

  return [...map.entries()]
    .map(([label, value]) => ({
      label,
      stores: value.stores,
      shared: value.shared,
      shareRate: ratio(value.shared, value.stores),
    }))
    .sort((a, b) => b.stores - a.stores || b.shared - a.shared || a.label.localeCompare(b.label))
}

export function buildActivationFunnel(events: ActivationFunnelEvent[]): ActivationFunnelSnapshot {
  const ordered = [...events].sort(
    (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
  )

  const landingSessions = new Set(
    ordered.filter((event) => event.event_type === 'landing_view').map((event) => event.session_id),
  )
  const signupStarted = firstBy(
    ordered.filter((event) => event.event_type === 'signup_started'),
    (event) => event.session_id,
  )
  const signupCompleted = firstBy(
    ordered.filter((event) => event.event_type === 'signup_completed'),
    (event) => event.user_id ?? event.session_id,
  )
  const storeCreated = firstBy(
    ordered.filter((event) => event.event_type === 'store_created'),
    (event) => event.store_id,
  )

  const cohortStoreIds = new Set(storeCreated.keys())
  const milestoneByStore = (eventType: SaasFunnelEventType) => firstBy(
    ordered.filter(
      (event) => event.event_type === eventType && event.store_id && cohortStoreIds.has(event.store_id),
    ),
    (event) => event.store_id,
  )

  const firstProduct = milestoneByStore('first_product')
  const published = milestoneByStore('published')
  const firstShare = milestoneByStore('first_share')

  const counts = new Map<SaasFunnelEventType, number>([
    ['landing_view', landingSessions.size],
    ['signup_started', signupStarted.size],
    ['signup_completed', signupCompleted.size],
    ['store_created', storeCreated.size],
    ['first_product', firstProduct.size],
    ['published', published.size],
    ['first_share', firstShare.size],
  ])

  const stages = STAGE_LABELS.map(([key, label], index) => {
    const count = counts.get(key) ?? 0
    const previousKey = index > 0 ? STAGE_LABELS[index - 1][0] : null
    const previous = previousKey ? (counts.get(previousKey) ?? 0) : 0
    return {
      key,
      label,
      count,
      conversionFromPrevious: previousKey ? ratio(count, previous) : null,
    }
  })

  const signupToShareMinutes: number[] = []
  const storeToShareMinutes: number[] = []
  let linkedStoreSessions = 0

  for (const [storeId, created] of storeCreated.entries()) {
    const share = firstShare.get(storeId)
    if (!share) continue

    const storeMinutes = minutesBetween(created.created_at, share.created_at)
    if (storeMinutes !== null) storeToShareMinutes.push(storeMinutes)

    const signup = signupStarted.get(created.session_id)
    if (!signup) continue
    linkedStoreSessions += 1
    const signupMinutes = minutesBetween(signup.created_at, share.created_at)
    if (signupMinutes !== null) signupToShareMinutes.push(signupMinutes)
  }

  // Coverage describes whether a store-created cohort can be joined back to the
  // anonymous signup-start session. Cross-browser auth can legitimately reduce it.
  const sessionsWithSignup = [...storeCreated.values()].filter((created) =>
    signupStarted.has(created.session_id),
  ).length

  return {
    stages,
    medianSignupToFirstShareMinutes: median(signupToShareMinutes),
    medianStoreToFirstShareMinutes: median(storeToShareMinutes),
    sessionJoinCoveragePercent: storeCreated.size
      ? roundPercent((sessionsWithSignup / storeCreated.size) * 100)
      : null,
    sources: buildSegments(storeCreated, firstShare, signupStarted, 'traffic_source'),
    devices: buildSegments(storeCreated, firstShare, signupStarted, 'device'),
  }
}
