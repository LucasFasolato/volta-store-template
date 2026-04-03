'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

type CartState = {
  storeSlug: string | null
  items: CartItem[]
  isOpen: boolean
}

type CartActions = {
  setStoreSlug: (slug: string) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
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
        // Clear cart when switching stores
        if (current && current !== slug) {
          set({ storeSlug: slug, items: [] })
        } else {
          set({ storeSlug: slug })
        }
      },

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
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
      partialize: (state) => ({
        storeSlug: state.storeSlug,
        items: state.items,
      }),
    },
  ),
)
