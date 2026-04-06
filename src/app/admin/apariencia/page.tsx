import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AppearanceEditor } from '@/components/admin/AppearanceEditor'

export default async function AparienciaPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <AppearanceEditor theme={storeData.theme} layout={storeData.layout} />
    </div>
  )
}
