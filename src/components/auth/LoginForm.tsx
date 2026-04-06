'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  CheckCircle,
  Clock3,
  Loader2,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import type { LoginFeedback } from '@/lib/auth/login-feedback'
import { signInWithMagicLink } from '@/lib/actions/auth'
import { FormFeedback } from '@/components/common/FormFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Ingresa un email valido'),
})

type FormData = z.infer<typeof schema>

export function LoginForm({ initialFeedback = null }: { initialFeedback?: LoginFeedback | null }) {
  const [blockingFeedback, setBlockingFeedback] = useState<LoginFeedback | null>(
    initialFeedback?.tone === 'error' ? null : initialFeedback,
  )
  const [inlineFeedback, setInlineFeedback] = useState<LoginFeedback | null>(
    initialFeedback?.tone === 'error' ? initialFeedback : null,
  )
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function handleGoogleSignIn() {
    setInlineFeedback(null)
    setIsGoogleLoading(true)

    const supabase = createClient()
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const redirectTo = `${base}/auth/callback?next=/admin&provider=google`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      setInlineFeedback({
        tone: 'error',
        title: 'Google no pudo completar el ingreso',
        message: 'Intenta nuevamente con Google o usa el acceso por email.',
        detail: 'Si sigue fallando, espera un momento y vuelve a intentar.',
      })
      setIsGoogleLoading(false)
    }
  }

  async function onSubmit(data: FormData) {
    setInlineFeedback(null)
    const result = await signInWithMagicLink(data.email)

    if (result.error) {
      if ('rateLimited' in result && result.rateLimited) {
        setBlockingFeedback({
          tone: 'pending',
          title: 'Revisa el link que ya enviamos',
          message:
            'Ya enviamos un acceso hace instantes. Usa ese correo para entrar o espera un minuto antes de pedir otro.',
          detail: 'Si no lo ves, revisa spam o promociones antes de volver a intentarlo.',
          email: data.email,
        })
        return
      }

      setInlineFeedback({
        tone: 'error',
        title: 'No pudimos iniciar sesion',
        message: result.error,
      })
      return
    }

    setBlockingFeedback({
      tone: 'success',
      title: 'Revisa tu email',
      message: 'Enviamos un magic link a este email. Cuando abras el correo podras entrar directo al panel.',
      detail: 'Si no aparece en unos segundos, revisa spam o promociones.',
      email: data.email,
    })
  }

  if (blockingFeedback) {
    return (
      <div className="surface-panel premium-ring rounded-[34px] p-8">
        <div className={statusIconClassName(blockingFeedback.tone)}>
          {blockingFeedback.tone === 'pending' ? (
            <Clock3 className="size-7" />
          ) : blockingFeedback.tone === 'success' ? (
            <CheckCircle className="size-7" />
          ) : (
            <TriangleAlert className="size-7" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">{blockingFeedback.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{blockingFeedback.message}</p>
          {blockingFeedback.email ? (
            <p className="mt-3 font-medium text-foreground">{blockingFeedback.email}</p>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          <StatusFeedback feedback={blockingFeedback} />

          <div className="rounded-[24px] border border-border dark:border-white/8 bg-black/[0.04] dark:bg-white/4 p-4 text-sm leading-6 text-muted-foreground">
            El enlace es seguro y no necesitas contrasena. Se abre una sola vez y te lleva directo al admin.
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setBlockingFeedback(null)
            setInlineFeedback(null)
          }}
          className="mt-6 w-full rounded-full border border-border dark:border-white/10 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-black/[0.04] dark:hover:bg-white/6"
        >
          Usar otro email
        </button>
      </div>
    )
  }

  return (
    <div className="surface-panel premium-ring rounded-[34px] p-8">
      <div className="mb-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border dark:border-white/8 bg-black/[0.04] dark:bg-white/4 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-200">
          <ShieldCheck className="size-3.5" />
          Acceso seguro
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Ingresar al panel</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Entra con Google en un click o usa magic link si prefieres seguir por email.
        </p>
      </div>

      <div className="space-y-4">
        {inlineFeedback ? <StatusFeedback feedback={inlineFeedback} /> : null}

        <Button
          type="button"
          disabled={isGoogleLoading || isSubmitting}
          onClick={handleGoogleSignIn}
          className="h-12 w-full rounded-full border border-black/[0.08] dark:border-white/10 bg-white text-black shadow-[0_18px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_36px_rgba(255,255,255,0.08)] hover:bg-white/90"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Redirigiendo a Google...
            </>
          ) : (
            <>
              <GoogleIcon className="mr-2 size-4" />
              Continuar con Google
            </>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border dark:bg-white/8" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            o usa email
          </span>
          <div className="h-px flex-1 bg-border dark:bg-white/8" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <LabelBlock label="Email de acceso" hint="Usa el correo con el que administras tu tienda.">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  aria-invalid={!!errors.email}
                  className="h-12 rounded-2xl border-border dark:border-white/10 bg-black/[0.04] dark:bg-white/5 pl-11 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </LabelBlock>
            {errors.email ? <p className="mt-1.5 text-xs text-red-500 dark:text-red-300">{errors.email.message}</p> : null}
          </div>

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
      </div>

      <div className="mt-6 rounded-[24px] border border-border dark:border-white/8 bg-black/[0.04] dark:bg-black/10 p-4">
        <p className="text-sm font-medium text-foreground">Que va a pasar despues</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Google te lleva directo al callback seguro. Si eliges email, revisas tu bandeja y entras desde el link.
        </p>
      </div>
    </div>
  )
}

function StatusFeedback({ feedback }: { feedback: LoginFeedback }) {
  if (feedback.tone === 'error' || feedback.tone === 'success') {
    return (
      <FormFeedback
        kind={feedback.tone === 'error' ? 'error' : 'success'}
        title={feedback.title}
        message={feedback.detail ?? feedback.message}
      />
    )
  }

  return (
    <div className="rounded-[24px] border border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(146,64,14,0.12))] px-4 py-3.5 text-sm text-amber-50 shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-amber-200/12 text-amber-100">
          <Clock3 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-current">{feedback.title}</p>
          <p className="mt-1 leading-6 text-current/85">{feedback.detail ?? feedback.message}</p>
        </div>
      </div>
    </div>
  )
}

function statusIconClassName(tone: LoginFeedback['tone']) {
  if (tone === 'pending') {
    return 'mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-amber-300/12 text-amber-100'
  }

  if (tone === 'success') {
    return 'mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-100'
  }

  return 'mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-red-400/12 text-red-100'
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
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      {children}
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M21.8 12.23c0-.72-.06-1.25-.2-1.8H12v3.79h5.64c-.11.94-.69 2.36-1.98 3.31l-.02.13 3.03 2.3.21.02c1.95-1.77 3.07-4.38 3.07-7.75Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.89 6.78-2.42l-3.22-2.45c-.86.59-2.01 1-3.56 1-2.71 0-5.01-1.77-5.83-4.21l-.12.01-3.16 2.39-.04.11C4.54 19.72 8.02 22 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.17 13.92A5.9 5.9 0 0 1 5.83 12c0-.67.12-1.32.32-1.92l-.01-.13-3.2-2.42-.1.04A9.86 9.86 0 0 0 2 12c0 1.58.38 3.07 1.05 4.43l3.12-2.51Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.87c1.96 0 3.29.83 4.05 1.53l2.95-2.82C17.07 2.82 14.76 2 12 2 8.02 2 4.54 4.28 2.85 7.57l3.31 2.51c.84-2.44 3.14-4.21 5.84-4.21Z"
        fill="#EA4335"
      />
    </svg>
  )
}
