'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Eye, LayoutDashboard, Package, Palette, Sparkles, X } from 'lucide-react'

export function AdminIntroTour({
  storeId,
  storeName,
  isPublished,
}: {
  storeId: string
  storeName: string
  isPublished: boolean
}) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const storageKey = `volta-admin-tour-v1:${storeId}`

  const steps = [
    {
      id: 'home',
      eyebrow: isPublished ? 'Tu panel' : 'Tu primer recorrido',
      title: isPublished ? `Acá manejás ${storeName}` : 'Primero dejamos tu tienda lista',
      description: isPublished
        ? 'Inicio te muestra lo importante de la tienda y te deja el link listo para compartir cuando lo necesites.'
        : 'VOLTA te guía con 4 pasos simples. Cuando publiques, Inicio se convierte en tu panel para manejar todo desde un solo lugar.',
      icon: LayoutDashboard,
      items: isPublished
        ? ['Estado de la tienda', 'Visitas y actividad', 'Link para compartir']
        : ['Datos del negocio', 'Portada clara', 'Primer producto'],
    },
    {
      id: 'products',
      eyebrow: 'Productos',
      title: 'Tu catálogo vive acá',
      description: 'Creá productos, subí fotos, cambiá precios y mantené lo que vendés siempre actualizado.',
      icon: Package,
      items: ['Fotos y precios', 'Categorías', 'Productos activos'],
    },
    {
      id: 'design',
      eyebrow: 'Diseño',
      title: 'La tienda se puede hacer tuya',
      description: 'Desde Diseño cambiás portada, colores, tipografías y la forma en que se ven tus productos.',
      icon: Palette,
      items: ['Portada', 'Colores y fuentes', 'Estilo del catálogo'],
    },
    {
      id: 'preview',
      eyebrow: 'Vista previa',
      title: 'Mirá la tienda como la ve un cliente',
      description: 'El botón “Ver mi tienda” abre la experiencia real. Usalo cada vez que quieras revisar un cambio antes de compartir.',
      icon: Eye,
      items: ['Revisá cambios', 'Probá en mobile', 'Compartí cuando esté lista'],
    },
  ]

  const step = steps[stepIndex]
  const StepIcon = step.icon
  const isLast = stepIndex === steps.length - 1

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, 'done')
    } catch {
      // The tour can still close even when localStorage is blocked.
    }
    setOpen(false)
  }, [storageKey])

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === 'done') return
    } catch {
      // If storage is unavailable, showing the tour once in this session is still useful.
    }

    const timeout = window.setTimeout(() => setOpen(true), 450)
    return () => window.clearTimeout(timeout)
  }, [storageKey])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') finish()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [finish, open])

  function next() {
    if (isLast) {
      finish()
      return
    }
    setStepIndex((current) => current + 1)
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-5" role="presentation">
          <motion.button
            type="button"
            aria-label="Omitir tutorial"
            className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={finish}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="volta-admin-tour-title"
            initial={{ y: 34, opacity: 0, scale: .98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: .985 }}
            transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(2,8,23,.28)] dark:border-white/10 dark:bg-[#111820]"
          >
            <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-[9px] bg-[#12e89a] text-[#062117]">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-[#75f5c5]">Mini tutorial</p>
                  <p className="text-[11px] font-medium text-muted-foreground">{stepIndex + 1} de {steps.length}</p>
                </div>
              </div>
              <button type="button" onClick={finish} className="inline-flex min-h-9 items-center gap-1.5 rounded-[9px] px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/7">
                Omitir <X className="size-3.5" />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ x: 18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -18, opacity: 0 }}
                  transition={{ duration: .2 }}
                >
                  <div className="relative overflow-hidden rounded-[18px] border border-black/7 bg-[linear-gradient(145deg,#f8fafc,#eefdf7)] p-4 dark:border-white/8 dark:bg-[linear-gradient(145deg,#182029,#10231d)]">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex size-11 items-center justify-center rounded-[13px] bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,.08)] dark:bg-white/10 dark:text-white"
                    >
                      <StepIcon className="size-5" />
                    </motion.div>

                    <div className="mt-5 space-y-2">
                      {step.items.map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: .06 * index }}
                          className="flex items-center gap-2 rounded-[10px] border border-black/6 bg-white/85 px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm dark:border-white/7 dark:bg-white/7 dark:text-white/85"
                        >
                          <span className="size-1.5 rounded-full bg-[#12e89a]" />
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-[#75f5c5]">{step.eyebrow}</p>
                  <h2 id="volta-admin-tour-title" className="mt-1.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-foreground">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {steps.map((item, index) => (
                    <span key={item.id} className={`h-1.5 rounded-full transition-all ${index === stepIndex ? 'w-6 bg-[#12e89a]' : 'w-1.5 bg-slate-200 dark:bg-white/15'}`} />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {stepIndex > 0 ? (
                    <button type="button" onClick={() => setStepIndex((current) => current - 1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-black/8 bg-white px-3.5 text-sm font-semibold text-foreground transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8">
                      <ArrowLeft className="size-4" />
                      Atrás
                    </button>
                  ) : null}
                  <button type="button" onClick={next} className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-[#10161d] px-4 text-sm font-semibold text-white transition hover:bg-[#17202a] dark:bg-[#12e89a] dark:text-[#062117]">
                    {isLast ? 'Listo, explorar' : 'Siguiente'}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
