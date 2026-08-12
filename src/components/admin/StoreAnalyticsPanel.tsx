import { Eye, MessageCircle, PackageOpen, ShoppingBag, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StoreAnalyticsSummary } from '@/lib/queries/analytics'

export function StoreAnalyticsPanel({ analytics }: { analytics: StoreAnalyticsSummary }) {
  const conversionLabel = `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(analytics.conversionRate)}%`

  return (
    <section>
      <div className="volta-section-heading">
        <div>
          <p className="admin-label">Últimos 7 días</p>
          <h2>Cómo está funcionando tu tienda</h2>
        </div>
        {analytics.hasData ? (
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Visitas → WhatsApp</p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-foreground">{conversionLabel}</p>
          </div>
        ) : null}
      </div>

      {!analytics.available ? (
        <div className="rounded-[14px] border border-amber-300/30 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-300/15 dark:bg-amber-300/5 dark:text-amber-100">
          Las métricas se activan cuando esté aplicada la actualización de Analytics. El resto de la tienda sigue funcionando normalmente.
        </div>
      ) : analytics.hasData ? (
        <>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
            <Metric icon={Eye} label="Visitas" value={analytics.visits} help="Personas que abrieron tu tienda" />
            <Metric icon={PackageOpen} label="Productos vistos" value={analytics.productViews} help="Aperturas de detalle" />
            <Metric icon={ShoppingBag} label="Agregados" value={analytics.addToCart} help="Veces que sumaron un producto" />
            <Metric icon={MessageCircle} label="Fueron a WhatsApp" value={analytics.whatsappClicks} help="Pedidos que avanzaron a WhatsApp" highlight />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Conversión</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[1.8rem] font-semibold tracking-[-0.055em] text-foreground">{conversionLabel}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {analytics.visits > 0
                      ? `${analytics.whatsappClicks} de ${analytics.visits} visitas llegaron a WhatsApp.`
                      : 'Todavía no hay visitas suficientes para calcularla.'}
                  </p>
                </div>
                <MessageCircle className="size-5 text-[#12e89a]" />
              </div>
            </div>

            <div className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Producto que más llamó la atención</p>
              {analytics.topProduct ? (
                <>
                  <p className="mt-2 truncate text-base font-semibold text-foreground">{analytics.topProduct.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{analytics.topProduct.views} {analytics.topProduct.views === 1 ? 'vista' : 'vistas'} de producto esta semana.</p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Cuando tus clientes abran productos, vas a ver acá cuál genera más interés.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-[16px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#12e89a]/10 text-emerald-600 dark:text-[#12e89a]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Todavía no hay actividad para mostrar</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Compartí tu tienda. Apenas empiecen a entrar clientes vas a ver visitas, productos vistos y cuántos avanzan a WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  help,
  highlight = false,
}: {
  icon: LucideIcon
  label: string
  value: number
  help: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-3.5 dark:border-white/10 dark:bg-[#111820] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-8 items-center justify-center rounded-[9px] ${highlight ? 'bg-[#12e89a]/12 text-emerald-600 dark:text-[#12e89a]' : 'bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-white/45'}`}>
          <Icon className="size-4" />
        </span>
        {highlight ? <span className="size-2 rounded-full bg-[#12e89a]" /> : null}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground">{value}</p>
      <p className="mt-1 hidden text-[11px] leading-4 text-muted-foreground sm:block">{help}</p>
    </div>
  )
}
