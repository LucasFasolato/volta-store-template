import type { CartItem } from '@/lib/stores/cart'

type CartItemLike = Pick<CartItem, 'name' | 'price' | 'quantity' | 'selectedOptions'>

export function getCartItemOptionEntries(selectedOptions?: Record<string, string>) {
  return Object.entries(selectedOptions ?? {})
}

export function getCartItemDisplayName(item: Pick<CartItemLike, 'name' | 'selectedOptions'>) {
  const optionValues = getCartItemOptionEntries(item.selectedOptions).map(([, value]) => value)

  if (optionValues.length === 0) return item.name

  const suffix = ` (${optionValues.join(' / ')})`
  return item.name.endsWith(suffix) ? item.name.slice(0, -suffix.length) : item.name
}

export function getCartItemLineTotal(item: Pick<CartItemLike, 'price' | 'quantity'>) {
  return item.price * item.quantity
}

export function getCartSummary(items: Array<Pick<CartItemLike, 'price' | 'quantity'>>) {
  return items.reduce(
    (summary, item) => ({
      subtotal: summary.subtotal + item.price * item.quantity,
      totalItems: summary.totalItems + item.quantity,
    }),
    { subtotal: 0, totalItems: 0 },
  )
}

export function formatCartItemOptionsInline(selectedOptions?: Record<string, string>) {
  const entries = getCartItemOptionEntries(selectedOptions)

  if (entries.length === 0) return null

  return entries.map(([name, value]) => `${name}: ${value}`).join(' | ')
}
