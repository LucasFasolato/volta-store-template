import Link from 'next/link'
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Package,
  Palette,
  Settings,
} from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { StoreSharePanel } from '@/components/admin/StoreSharePanel'

export function StoreDashboard({
  plan,
  storeName,
  activeProductCount,
  categoryCount,
}: {
  plan: StoreLaunchPlan
  storeName: string
  activeProductCount: number
  categoryCount: number
}) {
  const heroDone =
    plan.requiredItems.find((i) => i.id === 'hero-copy')?.status === 'done' &&
    plan.requiredItems.find((i) => i.id === 'hero-image')?.status === 'done'

  const stats: { value: string; label: string; done: boolean }[] = [
    {
      value: String(activeProductCount),
      label: activeProductCount === 1 ? 'producto activo' : 'productos activos',
      done: activeProductCount >= 3,
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
      {/* 1. Status — "you're ready" */}
      <ReadyHero plan={plan} storeName={storeName} />

      {/* 2. Share — primary action */}
      <StoreSharePanel plan={plan} />

      {/* 3. Stats — store snapshot */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} value={stat.value} label={stat.label} done={stat.done} />
        ))}
      </div>

      {/* 4. Quick actions — management */}
      <QuickActionsSection />
    </div>
  )
}

function ReadyHero({ plan, storeName }: { plan: StoreLaunchPlan; storeName: string }) {
  return (
    <section className="admin-surface relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-emerald-300/45" />
      <div
        className="absolute right-[-2rem] top-[-2rem] h-44 w-44 rounded-full bg-emerald-300/16 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Lista para compartir
          </span>
        </div>

        <h1 className="mt-4 text-balance font-heading text-[1.75rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.2rem]">
          {storeName} esta en marcha.
        </h1>

        <p className="mt-2.5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
          Ya tenes lo necesario para mostrarla con confianza y empezar a recibir pedidos por WhatsApp.
        </p>

        <Link
          href={plan.publicPath}
          target="_blank"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <span className="font-mono text-[13px]">{plan.publicUrl}</span>
          <ExternalLink className="size-3.5 shrink-0" />
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
    href: '/admin/contenido',
    icon: FileText,
    label: 'Editar portada',
    description: 'Portada e imagen',
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
