import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureOnboarding } from '@/lib/actions/onboarding'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // OAuth error from provider
  if (error) {
    const message = errorDescription
      ? `?error=${encodeURIComponent(errorDescription)}`
      : '?error=auth'
    return NextResponse.redirect(`${origin}/login${message}`)
  }

  if (!code) {
    // No code — check if already has a session (e.g. magic link already set cookies)
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

    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const supabase = await createClient()
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  try {
    await ensureOnboarding(data.user)
  } catch {
    // Non-blocking — profile/store creation failure shouldn't block login
  }

  // Honour ?next= if it's a safe internal path
  const next = searchParams.get('next') ?? ''
  const destination = next.startsWith('/') && !next.startsWith('//') ? next : '/admin'

  return NextResponse.redirect(`${origin}${destination}`)
}
