'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { selectCartItemCount, selectCartSubtotal, useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'

export function CartFloatingBar() {
  const itemCount = useCartStore(selectCartItemCount)
  const subtotal = useCartStore(selectCartSubtotal)
  const toggleCart = useCartStore((state) => state.toggleCart)

  return (
    <AnimatePresence>
      {itemCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:hidden">
          <motion.button
            type="button"
            onClick={toggleCart}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="pointer-events-auto mx-auto flex min-h-[64px] w-full max-w-md items-center justify-between gap-3 px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.98]"
            style={{
              borderRadius: 'calc(var(--store-card-radius) * 0.88)',
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 92%, white 8%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
              border: '1px solid var(--store-card-border)',
              boxShadow: 'var(--store-shadow)',
              backdropFilter: 'blur(calc(var(--store-card-blur) + 8px))',
            }}
            aria-label={`Ver pedido: ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}, ${formatCurrency(subtotal)}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="relative flex size-11 shrink-0 items-center justify-center"
                style={{
                  borderRadius: 'var(--store-button-radius)',
                  background:
                    'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                  boxShadow: '0 10px 24px color-mix(in srgb, var(--store-primary) 22%, transparent)',
                }}
              >
                <ShoppingBag className="size-4" style={{ color: 'var(--store-primary-contrast)' }} />
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 550, damping: 20 }}
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--store-text)', color: 'var(--store-bg)' }}
                  >
                    {itemCount}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
                  Ver pedido
                </p>
                <p className="truncate text-xs" style={{ color: 'var(--store-muted-text)' }}>
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'} · {formatCurrency(subtotal)}
                </p>
              </div>
            </div>

            <div
              className="flex size-10 shrink-0 items-center justify-center"
              style={{
                borderRadius: 'var(--store-button-radius)',
                backgroundColor: '#25D366',
                color: '#ffffff',
              }}
            >
              <MessageCircle className="size-4" />
            </div>
          </motion.button>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
