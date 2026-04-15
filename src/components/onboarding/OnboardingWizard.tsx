'use client'

import { useSyncExternalStore, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/ThemeToggle'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

type Step = 1 | 2

const STEP_LABELS = ['Nombre', 'WhatsApp']

const slideVariants = {
  enter: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? -40 : 40, opacity: 0 }),
}

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [storeName, setStoreName] = useState(initialName)
  const [whatsapp, setWhatsapp] = useState('')
  const [nameError, setNameError] = useState('')
  const [waError, setWaError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDark = mounted ? resolvedTheme === 'dark' : false

  function validateStep1() {
    if (!storeName.trim() || storeName.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres')
      return false
    }

    setNameError('')
    return true
  }

  function validateStep2() {
    const value = whatsapp.trim()
    if (!value || value.length < 8 || !/^\+?[0-9\s\-()]+$/.test(value)) {
      setWaError('Ingresa un numero valido. Ejemplo: +5491112345678')
      return false
    }

    setWaError('')
    return true
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return
    setDirection('forward')
    setStep(2)
  }

  function goBack() {
    setDirection('back')
    setStep(1)
  }

  async function handleFinish() {
    if (!validateStep2()) return

    setIsSubmitting(true)
    setSubmitError('')

    const result = await completeOnboarding({
      storeName,
      whatsapp,
    })

    if (result.error) {
      setSubmitError(result.error)
      setIsSubmitting(false)
      return
    }

    router.replace('/admin')
  }

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
          <span className={cn('text-sm font-semibold tracking-tight', isDark ? 'text-white' : 'text-[#0f172a]')}>
            Volta Store
          </span>
        </div>

        <ThemeToggle variant="pill" />
      </header>

      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="mb-10 flex items-center justify-center gap-3">
            {([1, 2] as Step[]).map((currentStep) => (
              <div key={currentStep} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                      currentStep < step
                        ? 'bg-emerald-500 text-white'
                        : currentStep === step
                          ? isDark
                            ? 'bg-emerald-400 text-black'
                            : 'bg-[#0f172a] text-white'
                          : isDark
                            ? 'bg-white/10 text-white/28'
                            : 'bg-black/8 text-black/22',
                    )}
                  >
                    {currentStep < step ? <Check className="size-4" strokeWidth={2.5} /> : currentStep}
                  </div>
                  <span
                    className={cn(
                      'hidden text-[10px] font-medium sm:block',
                      currentStep === step
                        ? isDark
                          ? 'text-white/65'
                          : 'text-[#0f172a]/55'
                        : isDark
                          ? 'text-white/22'
                          : 'text-black/20',
                    )}
                  >
                    {STEP_LABELS[currentStep - 1]}
                  </span>
                </div>
                {currentStep < 2 ? (
                  <div
                    className={cn(
                      'mb-4 h-px w-12 transition-all duration-500',
                      currentStep < step ? 'bg-emerald-500' : isDark ? 'bg-white/10' : 'bg-black/10',
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>

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
                {step === 1 ? (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>Como se llama<br />tu negocio?</>}
                        body="Solo necesitamos lo esencial para entrar rapido al panel de activacion y mostrarte que falta para vender."
                      />
                    }
                  >
                    <div className="space-y-3">
                      <label className={labelClass}>Nombre del negocio</label>
                      <input
                        autoFocus
                        type="text"
                        value={storeName}
                        onChange={(event) => {
                          setStoreName(event.target.value)
                          if (nameError) setNameError('')
                        }}
                        onKeyDown={(event) => event.key === 'Enter' && goNext()}
                        placeholder="Tu negocio"
                        maxLength={48}
                        className={inputClass(!!nameError)}
                      />
                      {nameError ? (
                        <p className="text-xs text-red-400">{nameError}</p>
                      ) : (
                        <p className={hintClass}>Esto es lo que van a ver primero cuando entres al admin y a tu tienda.</p>
                      )}
                    </div>
                  </TwoCol>
                ) : (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>A donde te van<br />a escribir?</>}
                        body="Tu WhatsApp es la base del flujo de venta. Apenas lo cargues, te llevamos al admin para seguir activando la tienda."
                      />
                    }
                  >
                    <div className="space-y-3">
                      <label className={labelClass}>Numero de WhatsApp</label>
                      <input
                        autoFocus
                        type="tel"
                        value={whatsapp}
                        onChange={(event) => {
                          setWhatsapp(event.target.value)
                          if (waError) setWaError('')
                          if (submitError) setSubmitError('')
                        }}
                        onKeyDown={(event) => event.key === 'Enter' && handleFinish()}
                        placeholder="+54 9 11 1234 5678"
                        className={inputClass(!!waError || !!submitError)}
                      />
                      {waError || submitError ? (
                        <p className="text-xs text-red-400">{waError || submitError}</p>
                      ) : (
                        <p className={hintClass}>Despues vas a ver que ya quedo listo, que falta y cual es el siguiente paso para publicar.</p>
                      )}
                    </div>
                  </TwoCol>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={cn('mt-6 flex items-center', step === 1 ? 'justify-end' : 'justify-between')}>
            {step > 1 ? (
              <button
                onClick={goBack}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isDark ? 'text-white/38 hover:text-white/62' : 'text-[#94a3b8] hover:text-[#64748b]',
                )}
              >
                ← Atras
              </button>
            ) : null}

            {step === 1 ? (
              <button
                onClick={goNext}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-150 active:scale-95',
                  isDark ? 'bg-emerald-400 text-black hover:bg-emerald-300' : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
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
                  'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-150 active:scale-95',
                  isDark ? 'bg-emerald-400 text-black hover:bg-emerald-300' : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                  isSubmitting ? 'cursor-not-allowed opacity-60' : '',
                )}
              >
                {isSubmitting ? 'Entrando al panel...' : 'Entrar al panel de activacion'}
                {!isSubmitting ? <ArrowRight className="size-4" /> : null}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

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
      <p className={cn('mt-4 text-[0.9375rem] leading-relaxed', isDark ? 'text-white/50' : 'text-[#64748b]')}>
        {body}
      </p>
    </>
  )
}
