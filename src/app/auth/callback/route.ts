import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { ensureOnboarding, needsOnboarding } from '@/lib/actions/onboarding'
import { recordSaasMilestone } from '@/lib/analytics/saas-server'
import { inferLoginErrorReason } from '@/lib/auth/login-feedback'
import { sanitizeInternalRedirect } from '@/lib/auth/redirects'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

function redirectToLogin(origin: string, params: { reason: string; provider?: string | null }) {
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('auth', 'error')
  loginUrl.searchParams.set('reason', params.reason)

  if (params.provider) {
    loginUrl.searchParams.set('provider', params.provider)
  }

  return NextResponse.redirect(loginUrl)
}

function isLikelyFirstSignup(user: User) {
  if (!user.created_at || !user.last_sign_in_at) return false
  const createdAt = Date.parse(user.created_at)
  const signedInAt = Date.parse(user.last_sign_in_at)
  if (!Number.isFinite(createdAt) || !Number.isFinite(signedInAt)) return false
  return signedInAt >= createdAt && signedInAt - createdAt <= 30 * 60 * 1000
}

async function ensureAndMeasureSignup(user: User, path: string) {
  const onboarding = await ensureOnboarding(user)
  if (onboarding.storeCreated || isLikelyFirstSignup(user)) {
    await recordSaasMilestone({
      eventType: 'signup_completed',
      userId: user.id,
      storeId: onboarding.storeId,
      path,
    })
  }
  return onboarding
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const provider = searchParams.get('provider')

  if (error) {
    const reason = inferLoginErrorReason({
      error,
      errorDescription,
      provider,
    })

    return redirectToLogin(origin, { reason, provider })
  }

  if (!code) {
    const supabase = await createClient()
    const { user } = await safeGetUser(supabase)

    if (user) {
      try {
        await ensureAndMeasureSignup(user, '/auth/callback')
      } catch {
        // Non-blocking
      }

      const goToOnboarding = await needsOnboarding(user.id).catch(() => false)
      return NextResponse.redirect(`${origin}${goToOnboarding ? '/onboarding' : '/admin'}`)
    }

    const reason =
      provider === 'email' ? 'invalid_link' : provider === 'google' ? 'google' : 'auth'

    return redirectToLogin(origin, { reason, provider })
  }

  const supabase = await createClient()
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    const reason = inferLoginErrorReason({
      error: exchangeError?.message ?? error,
      errorDescription,
      provider,
    })

    return redirectToLogin(origin, { reason, provider })
  }

  try {
    await ensureAndMeasureSignup(data.user, '/auth/callback')
  } catch {
    // Non-blocking
  }

  const goToOnboarding = await needsOnboarding(data.user.id).catch(() => false)
  if (goToOnboarding) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  const destination = sanitizeInternalRedirect(searchParams.get('next'))

  return NextResponse.redirect(`${origin}${destination}`)
}
