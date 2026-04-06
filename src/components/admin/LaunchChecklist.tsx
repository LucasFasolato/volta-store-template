import type { ElementType } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Sparkles,
} from 'lucide-react'
import type { LaunchChecklistItem, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { cn } from '@/lib/utils'

export function LaunchChecklist({ plan }: { plan: StoreLaunchPlan }) {
  return (
    <section className="admin-surface rounded-[30px] p-5 sm:p-6">
      <div className="mb-6">
        <p className="admin-label">Checklist de lanzamiento</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Lo que falta y lo que ya transmite confianza</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
          Primero completa lo esencial para compartir. Despues suma detalles que ayudan a vender con mas tranquilidad.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChecklistGroup
          title="Esencial para compartir"
          subtitle="Esto define si la tienda ya puede salir al mundo con una base clara."
          items={plan.requiredItems}
        />
        <ChecklistGroup
          title="Recomendado para dar mas confianza"
          subtitle="Pequenos detalles que hacen que el negocio se vea mas solido."
          items={plan.recommendedItems}
        />
      </div>
    </section>
  )
}

function ChecklistGroup({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: LaunchChecklistItem[]
}) {
  return (
    <div className="admin-surface-muted rounded-[26px] p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">{subtitle}</p>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function ChecklistRow({ item }: { item: LaunchChecklistItem }) {
  const statusTone = checklistTone[item.status]

  return (
    <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl', statusTone.iconClass)}>
          <statusTone.Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <span className={cn('rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', statusTone.badgeClass)}>
                  {statusTone.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-400">{item.description}</p>
            </div>

            {item.status === 'done' ? null : (
              <Link
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-white"
              >
                {item.ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const checklistTone = {
  done: {
    Icon: CheckCircle2,
    label: 'Listo',
    iconClass: 'bg-emerald-400/12 text-emerald-100',
    badgeClass: 'border-emerald-300/18 bg-emerald-400/8 text-emerald-100',
  },
  missing: {
    Icon: CircleDashed,
    label: 'Falta',
    iconClass: 'bg-white/8 text-neutral-300',
    badgeClass: 'border-white/10 bg-white/6 text-neutral-300',
  },
  recommended: {
    Icon: Sparkles,
    label: 'Recomendado',
    iconClass: 'bg-amber-300/12 text-amber-100',
    badgeClass: 'border-amber-300/18 bg-amber-400/8 text-amber-100',
  },
} satisfies Record<
  LaunchChecklistItem['status'],
  {
    Icon: ElementType
    label: string
    iconClass: string
    badgeClass: string
  }
>
