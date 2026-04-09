import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ConfigurationPage } from '@/components/admin/ConfigurationPage'

export default async function ConfiguracionPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  return <ConfigurationPage store={storeData.store} />
}
