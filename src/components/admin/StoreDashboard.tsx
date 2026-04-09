import Link from 'next/link'
import {
  CheckCircle2,
  ExternalLink,
  Package,
  Palette,
  Settings,
} from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { ProductWithImages } from '@/types/store'
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
    plan.requiredItems.find((i) => i.id === 'hero-copy')?.status === 'done' &&
    plan.requiredItems.find((i) => i.id === 'hero-image')?.status === 'done'

  const stats: { value: string; label: string; done: boolean }[] = [
    {
      value: String(activeProductCount),
      label: activeProductCount === 1 ? 'producto activo' : 'productos activos',
      done: activeProductCount >= 1,
    },
    {
      value: String(categoryCount),
      label: categoryCount === 1 ? 'categoria' : 'categorias',
      done: categoryCount >= 1,
    },
    {
      value: heroDone ? 'Lista' : 'Incompleta',
      label: 'Portada',
      done: !!heroDone,
    },
    {
      value: `${plan.completedRecommendedCount}/${plan.totalRecommendedCount}`,
      label: 'Confianza',
      done: plan.completedRecommendedCount > 0,
    },
  ]

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      {/* 1. Celebration hero */}
      <ReadyHero plan={plan} storeName={storeName} />

      {/* 2. Share + simulate */}
      <StoreSharePanel plan={plan} firstProduct={firstProduct} whatsapp={whatsapp} />

      {/* 3. Stats snapshot */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} value={stat.value} label={stat.label} done={stat.done} />
        ))}
      </div>

      {/* 4. Quick actions */}
      <QuickActionsSection />
    </div>
  )
}

function ReadyHero({ plan, storeName }: { plan: StoreLaunchPlan; storeName: string }) {
  return (
    <section className="admin-surface relative overflow-hidden rounded-2xl px-6 py-8 sm:px-8 sm:py-10">
      {/* Ambient glow top-right */}
      <div
        className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-56 w-56 rounded-full bg-emerald-300/14 blur-[60px]"
        aria-hidden="true"
      />
      {/* Ambient glow bottom-left */}
      <div
        className="pointer-events-none absolute bottom-[-2rem] left-[-2rem] h-40 w-40 rounded-full bg-emerald-500/8 blur-[50px]"
        aria-hidden="true"
      />
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />

      <div className="relative">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Lista para vender
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-balance font-heading text-[2rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.5rem] sm:leading-[1.12]">
          {storeName} ya puede
          <br className="hidden sm:block" />
          <span className="text-emerald-500 dark:text-emerald-400"> recibir pedidos.</span>
        </h1>

        {/* Subline */}
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
          Todo está configurado. Compartí el enlace, hacé que alguien entre y probá cómo llega el primer pedido por WhatsApp.
        </p>

        {/* Public URL chip */}
        <Link
          href={plan.publicPath}
          target="_blank"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-4 py-2 text-sm transition hover:bg-black/[0.07] dark:hover:bg-white/8"
        >
          <span className="font-mono text-[13px] text-muted-foreground">{plan.publicUrl}</span>
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </section>
  )
}

function StatCard({
  value,
  label,
  done,
}: {
  value: string
  label: string
  done: boolean
}) {
  return (
    <div className="admin-surface rounded-xl p-4">
      <div className="flex items-center justify-between gap-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {done && <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

const QUICK_ACTIONS = [
  {
    href: '/admin/productos/nuevo',
    icon: Package,
    label: 'Agregar producto',
    description: 'Suma al catalogo',
  },
  {
    href: '/admin/apariencia?tab=contenido',
    icon: Palette,
    label: 'Portada y banner',
    description: 'Copy, imagen y movimiento',
  },
  {
    href: '/admin/apariencia',
    icon: Palette,
    label: 'Apariencia',
    description: 'Colores y estilo',
  },
  {
    href: '/admin/configuracion',
    icon: Settings,
    label: 'Configuracion',
    description: 'Datos del negocio',
  },
] as const

function QuickActionsSection() {
  return (
    <section className="admin-surface rounded-xl p-5 sm:p-6">
      <p className="admin-label">Acciones rapidas</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group admin-surface-muted flex items-center gap-3 rounded-xl p-3.5 transition duration-150 hover:-translate-y-0.5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] dark:bg-white/6 text-muted-foreground transition-colors group-hover:text-foreground">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
