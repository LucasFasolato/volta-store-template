'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  // Unique key per line: productId for simple products,
  // productId + sorted option hash for items with options.
  cartItemKey: string
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  selectedOptions?: Record<string, string>
}

/**
 * Build a stable cart item key from productId + selected options.
 * Products without options use productId alone.
 */
export function buildCartItemKey(
  productId: string,
  selectedOptions?: Record<string, string>,
): string {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) return productId
  const hash = Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|')
  return `${productId}:${hash}`
}

type CartState = {
  storeSlug: string | null
  items: CartItem[]
  isOpen: boolean
}

type CartActions = {
  setStoreSlug: (slug: string) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (cartItemKey: string) => void
  updateQuantity: (cartItemKey: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      storeSlug: null,
      items: [],
      isOpen: false,

      setStoreSlug: (slug) => {
        const current = get().storeSlug
        if (current && current !== slug) {
          set({ storeSlug: slug, items: [] })
        } else {
          set({ storeSlug: slug })
        }
      },

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.cartItemKey === item.cartItemKey)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartItemKey === item.cartItemKey
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (cartItemKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemKey !== cartItemKey),
        }))
      },

      updateQuantity: (cartItemKey, quantity) => {
        if (quantity < 1) {
          get().removeItem(cartItemKey)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemKey === cartItemKey ? { ...i, quantity } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'volta-cart',
      version: 2,
      // Migrate old persisted data (v0/v1) that lacks cartItemKey
      migrate: (persistedState, version) => {
        if (version < 2) {
          const old = persistedState as { storeSlug?: string | null; items?: Array<{ productId: string; cartItemKey?: string; [key: string]: unknown }> }
          return {
            storeSlug: old.storeSlug ?? null,
            items: (old.items ?? []).map((item) => ({
              ...item,
              cartItemKey: item.cartItemKey ?? item.productId,
            })),
          }
        }
        return persistedState as CartState & CartActions
      },
      partialize: (state) => ({
        storeSlug: state.storeSlug,
        items: state.items,
      }),
    },
  ),
)
