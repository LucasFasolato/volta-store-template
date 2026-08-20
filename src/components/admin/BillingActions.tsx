'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  cancelVoltaSubscription,
  startVoltaSubscription,
  syncVoltaSubscription,
} from '@/lib/actions/billing'
import type { BillingStatus } from '@/lib/billing/types'

export function BillingActions({
  status,
  providerConfigured,
}: {
  status: BillingStatus | null
  providerConfigured: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function activate() {
    startTransition(async () => {
      const result = await startVoltaSubscription()
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
    if (!window.confirm('¿Cancelar la suscripción de VOLTA? No se realizarán nuevos cobros.')) return
    startTransition(async () => {
      const result = await cancelVoltaSubscription()
      if (result.error) toast.error(result.error)
      else {
        toast.success('Suscripción cancelada.')
        router.refresh()
      }
    })
  }

  const canActivate = !status || ['not_started', 'error', 'canceled'].includes(status)
  const canContinue = status === 'creating' || status === 'pending'
  const canCancel = status === 'active' || status === 'paused' || status === 'pending'

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {(canActivate || canContinue) ? (
        <button
          type="button"
          onClick={activate}
          disabled={pending || !providerConfigured}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#10161d] px-4 text-sm font-semibold text-white transition hover:bg-[#17202a] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#12e89a] dark:text-[#062117] dark:hover:bg-[#24f0aa]"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {canContinue ? 'Continuar activación' : 'Activar con Mercado Pago'}
        </button>
      ) : null}

      {status && status !== 'not_started' && status !== 'canceled' ? (
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

      {canCancel ? (
        <button
          type="button"
          onClick={cancel}
          disabled={pending || !providerConfigured}
          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300 dark:hover:bg-red-400/15"
        >
          Cancelar suscripción
        </button>
      ) : null}
    </div>
  )
}
