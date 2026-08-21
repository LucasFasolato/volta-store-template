import {
  CalendarDays,
  Check,
  CreditCard,
  Gift,
  ShieldCheck,
} from 'lucide-react'
import { BillingActions } from '@/components/admin/BillingActions'
import { PlanValueShowcase } from '@/components/admin/PlanValueShowcase'
import { formatBillingAmount, formatBillingDate, VOLTA_BILLING_PLAN } from '@/lib/billing/plan'
import type { BillingOverview, BillingStatus } from '@/lib/billing/types'

const STATUS_COPY: Record<BillingStatus, { label: string; className: string }> = {
  not_started: { label: 'Sin activar', className: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/60' },
  creating: { label: 'Preparando', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  active: { label: 'Activo', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' },
  paused: { label: 'Pausado', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  canceled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/60' },
  error: { label: 'Requiere atención', className: 'bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300' },
}

function PaymentStatus({ status }: { status: string }) {
  const approved = status === 'approved'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${approved ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/60'}`}>
      {approved ? <Check className="size-3" /> : null}
      {approved ? 'Aprobado' : status === 'pending' ? 'Pendiente' : 'No aprobado'}
    </span>
  )
}

export function BillingPage({ storeName, overview }: { storeName: string; overview: BillingOverview }) {
  const subscription = overview.subscription
  const status = subscription?.status || null
  const complimentary = overview.access.mode === 'complimentary'
  const statusCopy = complimentary
    ? { label: 'Bonificado', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' }
    : status ? STATUS_COPY[status] : STATUS_COPY.not_started
  const introPaid = subscription?.introCyclesPaid || 0
  const introTotal = subscription?.introCyclesTotal || VOLTA_BILLING_PLAN.introCycles
  const currentAmount = subscription?.currentAmount || VOLTA_BILLING_PLAN.introAmount
  const nextCharge = formatBillingDate(subscription?.nextPaymentDate || null)
  const introCompleted = introPaid >= introTotal || currentAmount >= VOLTA_BILLING_PLAN.standardAmount
  const complimentaryUntil = formatBillingDate(overview.access.complimentaryUntil)

  return (
    <div className="volta-admin-page p-3.5 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="admin-label">Plan y facturación</p>
            <h1 className="mt-1 text-[1.85rem] font-semibold tracking-tight text-foreground">Tu plan VOLTA</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Tu suscripción actual, todo lo que incluye y el camino a VOLTA PRO para {storeName}.</p>
          </div>
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusCopy.className}`}>{statusCopy.label}</span>
        </header>

        {complimentary ? (
          <section className="overflow-hidden rounded-[20px] border border-emerald-200 bg-[linear-gradient(135deg,#f2fff9,#ffffff)] shadow-[0_18px_48px_rgba(16,185,129,.08)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(18,232,154,.09),rgba(17,24,32,.98))] dark:shadow-none">
            <div className="grid lg:grid-cols-[1.15fr_.85fr]">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Gift className="size-4" /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Acceso bonificado</span></div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Tenés acceso completo a VOLTA.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">No necesitás activar Mercado Pago y no se realizarán nuevos cobros mientras esta bonificación esté vigente.</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                  {['Todo VOLTA incluido', 'Sin cobro mensual', 'Sin configuración extra'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-[12px] bg-white/70 px-3 py-2.5 text-xs font-medium text-foreground ring-1 ring-black/[0.04] dark:bg-white/[0.045] dark:ring-white/[0.04]"><Check className="size-3.5 shrink-0 text-emerald-600 dark:text-[#12e89a]" />{item}</div>
                  ))}
                </div>
              </div>
              <div className="border-t border-emerald-200/70 bg-white/55 p-5 dark:border-emerald-400/15 dark:bg-white/[0.025] sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tu acceso</p>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div><p className="text-xs text-muted-foreground">Importe</p><p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">$0</p></div>
                  <Gift className="size-5 text-emerald-600 dark:text-[#12e89a]" />
                </div>
                <div className="mt-5 rounded-[14px] border border-black/7 bg-white p-4 dark:border-white/8 dark:bg-white/[0.035]">
                  <p className="text-xs font-semibold text-foreground">Vigencia</p>
                  <p className="mt-2 text-sm text-muted-foreground">{complimentaryUntil ? `Hasta ${complimentaryUntil}` : 'Sin vencimiento definido'}</p>
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">Si esta condición cambia, VOLTA te lo mostrará antes de pedirte activar una suscripción.</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[20px] border border-black/8 bg-white shadow-[0_18px_48px_rgba(15,23,42,.06)] dark:border-white/10 dark:bg-[#111820] dark:shadow-none">
            <div className="grid lg:grid-cols-[1.12fr_.88fr]">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="text-[#0e9f6e] dark:text-[#12e89a]"><span className="text-xs font-semibold uppercase tracking-[0.16em]">Precio de lanzamiento</span></div>
                <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1"><span className="text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">{formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)}</span><span className="pb-1 text-sm font-medium text-muted-foreground">/ mes</span></div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Durante los primeros 3 meses. Desde el cuarto mes, el plan pasa automáticamente a {formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)} por mes.</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                  {['Todo VOLTA incluido', 'Cobro mensual automático', 'Cancelás cuando quieras'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-[12px] bg-black/[0.025] px-3 py-2.5 text-xs font-medium text-foreground dark:bg-white/[0.045]"><Check className="size-3.5 shrink-0 text-[#0e9f6e] dark:text-[#12e89a]" />{item}</div>
                  ))}
                </div>
                {!overview.providerConfigured ? <div className="mt-5 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">La activación está temporalmente deshabilitada mientras terminamos la conexión de cobros.</div> : null}
                {subscription?.lastError ? <div className="mt-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">{subscription.lastError}</div> : null}
                <div className="mt-6"><BillingActions status={status} providerConfigured={overview.providerConfigured} /></div>
              </div>
              <div className="border-t border-black/7 bg-[#f8faf9] p-5 dark:border-white/8 dark:bg-white/[0.025] sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tu suscripción</p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">Importe actual</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatBillingAmount(currentAmount)}</p></div><CreditCard className="size-5 text-[#0e9f6e] dark:text-[#12e89a]" /></div>
                  <div className="rounded-[14px] border border-black/7 bg-white p-4 dark:border-white/8 dark:bg-white/[0.035]">
                    <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-foreground">Primeros 3 meses</p><span className="text-xs font-semibold text-muted-foreground">{Math.min(introPaid, introTotal)} / {introTotal}</span></div>
                    <div className="mt-3 grid grid-cols-3 gap-2">{Array.from({ length: introTotal }).map((_, index) => { const done = index < introPaid || introCompleted; return <div key={index} className={`h-2 rounded-full ${done ? 'bg-[#12e89a]' : 'bg-black/8 dark:bg-white/10'}`} /> })}</div>
                    <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{introCompleted ? `Precio regular activo: ${formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes.` : `${introTotal - introPaid} mes${introTotal - introPaid === 1 ? '' : 'es'} al precio de lanzamiento.`}</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-black/6 pb-3 dark:border-white/7"><span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />Próximo cobro</span><span className="text-right font-medium text-foreground">{nextCharge || 'A confirmar'}</span></div>
                    <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4" />Procesador</span><span className="font-medium text-foreground">Mercado Pago</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <PlanValueShowcase complimentary={complimentary} />

        <section className="rounded-[16px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820]">
          <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#0e9f6e] dark:text-[#12e89a]" /><h2 className="text-sm font-semibold text-foreground">{complimentary ? 'Acceso administrado por VOLTA' : 'Cobro seguro'}</h2></div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{complimentary ? 'Tu bonificación se gestiona de forma interna. No necesitás cargar un medio de pago mientras esté vigente.' : 'VOLTA no guarda datos de tarjeta. La autorización y los cobros recurrentes se realizan en Mercado Pago.'}</p>
        </section>

        {overview.payments.length ? (
          <section className="rounded-[16px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-6">
            <div className="flex items-end justify-between gap-4"><div><p className="admin-label">Movimientos</p><h2 className="mt-1 text-lg font-semibold text-foreground">Últimos cobros</h2></div><span className="text-xs text-muted-foreground">Hasta 8 movimientos</span></div>
            <div className="mt-4 divide-y divide-black/6 dark:divide-white/7">{overview.payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-4 py-3.5"><div className="min-w-0"><p className="text-sm font-medium text-foreground">{formatBillingAmount(payment.amount)}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatBillingDate(payment.paidAt || payment.debitDate || payment.createdAt) || 'Sin fecha'}</p></div><PaymentStatus status={payment.paymentStatus} /></div>)}</div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
