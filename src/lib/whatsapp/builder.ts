import { COPY } from '@/data/system-copy'
import {
  formatCartItemOptionsInline,
  getCartItemDisplayName,
  getCartItemLineTotal,
  getCartSummary,
} from '@/lib/cart/summary'
import { formatCurrency } from '@/lib/utils/format'

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
}

export function buildWhatsAppMessage(items: CartItem[], details: CheckoutDetails = {}): string {
  const { subtotal } = getCartSummary(items)
  const lines: string[] = [COPY.checkout.greeting, '', `*${COPY.checkout.orderLabel}*`]

  items.forEach((item) => {
    const displayName = getCartItemDisplayName(item)
    const optionLine = formatCartItemOptionsInline(item.selectedOptions)
    const lineTotal = formatCurrency(getCartItemLineTotal(item))

    lines.push(`- ${item.quantity} x ${displayName}`)

    if (optionLine) {
      lines.push(`  ${optionLine}`)
    }

    lines.push(`  Subtotal: ${lineTotal}`)
  })

  lines.push('')
  lines.push(`*Total estimado:* ${formatCurrency(subtotal)}`)

  const customerName = details.customerName?.trim()
  const notes = details.notes?.trim()
  const fulfillment = details.fulfillment === 'pickup'
    ? 'Retiro'
    : details.fulfillment === 'delivery'
      ? 'Envío'
      : null

  if (customerName || fulfillment || notes) {
    lines.push('')
    lines.push(`*${COPY.checkout.dataLabel}*`)
    if (customerName) lines.push(`- Nombre: ${customerName}`)
    if (fulfillment) lines.push(`- Entrega: ${fulfillment}`)
    if (notes) lines.push(`- Aclaraciones: ${notes}`)
  }

  lines.push('')
  lines.push(COPY.checkout.closing)

  return lines.join('\n')
}

export function buildWhatsAppUrl(
  whatsapp: string,
  items: CartItem[],
  details: CheckoutDetails = {},
): string {
  const phone = whatsapp.replace(/\D/g, '')
  const message = buildWhatsAppMessage(items, details)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}
