import type { CartItem } from '@/lib/stores/cart'

export type LastOrderItem = {
  productId: string
  quantity: number
  selectedOptions?: Record<string, string>
}

export type LastOrder = {
  version: 1
  storeSlug: string
  createdAt: string
  items: LastOrderItem[]
}

function storageKey(storeSlug: string) {
  return `volta-last-order:${storeSlug}`
}

export function saveLastOrder(storeSlug: string, items: CartItem[]) {
  if (typeof window === 'undefined' || items.length === 0) return
  const payload: LastOrder = {
    version: 1,
    storeSlug,
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({
      productId: item.productId,
      quantity: Math.max(1, Math.min(99, item.quantity)),
      selectedOptions: item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? item.selectedOptions : undefined,
    })),
  }
  try {
    window.localStorage.setItem(storageKey(storeSlug), JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent('volta:last-order-updated', { detail: { storeSlug } }))
  } catch {
    // Browsers may block localStorage. Reorder is optional, checkout must still work.
  }
}

export function loadLastOrder(storeSlug: string): LastOrder | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(storeSlug))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LastOrder>
    if (parsed.version !== 1 || parsed.storeSlug !== storeSlug || !Array.isArray(parsed.items)) return null
    const items = parsed.items
      .filter((item): item is LastOrderItem => Boolean(item && typeof item.productId === 'string' && typeof item.quantity === 'number'))
      .map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, Math.min(99, Math.floor(item.quantity))),
        selectedOptions: item.selectedOptions && typeof item.selectedOptions === 'object' ? item.selectedOptions : undefined,
      }))
    if (items.length === 0) return null
    return {
      version: 1,
      storeSlug,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
      items,
    }
  } catch {
    return null
  }
}
