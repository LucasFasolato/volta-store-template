import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { CommercialPlanCode } from '@/lib/billing/plan'
import type { StoreAttributionSummary } from '@/lib/queries/attribution'
import type { StoreAnalyticsSummary } from '@/lib/queries/analytics'
import { AdminDashboardHero } from '@/components/admin/AdminDashboardHero'
import { StoreAnalyticsPanel } from '@/components/admin/StoreAnalyticsPanel'
import { StoreSharePanel } from '@/components/admin/StoreSharePanel'

export function StoreDashboard({
  plan,
  storeName,
  analytics,
  attribution,
  commercialPlan,
}: {
  plan: StoreLaunchPlan
  storeName: string
  analytics: StoreAnalyticsSummary
  attribution: StoreAttributionSummary
  commercialPlan: CommercialPlanCode
}) {
  return (
    <div className="volta-admin-page space-y-4 p-3.5 sm:p-5 lg:p-6">
      <AdminDashboardHero plan={plan} storeName={storeName} />
      <StoreAnalyticsPanel analytics={analytics} attribution={attribution} planCode={commercialPlan} />
      <StoreSharePanel plan={plan} storeName={storeName} />
    </div>
  )
}
