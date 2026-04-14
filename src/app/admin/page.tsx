import { buildActivationFlowSteps, buildStoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ActivationWizard } from '@/components/admin/ActivationWizard'
import { StoreDashboard } from '@/components/admin/StoreDashboard'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const plan = buildStoreLaunchPlan({ storeData, categories, products })
  const activeProducts = products.filter((product) => product.is_active)
  const activeProductCount = activeProducts.length

  // Mode B - store is ready: show operational dashboard
  if (plan.state === 'ready') {
    const firstProduct = activeProducts[0] ?? null

    return (
      <StoreDashboard
        plan={plan}
        storeName={storeData.store.name}
        activeProductCount={activeProductCount}
        categoryCount={categories.length}
        firstProduct={firstProduct}
        whatsapp={storeData.store.whatsapp}
      />
    )
  }

  // Mode A - store in progress: show inline activation wizard
  const steps = buildActivationFlowSteps(plan)

  return (
    <ActivationWizard
      steps={steps}
      plan={plan}
      storeData={storeData}
      categories={categories}
      activeProductCount={activeProductCount}
    />
  )
}
