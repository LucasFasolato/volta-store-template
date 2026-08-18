import { Lightbulb, TrendingUp } from 'lucide-react'
import type { AnalyticsInsight } from '@/lib/queries/analytics'

export function AnalyticsInsightCard({ insight }: { insight: AnalyticsInsight }) {
  const positive = insight.tone === 'positive'
  const Icon = positive ? TrendingUp : Lightbulb

  return (
    <article className={`rounded-[16px] border px-4 py-3.5 sm:px-5 ${
      positive
        ? 'border-emerald-500/15 bg-emerald-500/[0.055]'
        : 'border-amber-500/15 bg-amber-500/[0.055]'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[9px] ${
          positive
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
        }`}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{insight.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{insight.body}</p>
        </div>
      </div>
    </article>
  )
}
