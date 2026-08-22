'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { resolveMagicLinkOrigin, sanitizeInternalRedirect } from '@/lib/auth/redirects'

function parseRetryAfter(message: string): number {
  const match = message.match(/(\d+)\s*second/i)
  return match ? Number.parseInt(match[1], 10) : 60
}

async function getRequestOrigin(): Promise<string> {
  if (process.env.NODE_ENV !== 'development') {
    return resolveMagicLinkOrigin(process.env)
  }

  const requestHeaders = await headers()
  return resolveMagicLinkOrigin(process.env, requestHeaders.get('host'))
}

export async function signInWithMagicLink(email: string, requestedNext = '/admin') {
  const supabase = await createClient()
  let origin: string

  try {
    origin = await getRequestOrigin()
  } catch {
    return {
      error: 'No pudimos preparar el acceso por email. Intenta nuevamente en unos instantes.',
    }
  }

  const next = sanitizeInternalRedirect(requestedNext)
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/email?next=${encodeURIComponent(next)}&provider=email`,
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
