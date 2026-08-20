import Link from 'next/link'
import { ChevronDown, ChevronRight, CreditCard, LogOut } from 'lucide-react'
import { BusinessTrustPreview } from '@/components/admin/BusinessTrustPreview'
import { CheckoutSettingsForm } from '@/components/admin/CheckoutSettingsForm'
import { ConfigForm } from '@/components/admin/ConfigForm'
import { MobileConfigForm } from '@/components/admin/MobileConfigForm'
import { SalesSettingsForm } from '@/components/admin/SalesSettingsForm'
import { signOut } from '@/lib/actions/auth'
import type { Store } from '@/types/store'

export function ConfigurationPage({ store }: { store: Store }) {
  return <div className="volta-admin-page space-y-4 p-3.5 sm:p-5 lg:p-6">
    <header><p className="admin-label">Configuración</p><h1 className="mt-1 text-[1.85rem] font-semibold text-foreground">Tu negocio</h1></header>
    <div className="max-w-4xl md:hidden">
      <MobileConfigForm store={store} />
      <Fold title="Cómo vendés"><SalesSettingsForm store={store} /></Fold>
      <Fold title="Qué pedir antes de WhatsApp"><CheckoutSettingsForm store={store} /></Fold>
      <Fold title="Qué ve el cliente"><BusinessTrustPreview store={store} /></Fold>
      <BillingLinkSection />
      <SignOutSection />
    </div>
    <div className="hidden max-w-4xl space-y-5 md:block"><ConfigForm store={store} /><SalesSettingsForm store={store} /><CheckoutSettingsForm store={store} /><BusinessTrustPreview store={store} /><BillingLinkSection /><SignOutSection /></div>
  </div>
}

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="group mt-3 rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-foreground">{title}<ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="border-t border-black/7 p-3 dark:border-white/8">{children}</div></details>
}

function BillingLinkSection() {
  return (
    <Link href="/admin/plan" className="mt-3 flex min-h-[74px] items-center gap-3 rounded-[14px] border border-black/8 bg-white p-4 transition hover:bg-black/[0.02] dark:border-white/10 dark:bg-[#111820] dark:hover:bg-white/[0.03] md:mt-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#10161d] text-[#12e89a] dark:bg-white/8"><CreditCard className="size-4" /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">Plan y facturación</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Suscripción VOLTA, próximos cobros y movimientos.</span></span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

function SignOutSection() {
  return (
    <section className="mt-3 rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] md:mt-0 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Sesión</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Cerrá tu sesión en este dispositivo.</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300 dark:hover:bg-red-400/15">
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </section>
  )
}
