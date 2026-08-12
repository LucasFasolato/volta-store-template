import { BusinessTrustPreview } from '@/components/admin/BusinessTrustPreview'
import { CheckoutSettingsForm } from '@/components/admin/CheckoutSettingsForm'
import { ConfigForm } from '@/components/admin/ConfigForm'
import type { Store } from '@/types/store'

export function ConfigurationPage({ store }: { store: Store }) {
  return (
    <div className="volta-admin-page space-y-5 p-3.5 sm:p-5 lg:p-6">
      <header>
        <p className="admin-label">Configuración</p>
        <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Tu negocio</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Nombre, contacto y forma de recibir pedidos. Solo lo necesario para vender sin complicaciones.</p>
      </header>

      <div className="max-w-4xl space-y-5">
        <ConfigForm store={store} />
        <CheckoutSettingsForm store={store} />
        <BusinessTrustPreview store={store} />
      </div>
    </div>
  )
}
