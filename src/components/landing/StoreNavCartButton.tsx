'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { selectCartItemCount, useCartStore } from '@/lib/stores/cart'

export function StoreNavCartButton() {
  const count = useCartStore(selectCartItemCount)
  const toggleCart = useCartStore((state) => state.toggleCart)

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="store-button relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
      style={{
        background:
          'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
        color: 'var(--store-primary-contrast)',
        boxShadow: '0 14px 34px color-mix(in srgb, var(--store-primary) 22%, transparent)',
      }}
      aria-label="Ver carrito"
    >
      <ShoppingBag className="size-4" />
      <span className="hidden sm:block">Carrito</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 560, damping: 22 }}
            className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--store-primary-contrast) 86%, transparent)',
              color: 'var(--store-primary)',
            }}
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )
}
