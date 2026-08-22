import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PRODUCTION_APEX_HOST = 'voltastore.app'
const PRODUCTION_CANONICAL_HOST = 'www.voltastore.app'

export async function proxy(request: NextRequest) {
  // Keep authentication and Mercado Pago returns on one canonical host. Supabase
  // session cookies are host-bound, so letting users sign in on the apex while
  // Mercado Pago returns to www can make a valid session look missing.
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase()
  if (host === PRODUCTION_APEX_HOST) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = PRODUCTION_CANONICAL_HOST
    url.port = ''
    return NextResponse.redirect(url, 308)
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt, public assets
     * - auth/callback (route handler manages its own session exchange)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
