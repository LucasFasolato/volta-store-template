'use client'

import { ShoppingBag } from 'lucide-react'
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
        className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between rounded-full px-5 py-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition active:scale-[0.99]"
        style={{
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--store-bg) 82%, white 18%), color-mix(in srgb, var(--store-bg) 90%, var(--store-text) 10%))',
          border: '1px solid var(--store-border)',
          backdropFilter: 'blur(14px)',
        }}
        aria-label="Abrir carrito"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)' }}
          >
            <ShoppingBag className="size-4" style={{ color: 'var(--store-primary)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </p>
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--store-text) 62%, transparent)' }}>
              Ver detalle y continuar
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--store-text) 52%, transparent)' }}>
            Total
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--store-primary)' }}>
            {formatCurrency(subtotal)}
          </p>
        </div>
      </button>
    </div>
  )
}
