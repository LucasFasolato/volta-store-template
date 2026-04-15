import { buildActivationFlowSteps, buildStoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ActivationWizard } from '@/components/admin/ActivationWizard'
import { PublishGate } from '@/components/admin/PublishGate'
import { StoreDashboard } from '@/components/admin/StoreDashboard'
import { StoreReadinessSummary } from '@/components/admin/StoreReadinessSummary'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const plan = buildStoreLaunchPlan({ storeData, categories, products })
  const activeProducts = products.filter((product) => product.is_active)
  const activeProductCount = activeProducts.length

  if (plan.isPublished) {
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

  const steps = buildActivationFlowSteps(plan)

  return (
    <div className="space-y-4 p-3.5 sm:p-5 lg:space-y-5 lg:p-6">
      <StoreReadinessSummary plan={plan} />
      <PublishGate plan={plan} />
      {plan.missingRequiredCount > 0 ? (
        <ActivationWizard
          steps={steps}
          storeData={storeData}
          categories={categories}
          activeProductCount={activeProductCount}
        />
      ) : null}
    </div>
  )
}
