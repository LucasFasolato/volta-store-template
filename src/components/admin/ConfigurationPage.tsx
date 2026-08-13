import { ChevronDown } from 'lucide-react'
import { BusinessTrustPreview } from '@/components/admin/BusinessTrustPreview'
import { CheckoutSettingsForm } from '@/components/admin/CheckoutSettingsForm'
import { ConfigForm } from '@/components/admin/ConfigForm'
import { MobileConfigForm } from '@/components/admin/MobileConfigForm'
import type { Store } from '@/types/store'

export function ConfigurationPage({ store }: { store: Store }) {
  return <div className="volta-admin-page space-y-4 p-3.5 sm:p-5 lg:p-6">
    <header><p className="admin-label">Configuración</p><h1 className="mt-1 text-[1.85rem] font-semibold text-foreground">Tu negocio</h1></header>
    <div className="max-w-4xl md:hidden"><MobileConfigForm store={store} /><Fold title="Cómo recibir pedidos"><CheckoutSettingsForm store={store} /></Fold><Fold title="Qué ve el cliente"><BusinessTrustPreview store={store} /></Fold></div>
    <div className="hidden max-w-4xl space-y-5 md:block"><ConfigForm store={store} /><CheckoutSettingsForm store={store} /><BusinessTrustPreview store={store} /></div>
  </div>
}

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="group mt-3 rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-foreground">{title}<ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="border-t border-black/7 p-3 dark:border-white/8">{children}</div></details>
}
