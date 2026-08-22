'use client'

import { useState } from 'react'
import { Eye, MessageCircle, PackageOpen, ShoppingBag, TriangleAlert } from 'lucide-react'
import { AnalyticsActivityChart } from '@/components/admin/analytics/AnalyticsActivityChart'
import { AnalyticsConversionFunnel } from '@/components/admin/analytics/AnalyticsConversionFunnel'
import { AnalyticsMetricCard } from '@/components/admin/analytics/AnalyticsMetricCard'
import { AnalyticsOpportunities } from '@/components/admin/analytics/AnalyticsOpportunities'
import { AnalyticsTopProducts } from '@/components/admin/analytics/AnalyticsTopProducts'
import { AnalyticsTrafficSources } from '@/components/admin/analytics/AnalyticsTrafficSources'
import { PlanUpgradePrompt } from '@/components/admin/PlanUpgradePrompt'
import type { CommercialPlanCode } from '@/lib/billing/plan'
import type { StoreAttributionSummary } from '@/lib/queries/attribution'
import type { AnalyticsPeriodKey, StoreAnalyticsSummary } from '@/lib/queries/analytics'

const PERIODS: Array<{ key: AnalyticsPeriodKey; label: string }> = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
]

export function StoreAnalyticsPanel({
  analytics,
  attribution,
  planCode = 'volta',
}: {
  analytics: StoreAnalyticsSummary
  attribution: StoreAttributionSummary
  planCode?: CommercialPlanCode
}) {
  const [period, setPeriod] = useState<AnalyticsPeriodKey>('30d')

  if (!analytics.available) {
    return (
      <section className="rounded-[16px] border border-black/8 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#111820] sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"><TriangleAlert className="size-4" /></div>
          <div><p className="text-sm font-semibold text-foreground">No pudimos cargar las estadísticas</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Tu tienda sigue funcionando normalmente. Volvé a intentar más tarde.</p></div>
        </div>
      </section>
    )
  }

  const snapshot = analytics.periods[period]
  const isFree = planCode === 'free'
  const isPro = planCode === 'pro'

  return (
    <section className="space-y-3.5 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="admin-label">Rendimiento</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.035em] text-foreground sm:text-xl">Qué está pasando en tu tienda</h2><p className="mt-1 text-xs text-muted-foreground">Visitas e intención de compra convertidas en decisiones simples.</p></div>
        <div className="inline-flex w-fit rounded-[11px] border border-black/8 bg-white p-1 dark:border-white/10 dark:bg-[#111820]" aria-label="Período de estadísticas">
          {PERIODS.map((option) => (
            <button key={option.key} type="button" onClick={() => setPeriod(option.key)} aria-pressed={period === option.key} className={`min-h-8 rounded-[8px] px-3 text-xs font-semibold transition ${period === option.key ? 'bg-slate-100 text-foreground dark:bg-white/10' : 'text-muted-foreground hover:text-foreground'}`}>{option.label}</button>
          ))}
        </div>
      </div>

      {!snapshot.hasData ? (
        <div className="rounded-[18px] border border-black/8 bg-white px-5 py-8 text-center dark:border-white/10 dark:bg-[#111820] sm:py-10">
          <div className="mx-auto flex size-10 items-center justify-center rounded-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><Eye className="size-4" /></div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Todavía no hay actividad en este período</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Compartí tu tienda. Cuando tus clientes entren, vas a empezar a construir historial acá.</p>
        </div>
      ) : isFree ? (
        <>
          <div className="max-w-sm"><AnalyticsMetricCard icon={Eye} label="Visitas" metric={snapshot.visits} /></div>
          <PlanUpgradePrompt
            title="Ya sabés que la gente está entrando. Ahora entendé qué hace después."
            description="Con VOLTA desbloqueás productos vistos, carrito, WhatsApp, funnel, tendencias y los productos que generan mayor intención de compra."
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <AnalyticsMetricCard icon={Eye} label="Visitas" metric={snapshot.visits} />
            <AnalyticsMetricCard icon={PackageOpen} label="Productos vistos" metric={snapshot.productViews} />
            <AnalyticsMetricCard icon={ShoppingBag} label="Al carrito" metric={snapshot.addToCart} />
            <AnalyticsMetricCard icon={MessageCircle} label="WhatsApp" metric={snapshot.whatsappClicks} highlight />
          </div>

          {isPro ? (
            <>
              <AnalyticsOpportunities snapshot={snapshot} />
              <AnalyticsTrafficSources snapshot={attribution.periods[period]} available={attribution.available} />
            </>
          ) : (
            <PlanUpgradePrompt
              compact
              eyebrow="Tus datos ya pueden decirte qué hacer después"
              title="Compará canales y recibí oportunidades priorizadas con PRO."
              description="Tu historial ya se está construyendo. PRO abre la atribución por canal, campañas y recomendaciones comerciales sin perder los datos anteriores."
              target="VOLTA PRO"
            />
          )}

          <AnalyticsActivityChart data={snapshot.daily} />
          <div className="grid gap-3.5 lg:grid-cols-[0.88fr_1.12fr] lg:gap-4">
            <AnalyticsConversionFunnel snapshot={snapshot} />
            <AnalyticsTopProducts snapshot={snapshot} />
          </div>
        </>
      )}
    </section>
  )
}
