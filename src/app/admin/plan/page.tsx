import { BillingPage } from '@/components/admin/BillingPage'
import { getBillingOverview } from '@/lib/billing/queries'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'

export default async function PlanPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const overview = await getBillingOverview(storeData.store.id)

  return <BillingPage storeName={storeData.store.name} overview={overview} />
}
