import { COPY } from '@/data/system-copy'
import { formatCurrency } from '@/lib/utils/format'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

/**
 * Build the WhatsApp order message.
 */
export function buildWhatsAppMessage(items: CartItem[]): string {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const lines: string[] = [COPY.checkout.greeting, '', COPY.checkout.orderLabel]

  items.forEach((item, index) => {
    const lineTotal = formatCurrency(item.price * item.quantity)
    lines.push(`${index + 1}. ${item.name}`)
    lines.push(`   ${item.quantity} x ${formatCurrency(item.price)} = ${lineTotal}`)
  })

  lines.push('')
  lines.push(`Resumen: ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`)
  lines.push(`Total estimado: ${formatCurrency(subtotal)}`)
  lines.push('')
  lines.push(COPY.checkout.dataLabel)
  lines.push(COPY.checkout.nameField)
  lines.push(COPY.checkout.phoneField)
  lines.push(COPY.checkout.addressField)
  lines.push(COPY.checkout.notesField)
  lines.push('')
  lines.push(COPY.checkout.closing)

  return lines.join('\n')
}

/**
 * Build a wa.me URL with the encoded message.
 */
export function buildWhatsAppUrl(whatsapp: string, items: CartItem[]): string {
  const phone = whatsapp.replace(/\D/g, '')
  const message = buildWhatsAppMessage(items)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}
