import { buildActivationFlowSteps, buildStoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { getStoreAnalytics } from '@/lib/queries/analytics'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ActivationWizard } from '@/components/admin/ActivationWizard'
import { StoreDashboard } from '@/components/admin/StoreDashboard'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const [products, categories] = await Promise.all([getAdminProducts(storeData.store.id), getAdminCategories(storeData.store.id)])
  const plan = buildStoreLaunchPlan({ storeData, categories, products })
  const activeProducts = products.filter((product) => product.is_active)
  const activeProductCount = activeProducts.length

  if (plan.isPublished) {
    const analytics = await getStoreAnalytics(storeData.store.id)
    return <StoreDashboard plan={plan} storeName={storeData.store.name} analytics={analytics} />
  }

  return (
    <div className="p-3.5 sm:p-5 lg:p-6">
      <ActivationWizard steps={buildActivationFlowSteps(plan)} plan={plan} storeData={storeData} categories={categories} activeProductCount={activeProductCount} />
    </div>
  )
}
