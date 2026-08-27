'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Eye, LayoutDashboard, Package, Palette, Sparkles, X } from 'lucide-react'

const PANEL_ITEMS = [
  { icon: LayoutDashboard, label: 'Inicio', text: 'Estado y link de tu tienda' },
  { icon: Package, label: 'Productos', text: 'Catálogo, fotos y precios' },
  { icon: Palette, label: 'Diseño', text: 'Portada, colores y estilo' },
]

export function AdminIntroTour({
  storeId,
}: {
  storeId: string
  storeName: string
  isPublished: boolean
}) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const storageKey = `volta-admin-tour-v2:${storeId}`

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, 'done')
    } catch {
      // Closing the tutorial must never depend on storage availability.
    }
    setOpen(false)
  }, [storageKey])

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === 'done') return
    } catch {
      // Show it once in the current session when storage is unavailable.
    }

    const timeout = window.setTimeout(() => setOpen(true), 180)
    return () => window.clearTimeout(timeout)
  }, [storageKey])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.voltaAdminTour = 'open'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') finish()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      delete document.body.dataset.voltaAdminTour
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [finish, open])

  if (!open || typeof document === 'undefined') return null

  const isLast = stepIndex === 1

  const modal = (
    <div
      className="fixed left-0 top-0 z-[999] grid h-[100dvh] w-screen place-items-center overflow-y-auto bg-slate-950/55 px-4 py-4 backdrop-blur-[3px]"
      role="presentation"
      style={{
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      <button type="button" aria-label="Omitir tutorial" className="absolute inset-0 cursor-default" onClick={finish} />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="volta-admin-tour-title"
        className="relative z-10 w-full max-w-[440px] max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[28px] border border-white/80 bg-white shadow-[0_36px_110px_rgba(2,8,23,.32)] dark:border-white/10 dark:bg-[#111820]"
      >
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-4 dark:border-white/8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#12e89a] text-[#062117] shadow-[0_10px_24px_rgba(18,232,154,.2)]"><Sparkles className="size-4.5" /></span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-[#75f5c5]">Mini tutorial</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stepIndex + 1} de 2</p>
            </div>
          </div>
          <button type="button" onClick={finish} className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/7">Omitir <X className="size-4" /></button>
        </div>

        <div className="p-5 sm:p-6">
          {stepIndex === 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-[#75f5c5]">Tu panel</p>
              <h2 id="volta-admin-tour-title" className="mt-1.5 text-[1.8rem] font-semibold leading-[1.05] tracking-[-0.055em] text-foreground">Todo está en 3 lugares</h2>
              <div className="mt-5 space-y-2.5">
                {PANEL_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3.5 rounded-[14px] border border-black/7 bg-slate-50/80 px-3.5 py-3.5 dark:border-white/8 dark:bg-white/[0.035]">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-[11px] bg-white text-slate-800 shadow-[0_7px_20px_rgba(15,23,42,.07)] dark:bg-white/8 dark:text-white"><Icon className="size-4.5" /></span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-foreground">{item.label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div>
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-slate-100 text-slate-800 dark:bg-white/8 dark:text-white"><Eye className="size-5" /></span>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-[#75f5c5]">Ver mi tienda</p>
              <h2 id="volta-admin-tour-title" className="mt-1.5 text-[1.8rem] font-semibold leading-[1.05] tracking-[-0.055em] text-foreground">Revisá como cliente</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">El botón de arriba abre tu tienda real. Revisá los cambios y compartí cuando quieras.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              {[0, 1].map((index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === stepIndex ? 'w-7 bg-[#12e89a]' : 'w-1.5 bg-slate-200 dark:bg-white/15'}`} />)}
            </div>
            <div className="flex items-center gap-2">
              {stepIndex > 0 ? <button type="button" onClick={() => setStepIndex(0)} className="inline-flex min-h-11 items-center gap-1.5 rounded-[11px] border border-black/8 bg-white px-3.5 text-sm font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><ArrowLeft className="size-4" />Atrás</button> : null}
              <button type="button" onClick={() => isLast ? finish() : setStepIndex(1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-[11px] bg-[#10161d] px-4 text-sm font-semibold text-white dark:bg-[#12e89a] dark:text-[#062117]">
                {isLast ? 'Listo' : 'Siguiente'} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
