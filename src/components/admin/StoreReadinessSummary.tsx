import type { ElementType } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CircleDashed,
  Globe,
  Sparkles,
} from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { cn } from '@/lib/utils'

export function StoreReadinessSummary({ plan }: { plan: StoreLaunchPlan }) {
  const tone = readinessTone[plan.state]

  return (
    <section className="admin-surface relative overflow-hidden rounded-[32px] p-6 sm:p-7">
      <div className={cn('absolute inset-x-0 top-0 h-px', tone.edgeClass)} />
      <div
        className={cn(
          'absolute right-[-2rem] top-[-2rem] h-40 w-40 rounded-full blur-3xl',
          tone.glowClass,
        )}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]', tone.badgeClass)}>
              <tone.Icon className="size-3.5" />
              {plan.stateLabel}
            </div>
            <h2 className="mt-4 text-[1.9rem] font-semibold tracking-[-0.05em] text-white sm:text-[2.35rem]">
              {plan.headline}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-[15px]">
              {plan.summary}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={plan.nextBestAction.href}
              className={cn(
                'inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold text-white transition hover:brightness-110',
                tone.ctaClass,
              )}
            >
              {plan.isPublished ? 'Compartir tienda' : plan.nextBestAction.label}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.9fr]">
          <MetricCard
            label="Puntos esenciales"
            value={`${plan.completedRequiredCount} de ${plan.totalRequiredCount}`}
            detail={
              plan.canPublish
                ? 'Todo lo necesario ya esta listo para publicar.'
                : `${plan.missingRequiredCount} punto${plan.missingRequiredCount === 1 ? '' : 's'} por completar.`
            }
          />
          <MetricCard
            label="Confianza comercial"
            value={`${plan.completedRecommendedCount} de ${plan.totalRecommendedCount}`}
            detail="Detalles que ayudan a vender con mas tranquilidad."
          />
          <MetricCard
            label="Progreso"
            value={`${plan.requiredCompletionPercent}%`}
            detail="Calculado sobre lo esencial para salir a compartir."
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Preparacion para compartir
            </p>
            <p className="text-xs text-neutral-400">
              {plan.completedRequiredCount} / {plan.totalRequiredCount}
            </p>
          </div>
          <div className="h-2 rounded-full bg-white/6">
            <div
              className={cn('h-full rounded-full transition-all', tone.progressClass)}
              style={{ width: `${plan.requiredCompletionPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="admin-surface-muted rounded-[24px] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{detail}</p>
    </div>
  )
}

const readinessTone = {
  draft: {
    Icon: CircleDashed,
    badgeClass: 'border-white/10 bg-white/6 text-neutral-200',
    ctaClass: 'border-white/10 bg-white/6 hover:bg-white/10',
    edgeClass: 'bg-white/10',
    progressClass: 'bg-[linear-gradient(90deg,rgba(115,115,115,0.9),rgba(212,212,212,0.6))]',
    glowClass: 'bg-white/8',
  },
  ready: {
    Icon: Sparkles,
    badgeClass: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
    ctaClass:
      'border-amber-300/24 bg-[linear-gradient(135deg,rgba(251,191,36,0.22),rgba(251,146,60,0.12))] hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.28),rgba(251,146,60,0.16))]',
    edgeClass: 'bg-amber-300/40',
    progressClass: 'bg-[linear-gradient(90deg,rgba(251,191,36,0.95),rgba(251,146,60,0.7))]',
    glowClass: 'bg-amber-300/16',
  },
  published: {
    Icon: Globe,
    badgeClass: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
    ctaClass:
      'border-emerald-300/24 bg-[linear-gradient(135deg,rgba(46,230,166,0.22),rgba(111,243,223,0.12))] hover:bg-[linear-gradient(135deg,rgba(46,230,166,0.28),rgba(111,243,223,0.16))]',
    edgeClass: 'bg-emerald-300/45',
    progressClass: 'bg-[linear-gradient(90deg,rgba(46,230,166,0.95),rgba(111,243,223,0.75))]',
    glowClass: 'bg-emerald-300/16',
  },
} satisfies Record<
  StoreLaunchPlan['state'],
  {
    Icon: ElementType
    badgeClass: string
    ctaClass: string
    edgeClass: string
    progressClass: string
    glowClass: string
  }
>
