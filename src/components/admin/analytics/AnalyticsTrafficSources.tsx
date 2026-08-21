import { Link2, MessageCircle } from 'lucide-react'
import type { AttributionPeriodSnapshot } from '@/lib/queries/attribution'

export function AnalyticsTrafficSources({ snapshot, available }: { snapshot: AttributionPeriodSnapshot; available: boolean }) {
  if (!available) return null

  return (
    <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-label">Origen de las visitas</p>
          <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] text-foreground">De dónde llega la gente</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Usá links medibles desde Compartir para separar Instagram, WhatsApp, QR y campañas.</p>
        </div>
        {snapshot.hasAttributedData ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Link2 className="size-3" /> Medición activa
          </span>
        ) : null}
      </div>

      {!snapshot.hasData ? (
        <div className="mt-4 rounded-[13px] border border-dashed border-black/10 px-4 py-5 text-center dark:border-white/12">
          <p className="text-sm font-semibold text-foreground">Todavía no hay visitas para comparar.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Cuando compartas links medibles, VOLTA va a mostrar qué canal trae mejores oportunidades.</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-black/6 dark:divide-white/7">
          {snapshot.sources.map((source) => (
            <div key={`${source.source}:${source.campaign || ''}`} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{source.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{source.visits} visita{source.visits === 1 ? '' : 's'}</p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-xs font-semibold text-foreground"><MessageCircle className="size-3" />{source.whatsapp}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">WhatsApp</p>
              </div>
              <div className="min-w-14 text-right">
                <p className="text-xs font-semibold tabular-nums text-foreground">{Math.round(source.conversionRate)}%</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">conversión</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
