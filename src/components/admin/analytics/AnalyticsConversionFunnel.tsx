import { ArrowDown, MessageCircle } from 'lucide-react'
import type { StoreAnalyticsSnapshot } from '@/lib/queries/analytics'

export function AnalyticsConversionFunnel({ snapshot }: { snapshot: StoreAnalyticsSnapshot }) {
  const stages = [
    { label: 'Visitas', value: snapshot.visits.value },
    { label: 'Productos vistos', value: snapshot.productViews.value },
    { label: 'Agregados al carrito', value: snapshot.addToCart.value },
    { label: 'WhatsApp', value: snapshot.whatsappClicks.value, highlight: true },
  ]

  const maxValue = Math.max(1, ...stages.map((stage) => stage.value))

  return (
    <article className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-label">Conversión</p>
          <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] text-foreground sm:text-lg">Cómo avanza la compra</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Las señales principales desde la visita hasta WhatsApp.</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          <MessageCircle className="size-4" />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {stages.map((stage, index) => {
          const width = stage.value === 0 ? 0 : Math.max(8, (stage.value / maxValue) * 100)
          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className={stage.highlight ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}>{stage.label}</span>
                <span className={`font-semibold tabular-nums ${stage.highlight ? 'text-emerald-600 dark:text-emerald-300' : 'text-foreground'}`}>
                  {new Intl.NumberFormat('es-AR').format(stage.value)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  className={`h-full rounded-full ${stage.highlight ? 'bg-[#12e89a]' : 'bg-slate-300 dark:bg-white/20'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              {index < stages.length - 1 ? (
                <div className="flex h-4 items-center pl-2 text-slate-300 dark:text-white/15"><ArrowDown className="size-3" /></div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 rounded-[13px] border border-emerald-500/15 bg-emerald-500/[0.055] px-3.5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-emerald-700/75 dark:text-emerald-300/70">Conversión a WhatsApp</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-foreground">
            {new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(snapshot.conversionRate)}%
          </p>
        </div>
        <p className="max-w-[11rem] text-right text-[11px] leading-4 text-muted-foreground">Sesiones que avanzaron desde la tienda hacia WhatsApp.</p>
      </div>
    </article>
  )
}
