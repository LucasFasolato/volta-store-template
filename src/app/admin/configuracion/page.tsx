import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Configuracion"
        description="Datos de negocio que impactan la confianza de la tienda y el mensaje final de WhatsApp."
      />
      <div className="max-w-[1200px]">
        <ConfigForm store={storeData.store} />
      </div>
    </div>
  )
}
