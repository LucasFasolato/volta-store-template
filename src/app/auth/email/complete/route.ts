import { NextResponse } from 'next/server'
import { ensureOnboarding, needsOnboarding } from '@/lib/actions/onboarding'
import { isLikelyFirstSignup, recordSaasMilestone } from '@/lib/analytics/saas-server'
import { sanitizeInternalRedirect } from '@/lib/auth/redirects'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

function loginError(origin: string) {
  const url = new URL('/login', origin)
  url.searchParams.set('auth', 'error')
  url.searchParams.set('reason', 'callback')
  url.searchParams.set('provider', 'email')
  return NextResponse.redirect(url, { status: 303 })
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const next = sanitizeInternalRedirect(searchParams.get('next'))
  const supabase = await createClient()
  const { user } = await safeGetUser(supabase)

  if (!user) {
    return loginError(origin)
  }

  try {
    const onboarding = await ensureOnboarding(user)
    if (onboarding.storeCreated || isLikelyFirstSignup(user)) {
      await recordSaasMilestone({
        eventType: 'signup_completed',
        userId: user.id,
        storeId: onboarding.storeId,
        path: '/auth/email/complete',
      })
    }
  } catch (error) {
    console.warn('VOLTA onboarding after email verification could not be completed.', error)
  }

  const goToOnboarding = await needsOnboarding(user.id).catch(() => false)
  const destination = goToOnboarding ? '/onboarding' : next

  return NextResponse.redirect(`${origin}${destination}`, { status: 303 })
}
