'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, ArrowRight, Check } from 'lucide-react'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'
type Step = 1 | 2 | 3 | 4

const STORAGE_KEY = 'volta-onboarding-theme'

const INTENT_OPTIONS = [
  { id: 'physical', label: 'Productos físicos', emoji: '📦' },
  { id: 'services', label: 'Servicios', emoji: '🛠️' },
  { id: 'digital', label: 'Digital', emoji: '💻' },
  { id: 'unsure', label: 'No estoy seguro', emoji: '🤷' },
]

const STEP_LABELS = ['Nombre', 'WhatsApp', 'Categoría', 'Listo']

const slideVariants = {
  enter: (dir: 'forward' | 'back') => ({
    x: dir === 'forward' ? 36 : -36,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 'forward' | 'back') => ({
    x: dir === 'forward' ? -36 : 36,
    opacity: 0,
  }),
}

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [theme, setTheme] = useState<Theme>('light')
  const [systemDark, setSystemDark] = useState(false)
  const [storeName, setStoreName] = useState(initialName)
  const [whatsapp, setWhatsapp] = useState('')
  const [intent, setIntent] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [waError, setWaError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored) setTheme(stored)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const isDark = theme === 'dark' || (theme === 'system' && systemDark)

  const handleTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
  }

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

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        isDark ? 'bg-[#030712]' : 'light bg-[#f5f7fa]',
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-lg text-sm font-black',
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

        {/* Theme toggle */}
        <div
          className={cn(
            'flex items-center gap-0.5 rounded-xl p-1',
            isDark ? 'bg-white/8' : 'bg-black/6',
          )}
        >
          {(
            [
              { value: 'light' as Theme, Icon: Sun, label: 'Claro' },
              { value: 'system' as Theme, Icon: Monitor, label: 'Sistema' },
              { value: 'dark' as Theme, Icon: Moon, label: 'Oscuro' },
            ] as const
          ).map(({ value, Icon, label }) => (
            <button
              key={value}
              onClick={() => handleTheme(value)}
              title={label}
              className={cn(
                'flex items-center justify-center rounded-lg p-1.5 transition-all duration-150',
                theme === value
                  ? isDark
                    ? 'bg-white/14 text-white'
                    : 'bg-white text-[#0f172a] shadow-sm'
                  : isDark
                    ? 'text-white/40 hover:text-white/65'
                    : 'text-black/35 hover:text-black/55',
              )}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Step progress */}
          <div className="mb-8 flex items-center justify-center gap-2.5">
            {([1, 2, 3, 4] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-2.5">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
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
                    {s < step ? <Check className="size-3.5" strokeWidth={2.5} /> : s}
                  </div>
                  <span
                    className={cn(
                      'hidden text-[10px] font-medium sm:block',
                      s === step
                        ? isDark
                          ? 'text-white/70'
                          : 'text-[#0f172a]/60'
                        : isDark
                          ? 'text-white/25'
                          : 'text-black/22',
                    )}
                  >
                    {STEP_LABELS[s - 1]}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      'mb-3 h-px w-10 transition-all duration-500',
                      s < step
                        ? 'bg-emerald-500'
                        : isDark
                          ? 'bg-white/10'
                          : 'bg-black/10',
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
                : 'border-black/8 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]',
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
                {step === 1 && (
                  <TwoColumnLayout isDark={isDark} left={<Step1Left isDark={isDark} />}>
                    <div className="space-y-2">
                      <label
                        className={cn(
                          'block text-[11px] font-medium uppercase tracking-widest',
                          isDark ? 'text-white/38' : 'text-[#94a3b8]',
                        )}
                      >
                        Nombre del negocio
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value)
                          if (nameError) setNameError('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && goNext()}
                        placeholder="Tu negocio"
                        maxLength={48}
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 text-base outline-none transition-all duration-150',
                          isDark
                            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/22 focus:border-emerald-400/45 focus:ring-2 focus:ring-emerald-400/18'
                            : 'border-black/10 bg-[#f8fafc] text-[#0f172a] placeholder:text-[#c0cad8] focus:border-[#0f172a]/25 focus:bg-white focus:ring-2 focus:ring-[#0f172a]/6',
                          nameError
                            ? isDark
                              ? 'border-red-400/60'
                              : 'border-red-400'
                            : '',
                        )}
                      />
                      {nameError ? (
                        <p className="text-xs text-red-400">{nameError}</p>
                      ) : (
                        <p
                          className={cn(
                            'text-xs',
                            isDark ? 'text-white/30' : 'text-[#94a3b8]',
                          )}
                        >
                          Es el nombre que verán tus clientes
                        </p>
                      )}
                    </div>
                  </TwoColumnLayout>
                )}

                {step === 2 && (
                  <TwoColumnLayout isDark={isDark} left={<Step2Left isDark={isDark} />}>
                    <div className="space-y-2">
                      <label
                        className={cn(
                          'block text-[11px] font-medium uppercase tracking-widest',
                          isDark ? 'text-white/38' : 'text-[#94a3b8]',
                        )}
                      >
                        Número de WhatsApp
                      </label>
                      <input
                        autoFocus
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => {
                          setWhatsapp(e.target.value)
                          if (waError) setWaError('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && goNext()}
                        placeholder="+54 9 11 1234 5678"
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 text-base outline-none transition-all duration-150',
                          isDark
                            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/22 focus:border-emerald-400/45 focus:ring-2 focus:ring-emerald-400/18'
                            : 'border-black/10 bg-[#f8fafc] text-[#0f172a] placeholder:text-[#c0cad8] focus:border-[#0f172a]/25 focus:bg-white focus:ring-2 focus:ring-[#0f172a]/6',
                          waError
                            ? isDark
                              ? 'border-red-400/60'
                              : 'border-red-400'
                            : '',
                        )}
                      />
                      {waError ? (
                        <p className="text-xs text-red-400">{waError}</p>
                      ) : (
                        <p
                          className={cn(
                            'text-xs',
                            isDark ? 'text-white/30' : 'text-[#94a3b8]',
                          )}
                        >
                          Tus clientes te van a escribir acá para comprar
                        </p>
                      )}
                    </div>
                  </TwoColumnLayout>
                )}

                {step === 3 && (
                  <TwoColumnLayout isDark={isDark} left={<Step3Left isDark={isDark} />}>
                    <div className="grid grid-cols-2 gap-2.5">
                      {INTENT_OPTIONS.map((opt) => {
                        const selected = intent.includes(opt.id)
                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleIntent(opt.id)}
                            className={cn(
                              'flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all duration-150',
                              selected
                                ? isDark
                                  ? 'border-emerald-400/35 bg-emerald-400/9 text-white'
                                  : 'border-[#0f172a]/22 bg-[#0f172a]/5 text-[#0f172a]'
                                : isDark
                                  ? 'border-white/8 bg-transparent text-white/52 hover:border-white/14 hover:text-white/80'
                                  : 'border-black/8 bg-transparent text-[#64748b] hover:border-black/14 hover:text-[#0f172a]',
                            )}
                          >
                            <span className="text-xl leading-none">{opt.emoji}</span>
                            <span className="text-sm font-medium leading-snug">{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </TwoColumnLayout>
                )}

                {step === 4 && (
                  <div className="px-8 py-16 text-center sm:py-24">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.3)]">
                      <Check className="size-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h1
                      className={cn(
                        'text-2xl font-semibold tracking-tight sm:text-[1.85rem]',
                        isDark ? 'text-white' : 'text-[#0f172a]',
                      )}
                    >
                      Tu tienda está lista
                      <br />
                      para empezar
                    </h1>
                    <p
                      className={cn(
                        'mx-auto mt-3 max-w-sm text-sm leading-relaxed',
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
              'mt-5 flex items-center',
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

            <div className="flex items-center gap-3">
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
                    'flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95',
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
                    'flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95',
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

/* ─── Layout ─────────────────────────────────────────────── */

function TwoColumnLayout({
  isDark,
  left,
  children,
}: {
  isDark: boolean
  left: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-8 p-8 sm:flex-row sm:gap-0 sm:p-0">
      <div className="sm:w-[42%] sm:p-10 lg:p-12">{left}</div>
      <div
        className={cn(
          'flex flex-col justify-center sm:w-[58%] sm:border-l sm:p-10 lg:p-12',
          isDark ? 'border-white/8' : 'border-black/8',
        )}
      >
        {children}
      </div>
    </div>
  )
}

/* ─── Step copy ───────────────────────────────────────────── */

function Step1Left({ isDark }: { isDark: boolean }) {
  return (
    <>
      <h1
        className={cn(
          'text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem]',
          isDark ? 'text-white' : 'text-[#0f172a]',
        )}
      >
        ¿Cómo se llama
        <br />
        tu negocio?
      </h1>
      <p
        className={cn(
          'mt-3 text-sm leading-relaxed',
          isDark ? 'text-white/50' : 'text-[#64748b]',
        )}
      >
        Es el nombre que verán tus clientes cuando visiten tu tienda. Podés cambiarlo después.
      </p>
    </>
  )
}

function Step2Left({ isDark }: { isDark: boolean }) {
  return (
    <>
      <h1
        className={cn(
          'text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem]',
          isDark ? 'text-white' : 'text-[#0f172a]',
        )}
      >
        ¿Dónde querés
        <br />
        recibir los pedidos?
      </h1>
      <p
        className={cn(
          'mt-3 text-sm leading-relaxed',
          isDark ? 'text-white/50' : 'text-[#64748b]',
        )}
      >
        Tus clientes te van a escribir acá para comprar. Podés cambiarlo en cualquier momento.
      </p>
    </>
  )
}

function Step3Left({ isDark }: { isDark: boolean }) {
  return (
    <>
      <h1
        className={cn(
          'text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem]',
          isDark ? 'text-white' : 'text-[#0f172a]',
        )}
      >
        ¿Qué vas
        <br />a vender?
      </h1>
      <p
        className={cn(
          'mt-3 text-sm leading-relaxed',
          isDark ? 'text-white/50' : 'text-[#64748b]',
        )}
      >
        Solo para personalizar tu experiencia. Podés elegir más de uno, o saltearlo.
      </p>
    </>
  )
}
