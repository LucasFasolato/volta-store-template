import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseAuthCookieName, safeGetUser } from '@/lib/supabase/auth'
import type { Database } from '@/types/database'

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter((cookie) => isSupabaseAuthCookieName(cookie.name))
    .forEach((cookie) => {
      response.cookies.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
      })
    })

  return response
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const pathname = request.nextUrl.pathname
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/onboarding')
  const authResult = await safeGetUser(supabase)
  const user = authResult.user

  if (authResult.error) {
    console.warn('Supabase auth getUser failed in middleware.', authResult.error)
  }

  if (authResult.invalidRefreshToken) {
    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return clearSupabaseAuthCookies(request, NextResponse.redirect(url))
    }

    return clearSupabaseAuthCookies(request, supabaseResponse)
  }

  // Protect /admin and /onboarding routes
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from /login
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
