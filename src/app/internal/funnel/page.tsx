import Link from 'next/link'
import { ArrowRight, BarChart3, Clock3, ExternalLink, UsersRound } from 'lucide-react'
import { requireInternalAdmin } from '@/lib/internal/auth'
import {
  getInternalActivationFunnel,
  type InternalFunnelDays,
} from '@/lib/internal/funnel'

export const dynamic = 'force-dynamic'

const DAY_OPTIONS: InternalFunnelDays[] = [7, 30, 90]

function resolveDays(value: string | undefined): InternalFunnelDays {
  const parsed = Number(value)
  return DAY_OPTIONS.includes(parsed as InternalFunnelDays)
    ? (parsed as InternalFunnelDays)
    : 30
}

function formatPercent(value: number | null) {
  return value === null ? '—' : `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`
}

function formatMinutes(value: number | null) {
  if (value === null) return 'Sin señal suficiente'
  if (value < 60) return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} min`
  return `${(value / 60).toLocaleString('es-AR', { maximumFractionDigits: 1 })} h`
}

function stageTone(index: number, total: number) {
  if (index === total - 1) return 'border-emerald-300/60 bg-emerald-50/75'
  if (index >= 3) return 'border-slate-200 bg-white'
  return 'border-slate-200 bg-slate-50/80'
}

export default async function InternalFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  await requireInternalAdmin()
  const params = await searchParams
  const days = resolveDays(params.days)
  const { snapshot, eventCount, since } = await getInternalActivationFunnel(days)

  const storeCreated = snapshot.stages.find((stage) => stage.key === 'store_created')?.count ?? 0
  const firstShare = snapshot.stages.find((stage) => stage.key === 'first_share')?.count ?? 0

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
                Adquisición → primera vez que comparte
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                Medí el recorrido real antes de volver a tocar Activation. `first_share` representa una acción deliberada de distribución desde VOLTA, no entrega al destinatario ni una venta confirmada.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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
            <p className="mt-1 text-xs text-slate-500">Desde {new Date(since).toLocaleDateString('es-AR')} · {eventCount} eventos cargados</p>
          </div>
          <div className="inline-flex w-fit gap-1 rounded-full bg-slate-100 p-1">
            {DAY_OPTIONS.map((option) => (
              <Link
                key={option}
                href={`/internal/funnel?days=${option}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  days === option ? 'bg-[#07120f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {option} días
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Clock3}
            eyebrow="North Star"
            title="Time to First Share"
            value={formatMinutes(snapshot.medianSignupToFirstShareMinutes)}
            note="Mediana signup iniciado → primer share cuando la sesión puede unirse. Objetivo actual: < 10 min."
          />
          <MetricCard
            icon={Clock3}
            eyebrow="Activación"
            title="Tienda → primer share"
            value={formatMinutes(snapshot.medianStoreToFirstShareMinutes)}
            note="Mediana desde store_created. Sirve incluso cuando el login cambia de navegador."
          />
          <MetricCard
            icon={UsersRound}
            eyebrow="Cobertura"
            title="Sesión unida"
            value={formatPercent(snapshot.sessionJoinCoveragePercent)}
            note="Qué proporción de tiendas creadas conserva la sesión anónima de signup. No confundir pérdida de join con abandono."
          />
          <MetricCard
            icon={BarChart3}
            eyebrow="Cohorte"
            title="Tiendas que compartieron"
            value={storeCreated ? `${firstShare}/${storeCreated}` : '—'}
            note={storeCreated ? `${formatPercent((firstShare / storeCreated) * 100)} de la cohorte store_created.` : 'Todavía no hay cohortes nuevas en esta ventana.'}
          />
        </section>

        <section className="rounded-[22px] border border-black/7 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-emerald-700">Funnel</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">Dónde se pierde activación</h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-slate-500">
              Los primeros pasos cuentan sesiones/usuarios y los hitos de activación cuentan tiendas. Si una tasa supera 100%, revisá cobertura antes de sacar conclusiones.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {snapshot.stages.map((stage, index) => (
              <article key={stage.key} className={`rounded-[16px] border p-4 ${stageTone(index, snapshot.stages.length)}`}>
                <p className="text-[10px] font-bold uppercase tracking-[.13em] text-slate-400">{String(index + 1).padStart(2, '0')}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-.05em] text-slate-950">{stage.count}</p>
                <p className="mt-1 min-h-9 text-xs font-semibold leading-4 text-slate-700">{stage.label}</p>
                <p className="mt-3 border-t border-black/6 pt-2 text-[10px] font-medium text-slate-400">
                  {index === 0 ? 'Entrada' : `${formatPercent(stage.conversionFromPrevious)} del paso anterior`}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <SegmentTable title="Origen de las tiendas creadas" rows={snapshot.sources} empty="Todavía no hay source/campaign suficiente en esta cohorte." />
          <SegmentTable title="Dispositivo de adquisición" rows={snapshot.devices} empty="Todavía no hay device suficiente en esta cohorte." />
        </div>

        <section className="rounded-[18px] border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
          <p className="font-semibold">Cómo leer esto</p>
          <p className="mt-1 max-w-4xl text-xs leading-5 text-amber-900/70">
            No optimices un paso sólo porque su porcentaje sea bajo. Primero comprobá volumen y cobertura. La siguiente decisión de Activation 2.x debe responder a una caída repetida en usuarios reales, no a una muestra mínima ni a eventos históricos incompletos.
          </p>
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
  icon: typeof Clock3
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
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="size-4" /></span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-[-.045em] text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  )
}

function SegmentTable({
  title,
  rows,
  empty,
}: {
  title: string
  rows: Array<{ label: string; stores: number; shared: number; shareRate: number | null }>
  empty: string
}) {
  return (
    <section className="rounded-[22px] border border-black/7 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold tracking-[-.03em] text-slate-950">{title}</h2>
      {rows.length ? (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-black/6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.1em] text-slate-400">
              <tr><th className="px-3 py-2.5">Segmento</th><th className="px-3 py-2.5 text-right">Tiendas</th><th className="px-3 py-2.5 text-right">Share</th><th className="px-3 py-2.5 text-right">Conv.</th></tr>
            </thead>
            <tbody>
              {rows.slice(0, 8).map((row) => (
                <tr key={row.label} className="border-t border-black/6">
                  <td className="px-3 py-3 font-semibold text-slate-800">{row.label}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{row.stores}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{row.shared}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-800">{formatPercent(row.shareRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-4 rounded-[14px] bg-slate-50 p-4 text-xs leading-5 text-slate-500">{empty}</p>}
    </section>
  )
}
