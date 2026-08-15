'use client'

import { useRef, useState } from 'react'
import { Loader2, Plus, Save } from 'lucide-react'

export function FloatingProductSubmit({
  scopeId,
  mode = 'create',
}: {
  scopeId: string
  mode?: 'create' | 'save'
}) {
  const lockRef = useRef(false)
  const [pending, setPending] = useState(false)

  function submit() {
    if (lockRef.current) return

    const form = document.querySelector(`#${scopeId} form`)
    if (!(form instanceof HTMLFormElement)) return

    lockRef.current = true
    setPending(true)
    form.requestSubmit()

    let sawNativePending = false
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      const nativeSubmit = form.querySelector('button[type="submit"]')
      const nativePending = nativeSubmit instanceof HTMLButtonElement && nativeSubmit.disabled

      if (nativePending) sawNativePending = true

      if ((sawNativePending && !nativePending) || Date.now() - startedAt > 30000) {
        window.clearInterval(interval)
        lockRef.current = false
        setPending(false)
      }
    }, 100)
  }

  const isCreate = mode === 'create'

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending}
      aria-busy={pending}
      className="fixed bottom-[84px] right-3.5 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#12e89a] px-5 text-sm font-semibold text-[#062117] shadow-[0_14px_36px_rgba(18,232,154,.28)] transition hover:bg-[#0fd98f] active:scale-[0.98] disabled:cursor-wait disabled:opacity-75 disabled:active:scale-100 lg:bottom-6 lg:right-6"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : isCreate ? <Plus className="size-4" /> : <Save className="size-4" />}
      {pending ? (isCreate ? 'Creando…' : 'Guardando…') : isCreate ? 'Crear producto' : 'Guardar cambios'}
    </button>
  )
}
