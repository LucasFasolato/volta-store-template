'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function parseRetryAfter(message: string): number {
  const match = message.match(/(\d+)\s*second/i)
  return match ? Number.parseInt(match[1], 10) : 60
}

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/admin`,
    },
  })

  if (error) {
    const isRateLimit =
      error.status === 429 ||
      /security purposes|rate.?limit|too many|over_email/i.test(error.message)

    if (isRateLimit) {
      return {
        error: 'Ya enviamos un link hace instantes. Revisa tu correo o espera un minuto antes de pedir otro.',
        rateLimited: true as const,
        retryAfter: parseRetryAfter(error.message),
      }
    }

    return {
      error: 'No pudimos enviar el link de acceso. Revisa el email e intenta nuevamente.',
    }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
