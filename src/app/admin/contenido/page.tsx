import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ContentForm } from '@/components/admin/ContentForm'

export default async function ContenidoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Contenido"
        description="Ajusta el mensaje comercial y la imagen principal para que la tienda convierta mejor."
      />
      <ContentForm content={storeData.content} store={storeData.store} />
    </div>
  )
}
