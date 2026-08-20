import 'server-only'

import { VOLTA_BILLING_PLAN } from '@/lib/billing/plan'

const API_BASE = 'https://api.mercadopago.com'
const REQUEST_TIMEOUT_MS = 10000
const EXTERNAL_REFERENCE_PREFIX = 'volta-store:'

export type MercadoPagoSubscription = {
  id: string
  external_reference?: string | number | null
  payer_email?: string | null
  init_point?: string | null
  status?: string | null
  next_payment_date?: string | null
  auto_recurring?: {
    transaction_amount?: number | string | null
    currency_id?: string | null
  } | null
}

type MercadoPagoSubscriptionSearch = {
  paging?: { total?: number; limit?: number; offset?: number }
  results?: MercadoPagoSubscription[]
}

export type MercadoPagoAuthorizedPayment = {
  id: string | number
  preapproval_id: string
  external_reference?: string | number | null
  currency_id?: string | null
  transaction_amount?: number | string | null
  debit_date?: string | null
  date_created?: string | null
  last_modified?: string | null
  status?: string | null
  payment?: {
    id?: string | number | null
    status?: string | null
    status_detail?: string | null
  } | null
}

export class MercadoPagoApiError extends Error {
  status: number
  details: string | null

  constructor(message: string, status: number, details: string | null = null) {
    super(message)
    this.name = 'MercadoPagoApiError'
    this.status = status
    this.details = details
  }
}

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim())
}

export function isMercadoPagoWebhookConfigured() {
  return Boolean(process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim())
}

export function getMercadoPagoWebhookSecret() {
  return process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim() || null
}

export function buildBillingExternalReference(storeId: string) {
  return `${EXTERNAL_REFERENCE_PREFIX}${storeId}`
}

export function parseBillingExternalReference(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith(EXTERNAL_REFERENCE_PREFIX)) return null
  const storeId = value.slice(EXTERNAL_REFERENCE_PREFIX.length)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storeId)
    ? storeId
    : null
}

function getAccessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim()
  if (!token) throw new MercadoPagoApiError('Mercado Pago no está configurado.', 503)
  return token
}

function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://www.voltastore.app').replace(/\/$/, '')
}

async function mercadoPagoRequest<T>(path: string, init: RequestInit = {}, idempotencyKey?: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
        ...(init.headers || {}),
      },
    })

    const raw = await response.text()
    let parsed: unknown = null
    if (raw) {
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = null
      }
    }

    if (!response.ok) {
      const details = parsed && typeof parsed === 'object'
        ? JSON.stringify(parsed).slice(0, 800)
        : raw.slice(0, 800) || null
      throw new MercadoPagoApiError(
        `Mercado Pago respondió con estado ${response.status}.`,
        response.status,
        details,
      )
    }

    return parsed as T
  } catch (error) {
    if (error instanceof MercadoPagoApiError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new MercadoPagoApiError('Mercado Pago demoró demasiado en responder.', 504)
    }
    throw new MercadoPagoApiError('No pudimos comunicarnos con Mercado Pago.', 502)
  } finally {
    clearTimeout(timeout)
  }
}

export async function findMercadoPagoStoreSubscription(input: {
  storeId: string
  payerEmail: string
}) {
  const externalReference = buildBillingExternalReference(input.storeId)
  const params = new URLSearchParams({
    payer_email: input.payerEmail,
    q: externalReference,
    limit: '20',
    offset: '0',
  })
  const search = await mercadoPagoRequest<MercadoPagoSubscriptionSearch>(`/preapproval/search?${params.toString()}`)
  const matches = (search.results || []).filter((subscription) =>
    String(subscription.external_reference || '') === externalReference && subscription.status !== 'canceled',
  )
  const priority: Record<string, number> = { authorized: 0, pending: 1, paused: 2 }
  matches.sort((a, b) => (priority[a.status || ''] ?? 9) - (priority[b.status || ''] ?? 9))
  return matches[0] || null
}

export async function createMercadoPagoSubscription(input: {
  storeId: string
  payerEmail: string
  idempotencyKey: string
}) {
  return mercadoPagoRequest<MercadoPagoSubscription>(
    '/preapproval',
    {
      method: 'POST',
      body: JSON.stringify({
        reason: 'VOLTA Store - suscripción mensual',
        external_reference: buildBillingExternalReference(input.storeId),
        payer_email: input.payerEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: VOLTA_BILLING_PLAN.introAmount,
          currency_id: VOLTA_BILLING_PLAN.currency,
        },
        back_url: `${getAppBaseUrl()}/admin/plan?billing=return`,
        status: 'pending',
      }),
    },
    input.idempotencyKey,
  )
}

export async function getMercadoPagoSubscription(subscriptionId: string) {
  return mercadoPagoRequest<MercadoPagoSubscription>(`/preapproval/${encodeURIComponent(subscriptionId)}`)
}

export async function cancelMercadoPagoSubscription(subscriptionId: string) {
  return mercadoPagoRequest<MercadoPagoSubscription>(`/preapproval/${encodeURIComponent(subscriptionId)}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'canceled' }),
  })
}

export async function updateMercadoPagoSubscriptionAmount(subscriptionId: string, amount: number) {
  return mercadoPagoRequest<MercadoPagoSubscription>(`/preapproval/${encodeURIComponent(subscriptionId)}`, {
    method: 'PUT',
    body: JSON.stringify({
      auto_recurring: {
        transaction_amount: amount,
        currency_id: VOLTA_BILLING_PLAN.currency,
      },
    }),
  })
}

export async function getMercadoPagoAuthorizedPayment(invoiceId: string) {
  return mercadoPagoRequest<MercadoPagoAuthorizedPayment>(
    `/authorized_payments/${encodeURIComponent(invoiceId)}`,
  )
}
