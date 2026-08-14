'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

function parseRetryAfter(message: string): number {
  const match = message.match(/(\d+)\s*second/i)
  return match ? Number.parseInt(match[1], 10) : 60
}

async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers()
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const host = forwardedHost ?? requestHeaders.get('host')
  const forwardedProto = requestHeaders.get('x-forwarded-proto')
  const protocol = forwardedProto ?? (process.env.NODE_ENV === 'development' ? 'http' : 'https')

  if (host) {
    return `${protocol}://${host}`
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (configuredUrl) {
    return configuredUrl
  }

  throw new Error('No se pudo resolver el origen de la aplicacion para enviar el acceso.')
}

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient()
  let origin: string

  try {
    origin = await getRequestOrigin()
  } catch {
    return {
      error: 'No pudimos preparar el acceso por email. Intenta nuevamente en unos instantes.',
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // The email template adds the TokenHash to this scanner-safe landing page.
      // Merely opening the email link does not consume the one-time token.
      emailRedirectTo: `${origin}/auth/email?next=/admin&provider=email`,
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
  const result = await safeGetUser(supabase)
  return result.user
}
