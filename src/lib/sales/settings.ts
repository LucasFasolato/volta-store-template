import type { FulfillmentMethod, PaymentMethod, SalesSettings, Store } from '@/types/store'

export const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'transfer', label: 'Transferencia' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'mercado_pago', label: 'Mercado Pago' },
  { value: 'arrange', label: 'A convenir' },
]

export const FULFILLMENT_METHOD_OPTIONS: Array<{ value: FulfillmentMethod; label: string }> = [
  { value: 'pickup', label: 'Retiro' },
  { value: 'delivery', label: 'Envío' },
]

const allowedPayments = new Set(PAYMENT_METHOD_OPTIONS.map((item) => item.value))
const allowedFulfillment = new Set(FULFILLMENT_METHOD_OPTIONS.map((item) => item.value))

export function normalizeSalesSettings(store: Store): SalesSettings {
  const paymentMethods = Array.isArray(store.payment_methods)
    ? store.payment_methods.filter((method): method is PaymentMethod => allowedPayments.has(method as PaymentMethod))
    : []
  const fulfillmentMethods = Array.isArray(store.fulfillment_methods)
    ? store.fulfillment_methods.filter((method): method is FulfillmentMethod => allowedFulfillment.has(method as FulfillmentMethod))
    : []

  return {
    paymentMethods: paymentMethods.length ? paymentMethods : ['arrange'],
    fulfillmentMethods: fulfillmentMethods.length ? fulfillmentMethods : ['pickup', 'delivery'],
    deliveryArea: cleanText(store.delivery_area) ?? 'Envíos a coordinar',
    minimumOrderAmount: normalizeAmount(store.minimum_order_amount),
    deliveryNotes: cleanText(store.delivery_notes),
  }
}

export function paymentMethodsLabel(methods: PaymentMethod[]) {
  return methods.map((method) => PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)?.label).filter(Boolean).join(' · ')
}

export function fulfillmentMethodsLabel(methods: FulfillmentMethod[]) {
  const pickup = methods.includes('pickup')
  const delivery = methods.includes('delivery')
  if (pickup && delivery) return 'Retiro o envío'
  if (delivery) return 'Envío'
  return 'Retiro'
}

export function storeOffersDelivery(methods: FulfillmentMethod[]) {
  return methods.includes('delivery')
}

function cleanText(value: unknown) {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized || null
}

function normalizeAmount(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}
