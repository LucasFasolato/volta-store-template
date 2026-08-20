import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  getMercadoPagoAuthorizedPayment,
  getMercadoPagoSubscription,
  getMercadoPagoWebhookSecret,
} from '@/lib/billing/mercado-pago'
import { recordAuthorizedPayment, syncProviderSubscription } from '@/lib/billing/service'

export type MercadoPagoWebhookBody = {
  type?: string
  action?: string
  data?: { id?: string | number | null } | null
}

export function validateMercadoPagoWebhookSignature(input: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}) {
  const secret = getMercadoPagoWebhookSecret()
  if (!secret || !input.xSignature || !input.xRequestId || !input.dataId) return false

  const parts = Object.fromEntries(
    input.xSignature.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, rest.join('=')]
    }),
  )
  const ts = parts.ts
  const receivedHash = parts.v1
  if (!ts || !receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) return false

  const manifest = `id:${input.dataId};request-id:${input.xRequestId};ts:${ts};`
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex')
  const expectedBuffer = Buffer.from(expectedHash, 'hex')
  const receivedBuffer = Buffer.from(receivedHash, 'hex')
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer)
}

export async function processMercadoPagoWebhook(type: string | undefined, dataId: string) {
  if (type === 'subscription_preapproval') {
    const subscription = await getMercadoPagoSubscription(dataId)
    await syncProviderSubscription(subscription)
    return
  }

  if (type === 'subscription_authorized_payment') {
    const invoice = await getMercadoPagoAuthorizedPayment(dataId)
    await recordAuthorizedPayment(invoice)
  }
}
