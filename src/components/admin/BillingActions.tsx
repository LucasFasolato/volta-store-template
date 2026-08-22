'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  cancelVoltaSubscription,
  startPaidPlanSubscription,
  syncVoltaSubscription,
  upgradeVoltaSubscriptionToPro,
} from '@/lib/actions/billing'
import type { PaidPlanCode } from '@/lib/billing/plan'
import type { BillingStatus } from '@/lib/billing/types'

export function BillingActions({
  status,
  providerConfigured,
  targetPlan = 'volta',
  currentPlan,
  subscriptionPlan,
  compact = false,
}: {
  status: BillingStatus | null
  providerConfigured: boolean
  targetPlan?: PaidPlanCode
  currentPlan?: 'free' | 'volta' | 'pro'
  subscriptionPlan?: PaidPlanCode
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function activate() {
    const upgradingToPro = currentPlan === 'volta' && targetPlan === 'pro' && status === 'active'
    if (upgradingToPro && !window.confirm('Tu suscripción pasa a VOLTA PRO por $70.000/mes. El nuevo importe se aplicará según el próximo cobro de Mercado Pago. ¿Continuar?')) return

    startTransition(async () => {
      const result = upgradingToPro
        ? await upgradeVoltaSubscriptionToPro()
        : await startPaidPlanSubscription(targetPlan)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.redirectUrl) {
        window.location.assign(result.redirectUrl)
        return
      }
      router.refresh()
    })
  }

  function sync() {
    startTransition(async () => {
      const result = await syncVoltaSubscription()
      if (result.error) toast.error(result.error)
      else {
        toast.success('Estado actualizado.')
        router.refresh()
      }
    })
  }

  function cancel() {
    if (!window.confirm('¿Cancelar la renovación? No se realizarán nuevos cobros después del período que ya pagaste.')) return
    startTransition(async () => {
      const result = await cancelVoltaSubscription()
      if (result.error) toast.error(result.error)
      else if (result.redirectUrl) window.location.assign(result.redirectUrl)
      else router.refresh()
    })
  }

  const samePlan = currentPlan === targetPlan || (['creating', 'pending'].includes(status || '') && subscriptionPlan === targetPlan)
  const active = status === 'active'
  const canContinue = samePlan && (status === 'creating' || status === 'pending')
  const canActivate = !active || !samePlan
  const label = currentPlan === 'volta' && targetPlan === 'pro' && active
    ? 'Pasar a PRO'
    : canContinue
      ? 'Continuar activación'
      : samePlan && status === 'canceled'
        ? `Reactivar ${targetPlan === 'pro' ? 'PRO' : 'VOLTA'}`
        : targetPlan === 'pro'
        ? 'Elegir VOLTA PRO'
        : 'Elegir VOLTA'

  return (
    <div className={`flex flex-col gap-2 ${compact ? '' : 'sm:flex-row sm:flex-wrap'}`}>
      {canActivate ? (
        <button
          type="button"
          onClick={activate}
          disabled={pending || !providerConfigured || (currentPlan === 'pro' && targetPlan === 'volta')}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#10161d] px-4 text-sm font-semibold text-white transition hover:bg-[#17202a] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#12e89a] dark:text-[#062117] dark:hover:bg-[#24f0aa]"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {currentPlan === 'pro' && targetPlan === 'volta' ? (active ? 'Incluido en PRO' : 'Disponible al finalizar PRO') : label}
        </button>
      ) : (
        <span className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Tu plan actual
        </span>
      )}

      {!compact && status && status !== 'not_started' && status !== 'canceled' ? (
        <button
          type="button"
          onClick={sync}
          disabled={pending || !providerConfigured}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
        >
          <RefreshCw className={pending ? 'size-4 animate-spin' : 'size-4'} />
          Actualizar estado
        </button>
      ) : null}

      {!compact && (status === 'active' || status === 'paused' || status === 'pending') ? (
        <button
          type="button"
          onClick={cancel}
          disabled={pending || !providerConfigured}
          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300 dark:hover:bg-red-400/15"
        >
          Cancelar renovación
        </button>
      ) : null}
    </div>
  )
}
