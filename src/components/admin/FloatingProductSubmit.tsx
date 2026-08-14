'use client'

import { Plus } from 'lucide-react'

export function FloatingProductSubmit({ scopeId }: { scopeId: string }) {
  function submit() {
    const form = document.querySelector(`#${scopeId} form`)
    if (form instanceof HTMLFormElement) form.requestSubmit()
  }

  return (
    <button
      type="button"
      onClick={submit}
      className="fixed bottom-[84px] right-3.5 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#12e89a] px-5 text-sm font-semibold text-[#062117] shadow-[0_14px_36px_rgba(18,232,154,.28)] transition hover:bg-[#0fd98f] active:scale-[0.98] lg:bottom-6 lg:right-6"
    >
      <Plus className="size-4" />
      Crear producto
    </button>
  )
}
