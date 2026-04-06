import { NextResponse } from 'next/server'
import { ensureOnboarding } from '@/lib/actions/onboarding'
import { inferLoginErrorReason } from '@/lib/auth/login-feedback'
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      try {
        await ensureOnboarding(user)
      } catch {
        // Non-blocking
      }

      return NextResponse.redirect(`${origin}/admin`)
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
    await ensureOnboarding(data.user)
  } catch {
    // Non-blocking
  }

  const next = searchParams.get('next') ?? ''
  const destination = next.startsWith('/') && !next.startsWith('//') ? next : '/admin'

  return NextResponse.redirect(`${origin}${destination}`)
}
