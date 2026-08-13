import { Eye, MessageCircle, PackageOpen } from 'lucide-react'
import type { StoreAnalyticsSummary } from '@/lib/queries/analytics'

export function StoreAnalyticsPanel({ analytics }: { analytics: StoreAnalyticsSummary }) {
  if (!analytics.available) return null

  return (
    <section>
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <div><p className="admin-label">Últimos 7 días</p><h2 className="mt-1 text-base font-semibold text-foreground sm:text-lg">Cómo está funcionando</h2></div>
        {analytics.hasData ? <p className="text-xs font-medium text-muted-foreground">{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(analytics.conversionRate)}% llegó a WhatsApp</p> : null}
      </div>

      {analytics.hasData ? (
        <div className="grid grid-cols-3 gap-2">
          <Metric icon={Eye} label="Visitas" value={analytics.visits} />
          <Metric icon={PackageOpen} label="Productos" value={analytics.productViews} />
          <Metric icon={MessageCircle} label="WhatsApp" value={analytics.whatsappClicks} highlight />
        </div>
      ) : (
        <div className="rounded-[14px] border border-black/8 bg-white px-4 py-3 text-sm text-muted-foreground dark:border-white/10 dark:bg-[#111820]">Todavía no hay visitas. Compartí tu tienda para empezar a medir.</div>
      )}

      {analytics.topProduct ? <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Más visto:</span> {analytics.topProduct.name}</p> : null}
    </section>
  )
}

function Metric({ icon: Icon, label, value, highlight = false }: { icon: typeof Eye; label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-[13px] border border-black/8 bg-white p-3 dark:border-white/10 dark:bg-[#111820]">
      <Icon className={`size-4 ${highlight ? 'text-emerald-500' : 'text-slate-400'}`} />
      <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tracking-[-0.05em] text-foreground">{value}</p>
    </div>
  )
}
