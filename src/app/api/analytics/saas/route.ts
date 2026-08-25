import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const eventSchema = z.object({
  event_type: z.enum([
    'landing_view',
    'landing_primary_cta_click',
    'landing_real_store_click',
    'landing_pricing_view',
    'landing_free_cta_click',
    'landing_volta_cta_click',
    'landing_pro_cta_click',
    'signup_started',
  ]),
  session_id: z.string().min(8).max(120).regex(/^[a-zA-Z0-9-]+$/),
  traffic_source: z.string().max(64).regex(/^[a-z0-9][a-z0-9_-]{0,63}$/).nullable().optional(),
  campaign: z.string().max(80).regex(/^[a-z0-9][a-z0-9_-]{0,79}$/).nullable().optional(),
  device: z.enum(['mobile', 'tablet', 'desktop']).nullable().optional(),
  viewport_width: z.number().int().min(240).max(10000).nullable().optional(),
  viewport_height: z.number().int().min(240).max(10000).nullable().optional(),
  cta_location: z.string().trim().min(1).max(64).nullable().optional(),
  plan: z.enum(['free', 'volta', 'pro']).nullable().optional(),
  path: z.string().trim().min(1).max(160).nullable().optional(),
})

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const parsed = eventSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const supabase = await createAdminClient()
  // This table was reconciled into migration history in STORE-INIT-002; generated
  // Database types have not been refreshed yet. Keep the privileged boundary local.
  const events = supabase.from('saas_funnel_events' as never) as any
  const { error } = await events.insert(parsed.data)

  if (error) {
    console.error('Failed to record SaaS funnel event.', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 202 })
}
