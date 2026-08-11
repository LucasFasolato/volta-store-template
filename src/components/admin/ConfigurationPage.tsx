import { ConfigForm } from '@/components/admin/ConfigForm'
import type { Store } from '@/types/store'

export function ConfigurationPage({ store }: { store: Store }) {
  return (
    <div className="volta-admin-page space-y-5 p-3.5 sm:p-5 lg:p-6">
      <header>
        <p className="admin-label">Configuración</p>
        <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Tu negocio</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Nombre, enlace y canales que necesita tu tienda para funcionar.</p>
      </header>
      <div className="max-w-4xl">
        <ConfigForm store={store} />
      </div>
    </div>
  )
}
