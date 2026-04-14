import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  ImageIcon,
  Package,
  Palette,
  Settings,
  Shapes,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { ProductWithImages } from '@/types/store'
import { AdminDashboardHero } from '@/components/admin/AdminDashboardHero'
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
    <div className="space-y-5 p-4 sm:p-5 lg:space-y-6 lg:p-6">
      <AdminDashboardHero plan={plan} storeName={storeName} />
      <StoreStatusSection
        activeProductCount={activeProductCount}
        categoryCount={categoryCount}
        heroDone={heroDone}
        confidenceValue={`${plan.completedRecommendedCount}/${plan.totalRecommendedCount}`}
        confidenceStarted={plan.completedRecommendedCount > 0}
      />
      <QuickActionsSection />
      <StoreSharePanel plan={plan} firstProduct={firstProduct} whatsapp={whatsapp} />
    </div>
  )
}

function StoreStatusSection({
  activeProductCount,
  categoryCount,
  heroDone,
  confidenceValue,
  confidenceStarted,
}: {
  activeProductCount: number
  categoryCount: number
  heroDone: boolean
  confidenceValue: string
  confidenceStarted: boolean
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="admin-label">Estado de la tienda</p>
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          La foto general de tu tienda
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          En un vistazo puedes ver si la base comercial esta lista para recibir trafico
          y pedidos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={Package}
          label="Productos activos"
          value={String(activeProductCount)}
          status={activeProductCount > 0 ? 'Listo' : 'Pendiente'}
          detail={
            activeProductCount > 0
              ? 'Tu catalogo ya tiene productos visibles para vender.'
              : 'Agrega al menos un producto para activar el catalogo.'
          }
          done={activeProductCount > 0}
        />
        <StatusCard
          icon={Shapes}
          label="Categorias"
          value={String(categoryCount)}
          status={categoryCount > 0 ? 'Listo' : 'Opcional'}
          detail={
            categoryCount > 0
              ? 'Ordenan mejor la tienda y aceleran el recorrido.'
              : 'Todavia puedes sumar categorias sin romper el layout.'
          }
          done={categoryCount > 0}
        />
        <StatusCard
          icon={ImageIcon}
          label="Portada"
          value={heroDone ? 'Lista' : 'No lista'}
          status={heroDone ? 'Completa' : 'Falta'}
          detail={
            heroDone
              ? 'La primera impresion de la tienda ya esta resuelta.'
              : 'Completa copy e imagen para cerrar la portada.'
          }
          done={heroDone}
        />
        <StatusCard
          icon={CheckCircle2}
          label="Confianza"
          value={confidenceValue}
          status={confidenceStarted ? 'Progreso' : 'Inicial'}
          detail="Mas contexto visible genera mas confianza antes del primer mensaje."
          done={confidenceStarted}
        />
      </div>
    </section>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
  status,
  detail,
  done,
}: {
  icon: LucideIcon
  label: string
  value: string
  status: string
  detail: string
  done: boolean
}) {
  return (
    <article className="admin-surface flex min-h-[176px] flex-col rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-black/[0.04] text-muted-foreground dark:bg-white/[0.05]">
          <Icon className="size-4" />
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
            done
              ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
              : 'border-border bg-black/[0.04] text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-foreground">
          {value}
        </p>
      </div>

      <p className="mt-auto pt-5 text-sm leading-6 text-muted-foreground">{detail}</p>
    </article>
  )
}

const QUICK_ACTIONS = [
  {
    href: '/admin/productos/nuevo',
    icon: Package,
    label: 'Agregar producto',
    description: 'Carga algo nuevo para ampliar el catalogo.',
  },
  {
    href: '/admin/apariencia?tab=contenido',
    icon: ImageIcon,
    label: 'Portada y banner',
    description: 'Ajusta la primera impresion visual de la tienda.',
  },
  {
    href: '/admin/apariencia',
    icon: Palette,
    label: 'Apariencia',
    description: 'Edita colores, estilo y look general.',
  },
  {
    href: '/admin/configuracion',
    icon: Settings,
    label: 'Configuracion',
    description: 'Actualiza datos del negocio y contacto.',
  },
] as const satisfies ReadonlyArray<{
  href: string
  icon: LucideIcon
  label: string
  description: string
}>

function QuickActionsSection() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="admin-label">Acciones rapidas</p>
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Lo que probablemente quieras hacer ahora
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group admin-surface flex min-h-[152px] flex-col rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.04] sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-black/[0.04] text-muted-foreground transition-colors group-hover:text-foreground dark:bg-white/[0.05]">
                  <Icon className="size-4" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
              </div>

              <div className="mt-auto pt-8">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
