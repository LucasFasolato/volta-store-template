import { COPY } from '@/data/system-copy'
import {
  formatCartItemOptionsInline,
  getCartItemDisplayName,
  getCartItemLineTotal,
  getCartSummary,
} from '@/lib/cart/summary'
import { formatCurrency } from '@/lib/utils/format'
import type { CheckoutCustomField } from '@/types/store'

export type CartItem = {
  cartItemKey: string
  productId: string
  name: string
  price: number
  quantity: number
  selectedOptions?: Record<string, string>
}

export type CheckoutDetails = {
  customerName?: string
  fulfillment?: 'pickup' | 'delivery'
  notes?: string
  custom?: Record<string, string>
}

export function buildWhatsAppMessage(
  items: CartItem[],
  details: CheckoutDetails = {},
  customFields: CheckoutCustomField[] = [],
): string {
  const { subtotal } = getCartSummary(items)
  const lines: string[] = [COPY.checkout.greeting, '', `*${COPY.checkout.orderLabel}*`]

  items.forEach((item) => {
    const displayName = getCartItemDisplayName(item)
    const optionLine = formatCartItemOptionsInline(item.selectedOptions)
    const lineTotal = formatCurrency(getCartItemLineTotal(item))

    lines.push(`- ${item.quantity} x ${displayName}`)
    if (optionLine) lines.push(`  ${optionLine}`)
    lines.push(`  Subtotal: ${lineTotal}`)
  })

  lines.push('')
  lines.push(`*Total estimado:* ${formatCurrency(subtotal)}`)

  const customerName = details.customerName?.trim()
  const notes = details.notes?.trim()
  const fulfillment = details.fulfillment === 'pickup' ? 'Retiro' : details.fulfillment === 'delivery' ? 'Envío' : null
  const customAnswers = customFields
    .filter((field) => field.is_enabled)
    .map((field) => ({ field, value: details.custom?.[field.id]?.trim() }))
    .filter((entry) => entry.value)

  if (customerName || fulfillment || notes || customAnswers.length > 0) {
    lines.push('')
    lines.push(`*${COPY.checkout.dataLabel}*`)
    if (customerName) lines.push(`- Nombre: ${customerName}`)
    if (fulfillment) lines.push(`- Entrega: ${fulfillment}`)
    if (notes) lines.push(`- Aclaraciones: ${notes}`)
    customAnswers.forEach(({ field, value }) => lines.push(`- ${field.label}: ${value}`))
  }

  lines.push('')
  lines.push(COPY.checkout.closing)
  return lines.join('\n')
}

export function buildWhatsAppUrl(
  whatsapp: string,
  items: CartItem[],
  details: CheckoutDetails = {},
  customFields: CheckoutCustomField[] = [],
): string {
  const phone = whatsapp.replace(/\D/g, '')
  const message = buildWhatsAppMessage(items, details, customFields)
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
