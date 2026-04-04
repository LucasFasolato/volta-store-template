import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureOnboarding } from '@/lib/actions/onboarding'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const message = errorDescription ? `?error=${encodeURIComponent(errorDescription)}` : '?error=auth'
    return NextResponse.redirect(`${origin}/login${message}`)
  }

  const supabase = await createClient()

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      try {
        await ensureOnboarding(data.user)
      } catch {
        // Non-blocking — log in production
      }
      return NextResponse.redirect(`${origin}/admin`)
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    try {
      await ensureOnboarding(user)
    } catch {
      // Non-blocking — log in production
    }
    return NextResponse.redirect(`${origin}/admin`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
