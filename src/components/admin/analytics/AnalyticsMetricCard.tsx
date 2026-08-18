import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { AnalyticsComparableMetric } from '@/lib/queries/analytics'

export function AnalyticsMetricCard({
  icon: Icon,
  label,
  metric,
  highlight = false,
}: {
  icon: LucideIcon
  label: string
  metric: AnalyticsComparableMetric
  highlight?: boolean
}) {
  const comparison = formatComparison(metric)
  const ComparisonIcon = comparison.direction === 'up'
    ? ArrowUpRight
    : comparison.direction === 'down'
      ? ArrowDownRight
      : Minus

  return (
    <article className="rounded-[16px] border border-black/8 bg-white p-3.5 dark:border-white/10 dark:bg-[#111820] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex size-8 items-center justify-center rounded-[9px] ${
            highlight
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          <Icon className="size-4" />
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
            comparison.direction === 'up' && highlight
              ? 'text-emerald-600 dark:text-emerald-300'
              : 'text-muted-foreground'
          }`}
          title="Comparado con el período anterior"
        >
          <ComparisonIcon className="size-3" />
          {comparison.label}
        </span>
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[1.65rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[1.9rem]">
        {new Intl.NumberFormat('es-AR').format(metric.value)}
      </p>
    </article>
  )
}

function formatComparison(metric: AnalyticsComparableMetric): {
  label: string
  direction: 'up' | 'down' | 'flat'
} {
  if (metric.changePercent == null) {
    return { label: 'Nuevo', direction: 'up' }
  }

  const rounded = Math.round(metric.changePercent)
  if (Math.abs(rounded) < 1) return { label: 'Sin cambios', direction: 'flat' }

  return {
    label: `${Math.abs(rounded)}%`,
    direction: rounded > 0 ? 'up' : 'down',
  }
}
