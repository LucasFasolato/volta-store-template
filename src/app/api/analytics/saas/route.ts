import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  CLIENT_SAAS_FUNNEL_EVENT_TYPES,
  SAAS_CAMPAIGN_MAX_LENGTH,
  SAAS_SESSION_MAX_LENGTH,
  SAAS_SOURCE_MAX_LENGTH,
} from '@/lib/analytics/saas-contract'
import { getOwnerStoreIdentity } from '@/lib/server/store-context'
import { safeGetUser } from '@/lib/supabase/auth'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const eventSchema = z.object({
  event_type: z.enum(CLIENT_SAAS_FUNNEL_EVENT_TYPES),
  session_id: z.string().min(8).max(SAAS_SESSION_MAX_LENGTH).regex(/^[a-zA-Z0-9-]+$/),
  traffic_source: z
    .string()
    .max(SAAS_SOURCE_MAX_LENGTH)
    .regex(/^[a-z0-9][a-z0-9_-]{0,63}$/)
    .nullable()
    .optional(),
  campaign: z
    .string()
    .max(SAAS_CAMPAIGN_MAX_LENGTH)
    .regex(/^[a-z0-9][a-z0-9_-]{0,79}$/)
    .nullable()
    .optional(),
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

  let userId: string | null = null
  let storeId: string | null = null

  // first_share is an authenticated merchant milestone. The browser can tell us
  // that the share action happened, but tenant identity is always derived here.
  if (parsed.data.event_type === 'first_share') {
    const sessionClient = await createClient()
    const { user } = await safeGetUser(sessionClient)
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })

    const store = await getOwnerStoreIdentity(user.id, sessionClient)
    if (!store) return NextResponse.json({ ok: false }, { status: 409 })

    userId = user.id
    storeId = store.id
  }

  const supabase = await createAdminClient()
  // Generated Database types are refreshed after the STORE-INIT-004 migration.
  const events = supabase.from('saas_funnel_events' as never) as any
  const { error } = await events.insert({
    ...parsed.data,
    user_id: userId,
    store_id: storeId,
  })

  // First milestones are protected by partial unique indexes. A retry is a
  // successful no-op, not an analytics failure.
  if (error?.code === '23505') {
    return NextResponse.json({ ok: true, duplicate: true }, { status: 202 })
  }

  if (error) {
    console.error('Failed to record SaaS funnel event.', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 202 })
}
