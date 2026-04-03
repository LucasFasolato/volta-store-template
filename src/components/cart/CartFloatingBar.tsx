'use client'

import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'

export function CartFloatingBar() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const subtotal = useCartStore((state) => state.getSubtotal())
  const toggleCart = useCartStore((state) => state.toggleCart)

  if (itemCount === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:hidden">
      <button
        type="button"
        onClick={toggleCart}
        className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 text-left transition active:scale-[0.99]"
        style={{
          borderRadius: 'calc(var(--store-card-radius) * 0.78)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 90%, white 10%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
          border: '1px solid var(--store-card-border)',
          boxShadow: 'var(--store-shadow)',
          backdropFilter: 'blur(calc(var(--store-card-blur) + 8px))',
        }}
        aria-label="Abrir carrito"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-11 items-center justify-center"
            style={{
              borderRadius: 'var(--store-button-radius)',
              background:
                'linear-gradient(145deg, color-mix(in srgb, var(--store-primary) 18%, transparent), color-mix(in srgb, var(--store-accent) 14%, transparent))',
            }}
          >
            <ShoppingBag className="size-4" style={{ color: 'var(--store-primary)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </p>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
              Revisar pedido
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
              Total
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--store-primary)' }}>
              {formatCurrency(subtotal)}
            </p>
          </div>
          <div
            className="flex size-9 items-center justify-center"
            style={{
              borderRadius: 'var(--store-button-radius)',
              backgroundColor: 'color-mix(in srgb, var(--store-surface) 80%, transparent)',
              color: 'var(--store-text)',
            }}
          >
            <ArrowUpRight className="size-4" />
          </div>
        </div>
      </button>
    </div>
  )
}
