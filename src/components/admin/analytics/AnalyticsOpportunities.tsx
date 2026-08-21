import { ArrowUpRight, CircleAlert, Lightbulb, Sparkles } from 'lucide-react'
import { buildCommercialOpportunities } from '@/lib/analytics/commercial-insights'
import type { StoreAnalyticsSnapshot } from '@/lib/queries/analytics'

const toneStyles = {
  opportunity: {
    icon: CircleAlert,
    wrapper: 'border-amber-500/18 bg-amber-500/[0.055]',
    iconWrap: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  },
  positive: {
    icon: Sparkles,
    wrapper: 'border-emerald-500/18 bg-emerald-500/[0.055]',
    iconWrap: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  },
  neutral: {
    icon: Lightbulb,
    wrapper: 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.035]',
    iconWrap: 'bg-slate-200/70 text-slate-600 dark:bg-white/8 dark:text-white/65',
  },
} as const

export function AnalyticsOpportunities({ snapshot }: { snapshot: StoreAnalyticsSnapshot }) {
  const opportunities = buildCommercialOpportunities(snapshot)
  if (!snapshot.hasData || opportunities.length === 0) return null

  return (
    <article className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="admin-label">Oportunidades</p>
          <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] text-foreground sm:text-lg">Qué haría ahora</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">VOLTA traduce las señales de la tienda en acciones simples. No hace falta interpretar gráficos.</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#12e89a]/12 text-emerald-700 dark:text-emerald-300">
          <ArrowUpRight className="size-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-2.5 lg:grid-cols-3">
        {opportunities.map((opportunity) => {
          const style = toneStyles[opportunity.tone]
          const Icon = style.icon
          return (
            <section key={opportunity.id} className={`rounded-[14px] border p-3.5 ${style.wrapper}`}>
              <div className={`flex size-8 items-center justify-center rounded-[9px] ${style.iconWrap}`}>
                <Icon className="size-4" />
              </div>
              <h4 className="mt-3 text-sm font-semibold leading-5 text-foreground">{opportunity.title}</h4>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{opportunity.body}</p>
              <p className="mt-3 border-t border-black/6 pt-3 text-xs font-semibold leading-5 text-foreground dark:border-white/8">
                {opportunity.action}
              </p>
            </section>
          )
        })}
      </div>
    </article>
  )
}
