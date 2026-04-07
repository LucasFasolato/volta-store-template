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

export function buildWhatsAppMessage(items: CartItem[]): string {
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
  lines.push('')
  lines.push(`*${COPY.checkout.dataLabel}*`)
  lines.push(COPY.checkout.nameField)
  lines.push(COPY.checkout.phoneField)
  lines.push(COPY.checkout.addressField)
  lines.push(COPY.checkout.notesField)
  lines.push('')
  lines.push(COPY.checkout.closing)

  return lines.join('\n')
}

export function buildWhatsAppUrl(whatsapp: string, items: CartItem[]): string {
  const phone = whatsapp.replace(/\D/g, '')
  const message = buildWhatsAppMessage(items)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}
