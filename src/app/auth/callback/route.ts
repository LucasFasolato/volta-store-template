import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureOnboarding } from '@/lib/actions/onboarding'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
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

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
