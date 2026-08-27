import { buildActivationFlowSteps, buildStoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { getStoreCommercialAccess } from '@/lib/billing/commercial-access'
import { getStoreAttribution } from '@/lib/queries/attribution'
import { getStoreAnalytics } from '@/lib/queries/analytics'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ActivationWizard } from '@/components/admin/ActivationWizard'
import { AdminIntroTour } from '@/components/admin/AdminIntroTour'
import { StoreDashboard } from '@/components/admin/StoreDashboard'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])
  const plan = buildStoreLaunchPlan({ storeData, categories, products })
  const activeProducts = products.filter((product) => product.is_active)
  const initialProduct = activeProducts.find((product) => product.images.length === 0)
    ?? activeProducts[0]
    ?? null

  if (plan.isPublished) {
    const [analytics, attribution, commercialAccess] = await Promise.all([
      getStoreAnalytics(storeData.store.id, products),
      getStoreAttribution(storeData.store.id),
      getStoreCommercialAccess(storeData.store.id),
    ])
    return (
      <>
        <StoreDashboard plan={plan} storeName={storeData.store.name} analytics={analytics} attribution={attribution} commercialPlan={commercialAccess.planCode} />
        <AdminIntroTour storeId={storeData.store.id} storeName={storeData.store.name} isPublished />
      </>
    )
  }

  return (
    <>
      <div className="p-3.5 sm:p-5 lg:p-6">
        <ActivationWizard
          steps={buildActivationFlowSteps(plan)}
          plan={plan}
          storeData={storeData}
          initialProduct={initialProduct}
        />
      </div>
      <AdminIntroTour storeId={storeData.store.id} storeName={storeData.store.name} isPublished={false} />
    </>
  )
}
