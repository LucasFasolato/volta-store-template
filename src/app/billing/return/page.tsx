import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, ExternalLink, ShieldCheck, XCircle } from 'lucide-react'
import { VoltaBrand } from '@/components/brand/VoltaBrand'
import { BillingReturnRefresh } from '@/components/billing/BillingReturnRefresh'
import { getBillingOverview } from '@/lib/billing/queries'
import { formatBillingDate } from '@/lib/billing/plan'
import { resolveBillingReturnState } from '@/lib/billing/return-state'
import { refreshStoreBilling } from '@/lib/billing/service'
import { buildStorePublicUrl } from '@/lib/sharing/links'
import { getAuthenticatedUser, getOwnerStoreData } from '@/lib/server/store-context'

export const metadata: Metadata = {
  title: 'Tu plan VOLTA',
  description: 'Confirmación segura de tu suscripción a VOLTA.',
  robots: { index: false, follow: false },
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function BillingReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const requestedKind = firstValue(params.kind) ?? null
  const user = await getAuthenticatedUser()

  if (!user) {
    return (
      <ReturnShell>
        <StatusIcon tone="safe" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Pago protegido</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">Tu operación está a salvo.</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
          Mercado Pago puede volver en otra pestaña o sin la sesión de VOLTA. Ingresá nuevamente y te llevamos directo a la confirmación, sin cobrarte otra vez.
        </p>
        <Link href="/login?next=%2Fbilling%2Freturn" className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#10161d] px-6 text-sm font-semibold text-white transition hover:bg-[#18212b]">
          Ingresar y confirmar <ArrowRight className="size-4" />
        </Link>
      </ReturnShell>
    )
  }

  const storeData = await getOwnerStoreData(user.id)
  if (!storeData) {
    return (
      <ReturnShell>
        <StatusIcon tone="safe" />
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">Estamos preparando tu tienda.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">Tu cuenta está autenticada. Entrá al panel para terminar la configuración inicial.</p>
        <Link href="/admin" className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#10161d] px-6 text-sm font-semibold text-white">Ir al panel</Link>
      </ReturnShell>
    )
  }

  await refreshStoreBilling(storeData.store.id).catch(() => null)
  const overview = await getBillingOverview(storeData.store.id)
  const state = resolveBillingReturnState(overview, requestedKind)
  const planName = overview.commercialAccess.planCode === 'pro' ? 'VOLTA PRO' : overview.commercialAccess.planCode === 'volta' ? 'VOLTA' : 'Gratis'
  const publicUrl = buildStorePublicUrl(storeData.store.slug)
  const accessUntil = formatBillingDate(overview.commercialAccess.accessUntil)
  const fallbackPlanName = overview.commercialAccess.grandfathered ? 'VOLTA' : 'Gratis'

  if (state === 'success') {
    return (
      <ReturnShell>
        <StatusIcon tone="success" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Plan confirmado</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-4xl">¡Ya sos parte de {planName}!</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
          Tu suscripción quedó activa. No hay nada técnico que configurar: podés volver a vender, compartir tu tienda y aprovechar las herramientas de tu plan.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/compartir" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-5 text-sm font-semibold text-[#062117]">Compartir mi tienda <ArrowRight className="size-4" /></Link>
          <Link href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 px-5 text-sm font-semibold text-slate-800">Ver mi tienda <ExternalLink className="size-4" /></Link>
        </div>
        <Link href="/admin" className="mt-4 inline-flex text-sm font-semibold text-slate-500 transition hover:text-slate-900">Ir al panel</Link>
      </ReturnShell>
    )
  }

  if (state === 'canceled') {
    return (
      <ReturnShell>
        <StatusIcon tone="canceled" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Renovación cancelada</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-4xl">No habrá nuevos cobros.</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
          {accessUntil
            ? `Tu plan ${planName} sigue disponible hasta ${accessUntil}. Después tu tienda continúa en ${fallbackPlanName}.`
            : `La renovación quedó cancelada. Tu tienda puede seguir funcionando con ${fallbackPlanName}.`}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/admin" className="inline-flex h-12 items-center justify-center rounded-full bg-[#10161d] px-6 text-sm font-semibold text-white">Volver al panel</Link>
          <Link href="/admin/plan" className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-semibold text-slate-800">Ver mis planes</Link>
        </div>
      </ReturnShell>
    )
  }

  if (state === 'error') {
    return (
      <ReturnShell>
        <StatusIcon tone="error" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">Necesitamos revisar el estado</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-slate-950">No vuelvas a pagar.</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">La operación ya existe. Entrá a Plan y usá “Actualizar estado” para que VOLTA vuelva a consultar Mercado Pago.</p>
        <Link href="/admin/plan" className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#10161d] px-6 text-sm font-semibold text-white">Revisar mi plan</Link>
      </ReturnShell>
    )
  }

  return (
    <ReturnShell>
      <StatusIcon tone="pending" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">Confirmación en curso</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-4xl">Estamos terminando de activar tu plan.</h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">Mercado Pago ya recibió la operación. VOLTA está esperando la confirmación final. No vuelvas a pagar ni crees otra suscripción.</p>
      <BillingReturnRefresh />
      <Link href="/admin/plan" className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-semibold text-slate-800">Ver estado del plan</Link>
    </ReturnShell>
  )
}

function ReturnShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f7f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_28px_90px_rgba(15,23,42,.09)]">
          <div className="border-b border-black/6 px-6 py-5 sm:px-9"><VoltaBrand /></div>
          <div className="px-6 py-9 sm:px-9 sm:py-12">{children}</div>
          <div className="flex items-start gap-3 border-t border-black/6 bg-slate-50 px-6 py-4 text-xs leading-5 text-slate-500 sm:px-9">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <p>VOLTA no guarda datos de tarjeta. La autorización y los cobros recurrentes se procesan en Mercado Pago.</p>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatusIcon({ tone }: { tone: 'success' | 'pending' | 'canceled' | 'error' | 'safe' }) {
  const className = tone === 'success' || tone === 'safe'
    ? 'bg-emerald-50 text-emerald-600'
    : tone === 'pending'
      ? 'bg-amber-50 text-amber-600'
      : tone === 'error'
        ? 'bg-red-50 text-red-600'
        : 'bg-slate-100 text-slate-600'

  return (
    <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${className}`}>
      {tone === 'success' || tone === 'safe' ? <CheckCircle2 className="size-7" /> : tone === 'pending' ? <Clock3 className="size-7" /> : <XCircle className="size-7" />}
    </div>
  )
}
