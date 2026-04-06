'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4

const INTENT_OPTIONS = [
  { id: 'physical', label: 'Productos físicos', emoji: '📦' },
  { id: 'services', label: 'Servicios', emoji: '🛠️' },
  { id: 'digital', label: 'Digital', emoji: '💻' },
  { id: 'unsure', label: 'No estoy seguro', emoji: '🤷' },
]

const STEP_LABELS = ['Nombre', 'WhatsApp', 'Categoría', 'Listo']

const slideVariants = {
  enter: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? -40 : 40, opacity: 0 }),
}

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [storeName, setStoreName] = useState(initialName)
  const [whatsapp, setWhatsapp] = useState('')
  const [intent, setIntent] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [waError, setWaError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Until mounted, fall back to light (matches defaultTheme) to avoid flash
  const isDark = mounted ? resolvedTheme === 'dark' : false

  const validateStep1 = () => {
    if (!storeName.trim() || storeName.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres')
      return false
    }
    setNameError('')
    return true
  }

  const validateStep2 = () => {
    const wa = whatsapp.trim()
    if (!wa || wa.length < 8 || !/^\+?[0-9\s\-()]+$/.test(wa)) {
      setWaError('Ingresa un número válido. Ejemplo: +5491112345678')
      return false
    }
    setWaError('')
    return true
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setDirection('forward')
    setStep((s) => (s + 1) as Step)
  }

  const goBack = () => {
    setDirection('back')
    setStep((s) => (s - 1) as Step)
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    const result = await completeOnboarding({ storeName, whatsapp })
    if (result.error) {
      setSubmitError(result.error)
      setIsSubmitting(false)
      return
    }
    router.push('/admin')
  }

  const toggleIntent = (id: string) => {
    setIntent((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  /* ─── Input shared className ─────────────────────────────── */
  const inputClass = (error: boolean) =>
    cn(
      'w-full rounded-xl border px-4 py-3.5 text-base outline-none transition-all duration-150',
      isDark
        ? 'border-white/10 bg-white/5 text-white placeholder:text-white/22 focus:border-emerald-400/45 focus:ring-2 focus:ring-emerald-400/18'
        : 'border-black/10 bg-[#f1f5f9] text-[#0f172a] placeholder:text-[#b0bece] focus:border-[#0f172a]/25 focus:bg-white focus:ring-2 focus:ring-[#0f172a]/6',
      error ? (isDark ? 'border-red-400/60' : 'border-red-400') : '',
    )

  const labelClass = cn(
    'block text-[11px] font-medium uppercase tracking-widest',
    isDark ? 'text-white/38' : 'text-[#94a3b8]',
  )

  const hintClass = cn('text-xs', isDark ? 'text-white/30' : 'text-[#94a3b8]')

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-[#030712]' : 'bg-[#f5f7fa]')}>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-xl text-sm font-black',
              isDark ? 'bg-emerald-400 text-black' : 'bg-[#0f172a] text-white',
            )}
          >
            V
          </div>
          <span
            className={cn(
              'text-sm font-semibold tracking-tight',
              isDark ? 'text-white' : 'text-[#0f172a]',
            )}
          >
            Volta Store
          </span>
        </div>

        <ThemeToggle variant="pill" />
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {/* Step progress */}
          <div className="mb-10 flex items-center justify-center gap-3">
            {([1, 2, 3, 4] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                      s < step
                        ? 'bg-emerald-500 text-white'
                        : s === step
                          ? isDark
                            ? 'bg-emerald-400 text-black'
                            : 'bg-[#0f172a] text-white'
                          : isDark
                            ? 'bg-white/10 text-white/28'
                            : 'bg-black/8 text-black/22',
                    )}
                  >
                    {s < step ? <Check className="size-4" strokeWidth={2.5} /> : s}
                  </div>
                  <span
                    className={cn(
                      'hidden text-[10px] font-medium sm:block',
                      s === step
                        ? isDark
                          ? 'text-white/65'
                          : 'text-[#0f172a]/55'
                        : isDark
                          ? 'text-white/22'
                          : 'text-black/20',
                    )}
                  >
                    {STEP_LABELS[s - 1]}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      'mb-4 h-px w-12 transition-all duration-500',
                      s < step ? 'bg-emerald-500' : isDark ? 'bg-white/10' : 'bg-black/10',
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div
            className={cn(
              'overflow-hidden rounded-2xl border',
              isDark
                ? 'border-white/8 bg-[#0b1220]'
                : 'border-black/7 bg-white shadow-[0_2px_24px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)]',
            )}
          >
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* ── Step 1 ── */}
                {step === 1 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>¿Cómo se llama<br />tu negocio?</>}
                        body="Es el nombre que verán tus clientes cuando visiten tu tienda. Podés cambiarlo después."
                      />
                    }
                  >
                    <div className="space-y-3">
                      <label className={labelClass}>Nombre del negocio</label>
                      <input
                        autoFocus
                        type="text"
                        value={storeName}
                        onChange={(e) => { setStoreName(e.target.value); if (nameError) setNameError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && goNext()}
                        placeholder="Tu negocio"
                        maxLength={48}
                        className={inputClass(!!nameError)}
                      />
                      {nameError ? (
                        <p className="text-xs text-red-400">{nameError}</p>
                      ) : (
                        <p className={hintClass}>Es el nombre que verán tus clientes</p>
                      )}
                    </div>
                  </TwoCol>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>¿Dónde querés<br />recibir los pedidos?</>}
                        body="Tus clientes te van a escribir acá para comprar. Podés cambiarlo en cualquier momento."
                      />
                    }
                  >
                    <div className="space-y-3">
                      <label className={labelClass}>Número de WhatsApp</label>
                      <input
                        autoFocus
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => { setWhatsapp(e.target.value); if (waError) setWaError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && goNext()}
                        placeholder="+54 9 11 1234 5678"
                        className={inputClass(!!waError)}
                      />
                      {waError ? (
                        <p className="text-xs text-red-400">{waError}</p>
                      ) : (
                        <p className={hintClass}>Tus clientes te van a escribir acá para comprar</p>
                      )}
                    </div>
                  </TwoCol>
                )}

                {/* ── Step 3 ── */}
                {step === 3 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>¿Qué vas<br />a vender?</>}
                        body="Solo para personalizar tu experiencia. Podés elegir más de uno, o saltearlo."
                      />
                    }
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {INTENT_OPTIONS.map((opt) => {
                        const selected = intent.includes(opt.id)
                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleIntent(opt.id)}
                            className={cn(
                              'flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all duration-150',
                              selected
                                ? isDark
                                  ? 'border-emerald-400/35 bg-emerald-400/9 text-white'
                                  : 'border-[#0f172a]/20 bg-[#0f172a]/5 text-[#0f172a]'
                                : isDark
                                  ? 'border-white/8 text-white/52 hover:border-white/14 hover:text-white/80'
                                  : 'border-black/8 text-[#64748b] hover:border-black/14 hover:text-[#0f172a]',
                            )}
                          >
                            <span className="text-2xl leading-none">{opt.emoji}</span>
                            <span className="text-sm font-medium leading-snug">{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </TwoCol>
                )}

                {/* ── Step 4 ── */}
                {step === 4 && (
                  <div className="px-8 py-20 text-center sm:py-28">
                    <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-3xl bg-emerald-500 shadow-[0_12px_32px_rgba(16,185,129,0.32)]">
                      <Check className="size-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h1
                      className={cn(
                        'text-3xl font-semibold tracking-tight sm:text-[2.25rem]',
                        isDark ? 'text-white' : 'text-[#0f172a]',
                      )}
                    >
                      Tu tienda está lista
                      <br />
                      para empezar
                    </h1>
                    <p
                      className={cn(
                        'mx-auto mt-4 max-w-sm text-base leading-relaxed',
                        isDark ? 'text-white/50' : 'text-[#64748b]',
                      )}
                    >
                      <span
                        className={cn(
                          'font-semibold',
                          isDark ? 'text-white/85' : 'text-[#0f172a]',
                        )}
                      >
                        {storeName}
                      </span>{' '}
                      está configurada y lista para recibir pedidos por WhatsApp.
                    </p>
                    {submitError && (
                      <p className="mt-4 text-sm text-red-400">{submitError}</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div
            className={cn(
              'mt-6 flex items-center',
              step === 1 ? 'justify-end' : 'justify-between',
            )}
          >
            {step > 1 && (
              <button
                onClick={goBack}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isDark
                    ? 'text-white/38 hover:text-white/62'
                    : 'text-[#94a3b8] hover:text-[#64748b]',
                )}
              >
                ← Atrás
              </button>
            )}

            <div className="flex items-center gap-4">
              {step === 3 && (
                <button
                  onClick={goNext}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isDark
                      ? 'text-white/38 hover:text-white/62'
                      : 'text-[#94a3b8] hover:text-[#64748b]',
                  )}
                >
                  Omitir
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={goNext}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-150 active:scale-95',
                    isDark
                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                      : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                  )}
                >
                  Continuar
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-150 active:scale-95',
                    isDark
                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                      : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                    isSubmitting && 'cursor-not-allowed opacity-55',
                  )}
                >
                  {isSubmitting ? 'Configurando...' : 'Entrar al panel'}
                  {!isSubmitting && <ArrowRight className="size-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── Shared layout sub-components ──────────────────────────── */

function TwoCol({
  isDark,
  left,
  children,
}: {
  isDark: boolean
  left: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-10 p-8 sm:flex-row sm:gap-0 sm:p-0">
      <div className="sm:w-[42%] sm:p-12 lg:p-14">{left}</div>
      <div
        className={cn(
          'flex flex-col justify-center sm:w-[58%] sm:border-l sm:p-12 lg:p-14',
          isDark ? 'border-white/8' : 'border-black/7',
        )}
      >
        {children}
      </div>
    </div>
  )
}

function StepCopy({
  isDark,
  title,
  body,
}: {
  isDark: boolean
  title: React.ReactNode
  body: string
}) {
  return (
    <>
      <h1
        className={cn(
          'text-3xl font-semibold leading-tight tracking-tight sm:text-[2rem]',
          isDark ? 'text-white' : 'text-[#0f172a]',
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          'mt-4 text-[0.9375rem] leading-relaxed',
          isDark ? 'text-white/50' : 'text-[#64748b]',
        )}
      >
        {body}
      </p>
    </>
  )
}
