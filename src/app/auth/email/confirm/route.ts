import { NextResponse } from 'next/server'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

function loginError(origin: string) {
  const url = new URL('/login', origin)
  url.searchParams.set('auth', 'error')
  url.searchParams.set('reason', 'invalid_link')
  url.searchParams.set('provider', 'email')
  return NextResponse.redirect(url, { status: 303 })
}

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/admin'
}

function completionRedirect(origin: string, next: string) {
  const url = new URL('/auth/email/complete', origin)
  url.searchParams.set('next', next)
  return NextResponse.redirect(url, { status: 303 })
}

export async function POST(request: Request) {
  const { origin } = new URL(request.url)
  const formData = await request.formData()
  const tokenHash = formData.get('token_hash')
  const next = safeNext(formData.get('next'))

  if (typeof tokenHash !== 'string' || tokenHash.length < 16) {
    return loginError(origin)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  })

  if (!error && data.user) {
    // Keep this request deliberately short. The successful verify writes the
    // auth cookies; onboarding is completed on the following GET request.
    return completionRedirect(origin, next)
  }

  // A mobile browser can submit the same one-time form twice while the first
  // request is completing. If the first request already established a session,
  // treat the duplicate as success instead of showing an expired-link error.
  const authResult = await safeGetUser(supabase)
  if (authResult.user) {
    return completionRedirect(origin, next)
  }

  console.warn('VOLTA email OTP verification failed.', {
    code: error?.code ?? null,
    status: error?.status ?? null,
    message: error?.message ?? 'Unknown verification failure',
  })

  return loginError(origin)
}
