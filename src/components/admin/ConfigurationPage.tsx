import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ConfigForm } from '@/components/admin/ConfigForm'
import type { Store } from '@/types/store'

export function ConfigurationPage({ store }: { store: Store }) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Configuracion"
        description="Todo lo esencial del negocio, ordenado en bloques simples para que configurar la tienda sea rapido y claro."
      />
      <div className="max-w-[1200px]">
        <ConfigForm store={store} />
      </div>
    </div>
  )
}
