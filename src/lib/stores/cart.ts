'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { trackStoreEvent } from '@/lib/analytics/store-events'

export type CartItem = {
  cartItemKey: string
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  selectedOptions?: Record<string, string>
}

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
  storeId: string | null
  items: CartItem[]
  isOpen: boolean
}

type CartActions = {
  setStoreContext: (slug: string, storeId: string) => void
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

export type CartStore = CartState & CartActions

export function selectCartItemCount(state: CartStore) {
  return state.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function selectCartSubtotal(state: CartStore) {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      storeSlug: null,
      storeId: null,
      items: [],
      isOpen: false,

      setStoreContext: (slug, storeId) => {
        const current = get().storeSlug
        if (current && current !== slug) {
          set({ storeSlug: slug, storeId, items: [] })
        } else {
          set({ storeSlug: slug, storeId })
        }
      },

      setStoreSlug: (slug) => {
        const current = get().storeSlug
        if (current && current !== slug) {
          set({ storeSlug: slug, items: [] })
        } else {
          set({ storeSlug: slug })
        }
      },

      addItem: (item) => {
        const existingBeforeAdd = get().items.some((i) => i.cartItemKey === item.cartItemKey)
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

        const storeId = get().storeId
        if (!existingBeforeAdd && storeId) {
          trackStoreEvent({ storeId, type: 'add_to_cart', productId: item.productId })
        }
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

      getItemCount: () => selectCartItemCount(get()),
      getSubtotal: () => selectCartSubtotal(get()),
    }),
    {
      name: 'volta-cart',
      version: 3,
      migrate: (persistedState, version) => {
        const old = persistedState as {
          storeSlug?: string | null
          storeId?: string | null
          items?: Array<{ productId: string; cartItemKey?: string; [key: string]: unknown }>
        }

        if (version < 2) {
          return {
            storeSlug: old.storeSlug ?? null,
            storeId: old.storeId ?? null,
            items: (old.items ?? []).map((item) => ({
              ...item,
              cartItemKey: item.cartItemKey ?? item.productId,
            })),
          }
        }

        if (version < 3) {
          return {
            ...old,
            storeId: old.storeId ?? null,
          }
        }

        return persistedState as CartStore
      },
      partialize: (state) => ({
        storeSlug: state.storeSlug,
        storeId: state.storeId,
        items: state.items,
      }),
    },
  ),
)
