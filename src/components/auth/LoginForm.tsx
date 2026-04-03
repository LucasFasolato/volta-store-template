'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, CheckCircle, Loader2, Mail } from 'lucide-react'
import { signInWithMagicLink } from '@/lib/actions/auth'
import { FormFeedback } from '@/components/common/FormFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  email: z.string().email('Ingresa un email valido'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = await signInWithMagicLink(data.email)
    if (result.error) {
      setServerError(result.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="surface-panel premium-ring rounded-[32px] p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-200">
          <CheckCircle className="size-7" />
        </div>
        <h2 className="text-xl font-semibold text-white">Revisa tu email</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-300">
          Enviamos un magic link a <span className="font-medium text-white">{getValues('email')}</span>. Cuando abras el correo podras entrar directo al panel.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-neutral-400 transition hover:text-white"
        >
          Usar otro email
        </button>
      </div>
    )
  }

  return (
    <div className="surface-panel premium-ring rounded-[32px] p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Ingresar al panel</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Te enviamos un enlace de acceso seguro. Sin contrasena y sin pasos extra.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
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
          {errors.email ? <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p> : null}
        </div>

        {serverError ? <FormFeedback kind="error" message={serverError} /> : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-full bg-emerald-400 text-black hover:bg-emerald-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-6 text-neutral-500">
        Solo necesitas acceso al correo para ingresar.
      </p>
    </div>
  )
}
