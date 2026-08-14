import { NextResponse } from 'next/server'
import { ensureOnboarding, needsOnboarding } from '@/lib/actions/onboarding'
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

  if (error || !data.user) {
    return loginError(origin)
  }

  try {
    await ensureOnboarding(data.user)
  } catch {
    // Onboarding is idempotent and the protected admin layout can retry it.
  }

  const goToOnboarding = await needsOnboarding(data.user.id).catch(() => false)
  const destination = goToOnboarding ? '/onboarding' : next

  return NextResponse.redirect(`${origin}${destination}`, { status: 303 })
}
