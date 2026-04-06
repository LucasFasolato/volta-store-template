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

  // Mode B — store is ready: show operational dashboard
  if (plan.state === 'ready') {
    return (
      <StoreDashboard
        plan={plan}
        storeName={storeData.store.name}
        activeProductCount={products.filter((p) => p.is_active).length}
        categoryCount={categories.length}
      />
    )
  }

  // Mode A — store in progress: show linear activation wizard
  const steps = buildActivationFlowSteps(plan)
  return <ActivationWizard steps={steps} plan={plan} />
}
