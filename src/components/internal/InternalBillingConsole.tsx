'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock3, Gift, Loader2, Search, ShieldCheck, WalletCards, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { grantComplimentaryAccess, revokeComplimentaryAccess } from '@/lib/actions/internal-billing'
import type { InternalBillingEconomics, InternalBillingStore } from '@/lib/internal/billing'

function formatDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function money(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

function statusLabel(status: string | null) {
  if (!status || status === 'not_started') return 'Sin suscripción'
  if (status === 'active') return 'Suscripción activa'
  if (status === 'canceled') return 'Renovación cancelada'
  if (status === 'pending' || status === 'creating') return 'Activación pendiente'
  if (status === 'paused') return 'Pausada'
  return 'Requiere atención'
}

function planLabel(store: InternalBillingStore) {
  if (store.complimentary) return 'VOLTA bonificado'
  if (store.planCode === 'pro') return 'VOLTA PRO'
  if (store.planCode === 'volta') return 'VOLTA'
  return 'Gratis'
}

export function InternalBillingConsole({ stores, economics }: { stores: InternalBillingStore[]; economics: InternalBillingEconomics }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'volta' | 'pro' | 'complimentary'>('all')
  const [pendingStoreId, setPendingStoreId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return stores.filter((store) => {
      const matchesTerm = !term || [store.name, store.slug, store.ownerEmail || ''].some((value) => value.toLowerCase().includes(term))
      const matchesFilter = filter === 'all'
        || (filter === 'complimentary' && store.complimentary)
        || (!store.complimentary && filter === store.planCode)
      return matchesTerm && matchesFilter
    })
  }, [filter, query, stores])

  function grant(store: InternalBillingStore, form: HTMLFormElement) {
    const data = new FormData(form)
    const expiresOn = String(data.get('expiresOn') || '').trim() || null
    const note = String(data.get('note') || '').trim() || null
    setPendingStoreId(store.id)
    startTransition(async () => {
      const result = await grantComplimentaryAccess({ storeId: store.id, expiresOn, note })
      setPendingStoreId(null)
      if (result.error) toast.error(result.error)
      else {
        toast.success(`${store.name} quedó con acceso bonificado.`)
        window.location.reload()
      }
    })
  }

  function revoke(store: InternalBillingStore) {
    if (!window.confirm(`¿Quitar el acceso bonificado de ${store.name}? No se creará ningún cobro automáticamente.`)) return
    setPendingStoreId(store.id)
    startTransition(async () => {
      const result = await revokeComplimentaryAccess(store.id)
      setPendingStoreId(null)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Bonificación desactivada.')
        window.location.reload()
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f7f9] px-4 py-6 text-slate-950 dark:bg-[#090d12] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300"><ShieldCheck className="size-4" />Control interno VOLTA</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Billing y unit economics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/55">Planes, bonificaciones y una lectura simple de cuánto facturamos y cuánto queda después del procesador.</p>
          </div>
          <Link href="/admin" className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-black/10 bg-white px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/5">Volver al admin</Link>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Cobros aprobados" value={String(economics.approvedPayments)} />
          <Metric label="Facturación bruta" value={money(economics.grossRevenue)} />
          <Metric label="Neto conocido" value={economics.knownNetPayments ? money(economics.knownNetRevenue) : 'Pendiente'} hint={`${economics.knownNetPayments}/${economics.approvedPayments} pagos conciliados`} />
          <Metric label="Costo procesador" value={economics.knownNetPayments ? money(economics.processorFees) : 'Pendiente'} hint={economics.effectiveFeeRate == null ? 'Se completa al conciliar pagos' : `${(economics.effectiveFeeRate * 100).toFixed(1)}% efectivo`} icon />
        </section>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tienda o email" className="h-11 w-full rounded-[12px] border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'free', 'volta', 'pro', 'complimentary'] as const).map((value) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === value ? 'bg-[#10161d] text-white dark:bg-[#12e89a] dark:text-[#062117]' : 'border border-black/8 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60'}`}>
                {value === 'all' ? 'Todos' : value === 'free' ? 'Gratis' : value === 'volta' ? 'VOLTA' : value === 'pro' ? 'PRO' : 'Bonificados'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((store) => {
            const busy = isPending && pendingStoreId === store.id
            return (
              <section key={store.id} className="rounded-[18px] border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#111820] sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">{store.name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${store.planCode === 'pro' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : store.planCode === 'volta' || store.complimentary ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/55'}`}>{planLabel(store)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-white/45">/{store.slug}{store.ownerEmail ? ` · ${store.ownerEmail}` : ''}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-black/[0.035] px-2.5 py-1 text-slate-600 dark:bg-white/[0.05] dark:text-white/55">{statusLabel(store.subscriptionStatus)}</span>
                      {store.currentAmount ? <span className="rounded-full bg-black/[0.035] px-2.5 py-1 text-slate-600 dark:bg-white/[0.05] dark:text-white/55">{money(store.currentAmount)}/mes</span> : null}
                      {store.planAccessUntil ? <span className="rounded-full bg-black/[0.035] px-2.5 py-1 text-slate-600 dark:bg-white/[0.05] dark:text-white/55">Acceso hasta {formatDate(store.planAccessUntil)}</span> : null}
                      {store.complimentary ? <span className="rounded-full bg-black/[0.035] px-2.5 py-1 text-slate-600 dark:bg-white/[0.05] dark:text-white/55">{store.complimentaryUntil ? `Bonificado hasta ${formatDate(store.complimentaryUntil)}` : 'Bonificado sin vencimiento'}</span> : null}
                    </div>
                    {store.internalNote ? <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500 dark:text-white/45">Nota interna: {store.internalNote}</p> : null}
                  </div>

                  <div className="w-full max-w-lg">
                    {store.complimentary ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" />No se crearán nuevos cobros.</div>
                        <button type="button" onClick={() => revoke(store)} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-700 disabled:opacity-50 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{busy ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />} Quitar bonificación</button>
                      </div>
                    ) : (
                      <form onSubmit={(event) => { event.preventDefault(); grant(store, event.currentTarget) }} className="grid gap-2 sm:grid-cols-[150px_1fr_auto] sm:items-end">
                        <label className="text-xs font-medium text-slate-600 dark:text-white/60">Vence (opcional)<input name="expiresOn" type="date" className="mt-1 h-10 w-full rounded-[9px] border border-black/10 bg-white px-2.5 text-xs dark:border-white/10 dark:bg-white/5" /></label>
                        <label className="text-xs font-medium text-slate-600 dark:text-white/60">Nota interna<input name="note" maxLength={500} placeholder="Ej: Primer cliente beta" className="mt-1 h-10 w-full rounded-[9px] border border-black/10 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5" /></label>
                        <button type="submit" disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] bg-[#10161d] px-4 text-xs font-semibold text-white disabled:opacity-50 dark:bg-[#12e89a] dark:text-[#062117]">{busy ? <Loader2 className="size-4 animate-spin" /> : <Gift className="size-4" />} Bonificar</button>
                      </form>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, hint, icon = false }: { label: string; value: string; hint?: string; icon?: boolean }) {
  return (
    <div className="rounded-[16px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820]">
      <div className="flex items-start justify-between gap-3"><p className="text-xs font-medium text-slate-500 dark:text-white/45">{label}</p>{icon ? <WalletCards className="size-4 text-emerald-600 dark:text-emerald-300" /> : <Clock3 className="size-4 text-slate-300 dark:text-white/20" />}</div>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-slate-400 dark:text-white/35">{hint}</p> : null}
    </div>
  )
}
