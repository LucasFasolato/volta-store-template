import { CalendarDays, Check, CreditCard, Gift, ShieldCheck } from 'lucide-react'
import { BillingActions } from '@/components/admin/BillingActions'
import { PlanValueShowcase } from '@/components/admin/PlanValueShowcase'
import {
  formatBillingAmount,
  formatBillingDate,
  VOLTA_BILLING_PLAN,
} from '@/lib/billing/plan'
import type { BillingOverview, BillingStatus } from '@/lib/billing/types'

const STATUS_COPY: Record<BillingStatus, { label: string; className: string }> = {
  not_started: { label: 'Sin activar', className: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/60' },
  creating: { label: 'Preparando', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  active: { label: 'Activo', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' },
  paused: { label: 'Pausado', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  canceled: { label: 'Renovación cancelada', className: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/60' },
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
  const currentPlan = overview.commercialAccess.planCode
  const planName = currentPlan === 'pro' ? 'VOLTA PRO' : currentPlan === 'volta' ? 'VOLTA' : 'Gratis'
  const statusCopy = complimentary
    ? { label: 'Bonificado VOLTA', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' }
    : status
      ? STATUS_COPY[status]
      : currentPlan === 'free'
        ? { label: 'Gratis', className: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/60' }
        : { label: planName, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' }
  const accessUntil = formatBillingDate(overview.commercialAccess.accessUntil)
  const complimentaryUntil = formatBillingDate(overview.access.complimentaryUntil)

  return (
    <div className="volta-admin-page p-3.5 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="admin-label">Plan y facturación</p>
            <h1 className="mt-1 text-[1.85rem] font-semibold tracking-tight text-foreground">Tu plan VOLTA</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Elegí el nivel que acompaña a {storeName} hoy. Podés empezar gratis y subir cuando el negocio lo necesite.</p>
          </div>
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusCopy.className}`}>{statusCopy.label}</span>
        </header>

        <PlanValueShowcase
          currentPlan={currentPlan}
          status={status}
          providerConfigured={overview.providerConfigured}
          complimentary={complimentary}
          accessSource={overview.commercialAccess.source}
          accessUntilLabel={accessUntil}
          subscriptionPlan={subscription?.planCode === 'pro' ? 'pro' : subscription?.planCode === 'volta' ? 'volta' : undefined}
        />

        {complimentary ? (
          <section className="rounded-[20px] border border-emerald-200 bg-[linear-gradient(135deg,#f2fff9,#ffffff)] p-5 dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(18,232,154,.09),rgba(17,24,32,.98))] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Gift className="size-4" /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Acceso bonificado</span></div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">Tenés VOLTA completo a $0.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">No necesitás Mercado Pago mientras la bonificación esté vigente. PRO queda fuera de esta bonificación.</p>
              </div>
              <div className="rounded-[14px] border border-emerald-200/70 bg-white/70 px-4 py-3 dark:border-emerald-400/15 dark:bg-white/[0.035]">
                <p className="text-xs font-semibold text-foreground">Vigencia</p>
                <p className="mt-1 text-sm text-muted-foreground">{complimentaryUntil ? `Hasta ${complimentaryUntil}` : 'Sin vencimiento definido'}</p>
              </div>
            </div>
          </section>
        ) : subscription ? (
          <SubscriptionCard overview={overview} />
        ) : (
          <section className="rounded-[18px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {currentPlan === 'free' ? 'Estás usando Gratis' : 'Tenés acceso VOLTA incluido'}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {currentPlan === 'free'
                    ? 'No hay tarjeta ni suscripción activa. Cuando elijas VOLTA o PRO, Mercado Pago te va a mostrar el importe antes de confirmar.'
                    : 'Tu comercio conserva acceso VOLTA sin una suscripción activa. Si más adelante elegís PRO, Mercado Pago te va a mostrar el nuevo importe antes de confirmar.'}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[16px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820]">
          <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#0e9f6e] dark:text-[#12e89a]" /><h2 className="text-sm font-semibold text-foreground">Cobro seguro</h2></div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">VOLTA no guarda datos de tarjeta. La autorización y los cobros recurrentes se realizan en Mercado Pago. Podés cancelar la renovación cuando quieras.</p>
        </section>

        {overview.payments.length ? (
          <section className="rounded-[16px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-6">
            <div className="flex items-end justify-between gap-4"><div><p className="admin-label">Movimientos</p><h2 className="mt-1 text-lg font-semibold text-foreground">Últimos cobros</h2></div><span className="text-xs text-muted-foreground">Hasta 8 movimientos</span></div>
            <div className="mt-4 divide-y divide-black/6 dark:divide-white/7">
              {overview.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-foreground">{formatBillingAmount(payment.amount)}</p><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{payment.planCode === 'pro' ? 'PRO' : 'VOLTA'}</span></div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatBillingDate(payment.paidAt || payment.debitDate || payment.createdAt) || 'Sin fecha'}</p>
                  </div>
                  <PaymentStatus status={payment.paymentStatus} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function SubscriptionCard({ overview }: { overview: BillingOverview }) {
  const subscription = overview.subscription!
  const planName = subscription.planCode === 'pro' ? 'VOLTA PRO' : 'VOLTA'
  const isCanceled = subscription.status === 'canceled'
  const nextCharge = isCanceled ? null : formatBillingDate(subscription.nextPaymentDate)
  const introPaid = subscription.introCyclesPaid || 0
  const introTotal = VOLTA_BILLING_PLAN.introCycles
  const introCompleted = introPaid >= introTotal || subscription.currentAmount >= VOLTA_BILLING_PLAN.standardAmount

  return (
    <section className="overflow-hidden rounded-[20px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]">
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="p-5 sm:p-7">
          <p className="admin-label">Tu suscripción</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{planName}</h2>
            <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground dark:bg-white/[0.06]">{STATUS_COPY[subscription.status].label}</span>
          </div>
          <div className="mt-5 flex items-start justify-between gap-4 rounded-[14px] border border-black/7 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.035]">
            <div><p className="text-xs text-muted-foreground">Importe actual</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatBillingAmount(subscription.currentAmount)}</p></div>
            <CreditCard className="size-5 text-emerald-600 dark:text-emerald-300" />
          </div>

          {subscription.planCode === 'volta' ? (
            <div className="mt-4 rounded-[14px] border border-black/7 bg-white p-4 dark:border-white/8 dark:bg-white/[0.035]">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-foreground">Precio de lanzamiento</p><span className="text-xs font-semibold text-muted-foreground">{Math.min(introPaid, introTotal)} / {introTotal}</span></div>
              <div className="mt-3 grid grid-cols-3 gap-2">{Array.from({ length: introTotal }).map((_, index) => { const done = index < introPaid || introCompleted; return <div key={index} className={`h-2 rounded-full ${done ? 'bg-[#12e89a]' : 'bg-black/8 dark:bg-white/10'}`} /> })}</div>
              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{introCompleted ? `Precio regular: ${formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes.` : `${introTotal - introPaid} mes${introTotal - introPaid === 1 ? '' : 'es'} promocional${introTotal - introPaid === 1 ? '' : 'es'} disponible${introTotal - introPaid === 1 ? '' : 's'}.`}</p>
            </div>
          ) : null}

          {subscription.lastError ? <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">{subscription.lastError}</div> : null}
          {isCanceled && overview.commercialAccess.source === 'paid_until' ? (
            <p className="mt-5 text-xs leading-5 text-muted-foreground">No hace falta reactivar ahora: ya tenés acceso hasta el final del período pago y no habrá otro cobro.</p>
          ) : (
            <div className="mt-5"><BillingActions status={subscription.status} providerConfigured={overview.providerConfigured} currentPlan={overview.commercialAccess.planCode} subscriptionPlan={subscription.planCode === 'pro' ? 'pro' : 'volta'} targetPlan={subscription.planCode === 'pro' ? 'pro' : 'volta'} /></div>
          )}
        </div>

        <div className="border-t border-black/7 bg-[#f8faf9] p-5 dark:border-white/8 dark:bg-white/[0.025] sm:p-7 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Facturación</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-black/6 pb-3 dark:border-white/7"><span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />{isCanceled ? 'Acceso pago' : 'Próximo cobro'}</span><span className="text-right font-medium text-foreground">{isCanceled ? (formatBillingDate(overview.commercialAccess.accessUntil) || 'Finalizado') : (nextCharge || 'A confirmar')}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4" />Procesador</span><span className="font-medium text-foreground">Mercado Pago</span></div>
          </div>
          {isCanceled ? <p className="mt-5 rounded-[12px] bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-600 dark:bg-white/[0.05] dark:text-white/60">La renovación está cancelada. No se realizarán nuevos cobros.</p> : null}
        </div>
      </div>
    </section>
  )
}
