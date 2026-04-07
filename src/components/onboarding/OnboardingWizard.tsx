'use client'

import { useSyncExternalStore, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Package2, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/ThemeToggle'
import { THEME_PRESETS } from '@/data/theme-presets'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS = ['Nombre', 'WhatsApp', 'Producto', 'Estilo', 'Listo']
const ONBOARDING_PRESETS = THEME_PRESETS.filter((preset) =>
  ['minimal', 'fashion', 'organic'].includes(preset.id),
)

const slideVariants = {
  enter: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? -40 : 40, opacity: 0 }),
}

export function OnboardingWizard({
  initialName,
  hasActiveProduct,
}: {
  initialName: string
  hasActiveProduct: boolean
}) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [storeName, setStoreName] = useState(initialName)
  const [whatsapp, setWhatsapp] = useState('')
  const [firstProductName, setFirstProductName] = useState('')
  const [firstProductPrice, setFirstProductPrice] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('minimal')
  const [nameError, setNameError] = useState('')
  const [waError, setWaError] = useState('')
  const [productError, setProductError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
    const wa = whatsapp.trim()
    if (!wa || wa.length < 8 || !/^\+?[0-9\s\-()]+$/.test(wa)) {
      setWaError('Ingresa un numero valido. Ejemplo: +5491112345678')
      return false
    }
    setWaError('')
    return true
  }

  function validateStep3() {
    if (hasActiveProduct) {
      setProductError('')
      return true
    }

    const price = Number(firstProductPrice.replace(',', '.'))
    if (!firstProductName.trim()) {
      setProductError('Para continuar, agrega tu primer producto.')
      return false
    }
    if (!Number.isFinite(price) || price <= 0) {
      setProductError('Ingresa un precio valido para tu primer producto.')
      return false
    }

    setProductError('')
    return true
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    setDirection('forward')
    setStep((current) => (current + 1) as Step)
  }

  function goBack() {
    setDirection('back')
    setStep((current) => (current - 1) as Step)
  }

  async function handleFinish() {
    setIsSubmitting(true)
    setSubmitError('')

    const previewWindow = window.open('', '_blank')
    const firstProductPriceValue = Number(firstProductPrice.replace(',', '.'))

    const result = await completeOnboarding({
      storeName,
      whatsapp,
      firstProductName: hasActiveProduct ? undefined : firstProductName,
      firstProductPrice: hasActiveProduct ? undefined : firstProductPriceValue,
      presetId: selectedPreset,
    })

    if (result.error) {
      previewWindow?.close()
      setSubmitError(result.error)
      setIsSubmitting(false)
      return
    }

    if (result.publicPath) {
      if (previewWindow) {
        previewWindow.location.href = result.publicPath
      } else {
        window.open(result.publicPath, '_blank')
      }
    }

    router.push('/admin')
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
            {([1, 2, 3, 4, 5] as Step[]).map((s) => (
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
                {s < 5 && (
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
                {step === 1 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>Como se llama<br />tu negocio?</>}
                        body="Ese nombre va a vivir en tu tienda y en la portada inicial. Puedes cambiarlo despues."
                      />
                    }
                  >
                    <div className="space-y-3">
                      <label className={labelClass}>Nombre del negocio</label>
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
                        className={inputClass(!!nameError)}
                      />
                      {nameError ? (
                        <p className="text-xs text-red-400">{nameError}</p>
                      ) : (
                        <p className={hintClass}>Tambien se va a usar como base del hero inicial</p>
                      )}
                    </div>
                  </TwoCol>
                )}

                {step === 2 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>Donde quieres<br />recibir pedidos?</>}
                        body="Tus clientes te van a escribir aqui para comprar. Este dato activa el cierre por WhatsApp."
                      />
                    }
                  >
                    <div className="space-y-3">
                      <label className={labelClass}>Numero de WhatsApp</label>
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
                        className={inputClass(!!waError)}
                      />
                      {waError ? (
                        <p className="text-xs text-red-400">{waError}</p>
                      ) : (
                        <p className={hintClass}>Sin esto no se puede terminar la activacion</p>
                      )}
                    </div>
                  </TwoCol>
                )}

                {step === 3 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>Tu primer producto<br />es obligatorio</>}
                        body="Con un producto real la tienda ya se puede compartir. No hace falta cargar mas para terminar."
                      />
                    }
                  >
                    {hasActiveProduct ? (
                      <div
                        className={cn(
                          'rounded-2xl border px-5 py-5',
                          isDark ? 'border-emerald-400/20 bg-emerald-400/8' : 'border-emerald-500/20 bg-emerald-50',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                            <Package2 className="size-5" />
                          </div>
                          <div>
                            <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-[#0f172a]')}>
                              Ya tienes tu primer producto
                            </p>
                            <p className={cn('mt-1 text-sm', isDark ? 'text-white/55' : 'text-[#64748b]')}>
                              Puedes seguir. Si quieres, luego agregas mas desde Productos.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className={labelClass}>Nombre del producto</label>
                          <input
                            autoFocus
                            type="text"
                            value={firstProductName}
                            onChange={(e) => {
                              setFirstProductName(e.target.value)
                              if (productError) setProductError('')
                            }}
                            placeholder="Ej: Remera clasica"
                            maxLength={55}
                            className={inputClass(!!productError)}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className={labelClass}>Precio</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={firstProductPrice}
                            onChange={(e) => {
                              setFirstProductPrice(e.target.value)
                              if (productError) setProductError('')
                            }}
                            placeholder="25000"
                            className={inputClass(!!productError)}
                          />
                        </div>

                        {productError ? (
                          <p className="text-xs text-red-400">{productError}</p>
                        ) : (
                          <p className={hintClass}>Solo nombre y precio. Lo demas lo puedes editar despues.</p>
                        )}
                      </div>
                    )}
                  </TwoCol>
                )}

                {step === 4 && (
                  <TwoCol
                    isDark={isDark}
                    left={
                      <StepCopy
                        isDark={isDark}
                        title={<>Elige un estilo<br />para arrancar</>}
                        body="Despues puedes cambiar todo. Aqui solo estas marcando una direccion visual linda desde el minuto uno."
                      />
                    }
                  >
                    <div className="grid gap-3">
                      {ONBOARDING_PRESETS.map((preset) => {
                        const selected = selectedPreset === preset.id
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedPreset(preset.id)}
                            className={cn(
                              'overflow-hidden rounded-2xl border text-left transition-all duration-150',
                              selected
                                ? isDark
                                  ? 'border-emerald-400/35 bg-emerald-400/8'
                                  : 'border-[#0f172a]/14 bg-[#0f172a]/3'
                                : isDark
                                  ? 'border-white/8 bg-white/[0.02] hover:border-white/16'
                                  : 'border-black/8 bg-[#f8fafc] hover:border-black/14',
                            )}
                          >
                            <div
                              className="flex h-24 items-end gap-2 px-4 pb-3"
                              style={{
                                background: `linear-gradient(135deg, ${preset.previewColors[0]} 0%, ${preset.previewColors[1]}22 100%)`,
                              }}
                            >
                              {[0, 1, 2].map((index) => (
                                <div
                                  key={index}
                                  className="flex-1 rounded-[10px]"
                                  style={{
                                    height: index === 1 ? 44 : 34,
                                    background: preset.previewColors[2],
                                    opacity: 0.18 + index * 0.14,
                                  }}
                                />
                              ))}
                            </div>
                            <div className="space-y-2 px-4 py-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-[#0f172a]')}>
                                  {preset.name}
                                </p>
                                {selected ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-500">
                                    <Sparkles className="size-3" />
                                    Elegido
                                  </span>
                                ) : null}
                              </div>
                              <p className={cn('text-sm leading-6', isDark ? 'text-white/50' : 'text-[#64748b]')}>
                                {preset.description}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </TwoCol>
                )}

                {step === 5 && (
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
                      Tu tienda ya esta lista
                      <br />
                      para mostrarse
                    </h1>
                    <p
                      className={cn(
                        'mx-auto mt-4 max-w-md text-base leading-relaxed',
                        isDark ? 'text-white/50' : 'text-[#64748b]',
                      )}
                    >
                      <span className={cn('font-semibold', isDark ? 'text-white/85' : 'text-[#0f172a]')}>
                        {storeName}
                      </span>{' '}
                      va a abrir su tienda publica en una pestaña nueva para que veas el resultado real, y tu admin queda listo en esta.
                    </p>
                    {submitError ? <p className="mt-4 text-sm text-red-400">{submitError}</p> : null}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={cn('mt-6 flex items-center', step === 1 ? 'justify-end' : 'justify-between')}>
            {step > 1 && (
              <button
                onClick={goBack}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isDark ? 'text-white/38 hover:text-white/62' : 'text-[#94a3b8] hover:text-[#64748b]',
                )}
              >
                ← Atras
              </button>
            )}

            <div className="flex items-center gap-4">
              {step < 5 ? (
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
                    'flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-150 active:scale-95',
                    isDark ? 'bg-emerald-400 text-black hover:bg-emerald-300' : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                    isSubmitting && 'cursor-not-allowed opacity-55',
                  )}
                >
                  {isSubmitting ? 'Abriendo tu tienda...' : 'Ver mi tienda'}
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
