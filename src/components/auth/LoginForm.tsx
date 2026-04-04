'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { signInWithMagicLink } from '@/lib/actions/auth'
import { FormFeedback } from '@/components/common/FormFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  email: z.string().email('Ingresa un email valido'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const [deliveryState, setDeliveryState] = useState<'idle' | 'sent' | 'rate_limited'>('idle')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = await signInWithMagicLink(data.email)

    if (result.error) {
      if ('rateLimited' in result && result.rateLimited) {
        setSubmittedEmail(data.email)
        setDeliveryState('rate_limited')
        return
      }

      setServerError(result.error)
      return
    }

    setSubmittedEmail(data.email)
    setDeliveryState('sent')
  }

  if (deliveryState !== 'idle') {
    return (
      <div className="surface-panel premium-ring rounded-[34px] p-8">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-100">
          {deliveryState === 'rate_limited' ? <TriangleAlert className="size-7" /> : <CheckCircle className="size-7" />}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">
            {deliveryState === 'rate_limited' ? 'Revisa el link que ya enviamos' : 'Revisa tu email'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-300">
            {deliveryState === 'rate_limited'
              ? 'Ya enviamos un acceso hace instantes. Usa ese correo para entrar o espera un minuto antes de pedir otro.'
              : 'Enviamos un magic link a este email. Cuando abras el correo podras entrar directo al panel.'}
          </p>
          <p className="mt-3 font-medium text-white">{submittedEmail}</p>
        </div>

        <div className="mt-6 space-y-3">
          <FormFeedback
            kind={deliveryState === 'rate_limited' ? 'error' : 'success'}
            title={deliveryState === 'rate_limited' ? 'Nuevo envio bloqueado temporalmente' : 'Link enviado'}
            message={
              deliveryState === 'rate_limited'
                ? 'Si no lo ves, revisa spam o promociones antes de volver a intentarlo.'
                : 'Si no aparece en unos segundos, revisa spam o promociones.'
            }
          />

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-neutral-300">
            El enlace es seguro y no necesitas contrasena. Se abre una sola vez y te lleva directo al admin.
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeliveryState('idle')
            setServerError(null)
          }}
          className="mt-6 w-full rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/6"
        >
          Usar otro email
        </button>
      </div>
    )
  }

  return (
    <div className="surface-panel premium-ring rounded-[34px] p-8">
      <div className="mb-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
          <ShieldCheck className="size-3.5" />
          Acceso seguro
        </div>
        <h1 className="text-2xl font-semibold text-white">Ingresar al panel</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-300">
          Te enviamos un enlace de acceso seguro. Sin contrasena, con menos friccion y con feedback claro en cada paso.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <LabelBlock label="Email de acceso" hint="Usa el correo con el que administras tu tienda.">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <Input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                aria-invalid={!!errors.email}
                className="h-12 rounded-2xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-neutral-500"
              />
            </div>
          </LabelBlock>
          {errors.email ? <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p> : null}
        </div>

        {serverError ? (
          <FormFeedback
            kind="error"
            title="No pudimos enviarte el link"
            message={serverError}
          />
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] text-black shadow-[0_18px_36px_rgba(16,185,129,0.18)] hover:brightness-105"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando link...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-[24px] border border-white/8 bg-black/10 p-4">
        <p className="text-sm font-medium text-white">Que va a pasar despues</p>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Revisas tu correo, abres el link y entras directo al panel. Si ya pediste uno recien, te lo avisamos antes de insistir.
        </p>
      </div>
    </div>
  )
}

function LabelBlock({
  label,
  hint,
  children,
}: {
  label: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-200">{label}</p>
      <p className="mb-2 text-xs text-neutral-500">{hint}</p>
      {children}
    </div>
  )
}
