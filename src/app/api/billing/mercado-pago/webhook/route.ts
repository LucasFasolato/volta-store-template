import { NextRequest, NextResponse } from 'next/server'
import {
  processMercadoPagoWebhook,
  validateMercadoPagoWebhookSignature,
  type MercadoPagoWebhookBody,
} from '@/lib/billing/webhook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: MercadoPagoWebhookBody
  try {
    body = await request.json() as MercadoPagoWebhookBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const queryDataId = request.nextUrl.searchParams.get('data.id')
  const bodyDataId = body.data?.id == null ? null : String(body.data.id)
  const dataId = queryDataId || bodyDataId

  const validSignature = validateMercadoPagoWebhookSignature({
    xSignature: request.headers.get('x-signature'),
    xRequestId: request.headers.get('x-request-id'),
    dataId: queryDataId,
  })

  if (!validSignature || !dataId) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    await processMercadoPagoWebhook(body.type, dataId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mercado Pago billing webhook failed.', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
