import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ConfigurationPage } from '@/components/admin/ConfigurationPage'

export default async function NegocioPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  return <ConfigurationPage store={storeData.store} />
}
