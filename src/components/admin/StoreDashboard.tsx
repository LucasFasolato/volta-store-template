import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, ImageIcon, Package, Palette, Shapes } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { ProductWithImages } from '@/types/store'
import { AdminDashboardHero } from '@/components/admin/AdminDashboardHero'
import { PublishGate } from '@/components/admin/PublishGate'
import { StoreSharePanel } from '@/components/admin/StoreSharePanel'

export function StoreDashboard({
  plan,
  storeName,
  activeProductCount,
  categoryCount,
  firstProduct,
  whatsapp,
}: {
  plan: StoreLaunchPlan
  storeName: string
  activeProductCount: number
  categoryCount: number
  firstProduct: ProductWithImages | null
  whatsapp: string
}) {
  const heroDone =
    plan.requiredItems.find((item) => item.id === 'hero-copy')?.status === 'done' &&
    plan.requiredItems.find((item) => item.id === 'hero-image')?.status === 'done'

  return (
    <div className="volta-admin-page space-y-5 p-3.5 sm:p-5 lg:p-6">
      <AdminDashboardHero plan={plan} storeName={storeName} />
      <PublishGate plan={plan} />

      <section>
        <div className="volta-section-heading">
          <div>
            <p className="admin-label">Estado</p>
            <h2>Tu tienda, en un vistazo</h2>
          </div>
        </div>

        <div className="volta-status-strip dark:border-white/10 dark:bg-[#111820]">
          <StatusItem icon={Package} label="Productos" value={String(activeProductCount)} ready={activeProductCount > 0} />
          <StatusItem icon={Shapes} label="Categorías" value={String(categoryCount)} ready={categoryCount > 0} optional />
          <StatusItem icon={ImageIcon} label="Portada" value={heroDone ? 'Lista' : 'Pendiente'} ready={heroDone} />
          <StatusItem icon={CheckCircle2} label="Tienda" value={plan.isPublished ? 'Publicada' : 'En preparación'} ready={plan.isPublished} />
        </div>
      </section>

      <section>
        <div className="volta-section-heading">
          <div>
            <p className="admin-label">Acciones rápidas</p>
            <h2>Seguí trabajando sin perder tiempo</h2>
          </div>
        </div>

        <div className="volta-quick-actions">
          <QuickAction href="/admin/catalogo/nuevo" icon={Package} title="Nuevo producto" text="Sumá algo al catálogo." />
          <QuickAction href="/admin/tienda" icon={Palette} title="Editar apariencia" text="Ajustá estilo, portada y diseño." />
          <QuickAction href={plan.isPublished ? plan.publicPath : plan.previewPath} icon={ArrowUpRight} title="Revisar tienda" text="Mirá la experiencia como cliente." external />
        </div>
      </section>

      <StoreSharePanel plan={plan} firstProduct={firstProduct} whatsapp={whatsapp} />
    </div>
  )
}

function StatusItem({
  icon: Icon,
  label,
  value,
  ready,
  optional = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  ready: boolean
  optional?: boolean
}) {
  return (
    <div className="dark:bg-transparent">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-8 items-center justify-center rounded-[9px] bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-white/45">
          <Icon className="size-4" />
        </span>
        <span className={`size-2 rounded-full ${ready ? 'bg-[#12e89a]' : optional ? 'bg-slate-300 dark:bg-white/20' : 'bg-amber-400'}`} />
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[1.2rem] font-semibold tracking-[-0.035em] text-foreground">{value}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  title,
  text,
  external = false,
}: {
  href: string
  icon: LucideIcon
  title: string
  text: string
  external?: boolean
}) {
  return (
    <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="volta-quick-action dark:border-white/10 dark:bg-[#111820]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-white/55">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
