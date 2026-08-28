import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  Eye,
  MessageCircle,
  PackageOpen,
  ShoppingBag,
  Store,
} from 'lucide-react'
import { requireInternalAdmin } from '@/lib/internal/auth'
import {
  getInternalStoreAnalytics,
  type InternalStoreAnalyticsDays,
  type InternalStoreAnalyticsStore,
} from '@/lib/internal/store-analytics'

export const dynamic = 'force-dynamic'

const DAY_OPTIONS: InternalStoreAnalyticsDays[] = [7, 30, 90]

function resolveDays(value: string | undefined): InternalStoreAnalyticsDays {
  const parsed = Number(value)
  return DAY_OPTIONS.includes(parsed as InternalStoreAnalyticsDays)
    ? (parsed as InternalStoreAnalyticsDays)
    : 30
}

function formatPercent(value: number) {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`
}

function formatDate(value: string | null) {
  if (!value) return 'Sin actividad'
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function InternalAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  await requireInternalAdmin()
  const params = await searchParams
  const days = resolveDays(params.days)
  const snapshot = await getInternalStoreAnalytics(days)
  const storesWithoutTraffic = snapshot.stores.filter((store) => store.isActive && store.visits === 0)
  const maxDailyVisits = Math.max(1, ...snapshot.daily.map((point) => point.visits))

  return (
    <main className="min-h-screen bg-[#f5f7f5] px-4 py-6 text-[#07120f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[24px] border border-black/7 bg-[#07120f] p-5 text-white shadow-[0_24px_70px_rgba(7,18,15,.12)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-emerald-200">
                <BarChart3 className="size-3.5" /> VOLTA interno
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">
                VOLTA Store · rendimiento global
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                Visitas, intención de compra y derivaciones a WhatsApp de todas las tiendas. Esta vista usa los mismos eventos reales que alimentan Rendimiento en cada admin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/internal/funnel" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/78 transition hover:bg-white/10">
                Activación <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/internal/billing" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/78 transition hover:bg-white/10">
                Billing <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#12e89a] px-4 text-xs font-bold text-[#04251a]">
                Ir al admin <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-3 rounded-[18px] border border-black/7 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-900">Ventana de análisis</p>
            <p className="mt-1 text-xs text-slate-500">
              Desde {new Date(snapshot.since).toLocaleDateString('es-AR')} · {snapshot.eventCount.toLocaleString('es-AR')} eventos · {snapshot.storesTotal} tiendas registradas
            </p>
          </div>
          <div className="inline-flex w-fit gap-1 rounded-full bg-slate-100 p-1">
            {DAY_OPTIONS.map((option) => (
              <Link
                key={option}
                href={`/internal/analytics?days=${option}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  days === option ? 'bg-[#07120f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {option} días
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard icon={Store} eyebrow="Cobertura" title="Tiendas con tráfico" value={`${snapshot.storesWithTraffic}/${snapshot.storesTotal}`} note={`${snapshot.activeStores} tiendas activas hoy.`} />
          <MetricCard icon={Eye} eyebrow="Tráfico" title="Visitas" value={snapshot.visits.toLocaleString('es-AR')} note="Sesiones de tienda registradas." />
          <MetricCard icon={PackageOpen} eyebrow="Interés" title="Productos vistos" value={snapshot.productViews.toLocaleString('es-AR')} note="Aperturas de detalle de producto." />
          <MetricCard icon={ShoppingBag} eyebrow="Intención" title="Al carrito" value={snapshot.addToCart.toLocaleString('es-AR')} note={`${snapshot.cartOpens.toLocaleString('es-AR')} aperturas de carrito.`} />
          <MetricCard icon={MessageCircle} eyebrow="Conversión" title="WhatsApp" value={snapshot.whatsapp.toLocaleString('es-AR')} note="Sesiones que avanzaron al checkout." />
          <MetricCard icon={BarChart3} eyebrow="Resultado" title="Visita → WhatsApp" value={formatPercent(snapshot.conversionRate)} note="Conversión por sesión, no venta confirmada." />
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-[22px] border border-black/7 bg-white p-4 sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700">Actividad</p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-.03em] text-slate-950">Visitas por día</h2>
              </div>
              <p className="text-xs text-slate-400">WhatsApp marcado en cada fila</p>
            </div>
            <div className="mt-5 space-y-2.5">
              {snapshot.daily.map((point) => (
                <div key={point.date} className="grid grid-cols-[4.8rem_1fr_auto] items-center gap-3">
                  <span className="text-[11px] font-medium text-slate-500">{new Date(`${point.date}T12:00:00Z`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#0f1720]" style={{ width: `${Math.max(point.visits > 0 ? 5 : 0, (point.visits / maxDailyVisits) * 100)}%` }} />
                  </div>
                  <span className="min-w-[5.6rem] text-right text-[11px] font-semibold text-slate-700">{point.visits} visitas · {point.whatsapp} WA</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-black/7 bg-white p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700">Adquisición</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-.03em] text-slate-950">Origen de las visitas</h2>
            {snapshot.sources.length ? (
              <div className="mt-4 overflow-hidden rounded-[14px] border border-black/6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-[.1em] text-slate-400">
                    <tr><th className="px-3 py-2.5">Origen</th><th className="px-3 py-2.5 text-right">Visitas</th><th className="px-3 py-2.5 text-right">WA</th><th className="px-3 py-2.5 text-right">Conv.</th></tr>
                  </thead>
                  <tbody>
                    {snapshot.sources.map((source) => (
                      <tr key={source.source} className="border-t border-black/6">
                        <td className="max-w-[11rem] truncate px-3 py-3 font-semibold text-slate-800">{source.source}</td>
                        <td className="px-3 py-3 text-right text-slate-600">{source.visits}</td>
                        <td className="px-3 py-3 text-right text-slate-600">{source.whatsapp}</td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-800">{formatPercent(source.conversionRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="mt-4 rounded-[14px] bg-slate-50 p-4 text-xs leading-5 text-slate-500">Todavía no hay tráfico suficiente para segmentar orígenes.</p>}
          </section>
        </div>

        <section className="rounded-[22px] border border-black/7 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700">Tiendas</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">Rendimiento por comercio</h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-slate-500">Ordenado por visitas. WhatsApp mide intención de continuar el pedido; no confirma que el mensaje haya sido enviado ni que exista una venta.</p>
          </div>
          <div className="mt-5 overflow-x-auto rounded-[14px] border border-black/6">
            <table className="min-w-[880px] w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[.1em] text-slate-400">
                <tr>
                  <th className="px-3 py-2.5">Tienda</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5 text-right">Visitas</th>
                  <th className="px-3 py-2.5 text-right">Productos</th>
                  <th className="px-3 py-2.5 text-right">Carrito</th>
                  <th className="px-3 py-2.5 text-right">WhatsApp</th>
                  <th className="px-3 py-2.5 text-right">Conv.</th>
                  <th className="px-3 py-2.5 text-right">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.stores.map((store) => <StoreRowView key={store.id} store={store} />)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[18px] border border-amber-200 bg-amber-50/70 p-4 text-amber-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Tiendas activas sin tráfico en esta ventana: {storesWithoutTraffic.length}</p>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-amber-900/70">Sirve como señal operativa: puede ser una tienda recién creada, todavía no compartida o con poco volumen. No la interpretes automáticamente como churn.</p>
            </div>
            {storesWithoutTraffic.length ? <p className="max-w-md text-xs leading-5 text-amber-900/70 sm:text-right">{storesWithoutTraffic.slice(0, 6).map((store) => store.name).join(' · ')}{storesWithoutTraffic.length > 6 ? ` · +${storesWithoutTraffic.length - 6}` : ''}</p> : null}
          </div>
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  icon: Icon,
  eyebrow,
  title,
  value,
  note,
}: {
  icon: typeof Eye
  eyebrow: string
  title: string
  value: string
  note: string
}) {
  return (
    <article className="rounded-[18px] border border-black/7 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700">{eyebrow}</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="size-4" /></span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-[-.045em] text-slate-950">{value}</p>
      <p className="mt-2 text-[11px] leading-5 text-slate-500">{note}</p>
    </article>
  )
}

function StoreRowView({ store }: { store: InternalStoreAnalyticsStore }) {
  const statusLabel = store.status === 'published' && store.isActive
    ? 'Publicada'
    : store.isActive
      ? store.status
      : 'Inactiva'

  return (
    <tr className="border-t border-black/6">
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="max-w-[14rem] truncate font-semibold text-slate-850">{store.name}</p>
            <p className="mt-0.5 max-w-[14rem] truncate text-[10px] text-slate-400">/{store.slug}</p>
          </div>
          {store.status === 'published' && store.isActive ? (
            <Link href={`/tienda/${store.slug}`} target="_blank" rel="noreferrer" className="text-slate-300 transition hover:text-emerald-700" aria-label={`Abrir ${store.name}`}>
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-3.5"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${store.status === 'published' && store.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{statusLabel}</span></td>
      <td className="px-3 py-3.5 text-right font-semibold text-slate-800">{store.visits}</td>
      <td className="px-3 py-3.5 text-right text-slate-600">{store.productViews}</td>
      <td className="px-3 py-3.5 text-right text-slate-600">{store.addToCart}</td>
      <td className="px-3 py-3.5 text-right font-semibold text-slate-800">{store.whatsapp}</td>
      <td className="px-3 py-3.5 text-right font-semibold text-slate-800">{formatPercent(store.conversionRate)}</td>
      <td className="px-3 py-3.5 text-right text-[11px] text-slate-500">{formatDate(store.lastEventAt)}</td>
    </tr>
  )
}
