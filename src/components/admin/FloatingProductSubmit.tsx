'use client'

import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

export function FloatingProductSubmit({ scopeId }: { scopeId: string }) {
  const [pending, setPending] = useState(false)

  function submit() {
    const form = document.querySelector(`#${scopeId} form`)
    if (!(form instanceof HTMLFormElement)) return
    setPending(true)
    form.requestSubmit()
    window.setTimeout(() => setPending(false), 12000)
  }

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending}
      className="fixed bottom-[84px] right-3.5 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#12e89a] px-5 text-sm font-semibold text-[#062117] shadow-[0_14px_36px_rgba(18,232,154,.28)] transition hover:bg-[#0fd98f] disabled:opacity-60 lg:bottom-6 lg:right-6"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      {pending ? 'Creando…' : 'Crear producto'}
    </button>
  )
}
