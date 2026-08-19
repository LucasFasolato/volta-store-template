'use client'

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import { loadLastOrder, type LastOrder } from '@/lib/cart/last-order'
import { buildCartItemKey, useCartStore } from '@/lib/stores/cart'
import type { RepeatableProduct } from '@/types/store'

export function RepeatOrderBar({ storeSlug, products }: { storeSlug: string; products: RepeatableProduct[] }) {
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const openCart = useCartStore((state) => state.openCart)
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  useEffect(() => {
    setLastOrder(loadLastOrder(storeSlug))
    setDismissed(false)

    function handleLastOrderUpdated(event: Event) {
      const detail = (event as CustomEvent<{ storeSlug?: string }>).detail
      if (detail?.storeSlug === storeSlug) setLastOrder(loadLastOrder(storeSlug))
    }

    window.addEventListener('volta:last-order-updated', handleLastOrderUpdated)
    return () => window.removeEventListener('volta:last-order-updated', handleLastOrderUpdated)
  }, [storeSlug])

  if (!lastOrder || dismissed || items.length > 0) return null
  const repeatableCount = lastOrder.items.filter((item) => productMap.has(item.productId)).length
  if (repeatableCount === 0) return null

  function repeatOrder() {
    if (!lastOrder) return
    let added = 0
    let skipped = 0

    for (const saved of lastOrder.items) {
      const product = productMap.get(saved.productId)
      if (!product) {
        skipped += 1
        continue
      }

      const selectedOptions = resolveCurrentOptions(product, saved.selectedOptions)
      if (selectedOptions === null) {
        skipped += 1
        continue
      }

      const cartItemKey = buildCartItemKey(product.id, selectedOptions)
      addItem({ cartItemKey, productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, selectedOptions })
      if (saved.quantity > 1) updateQuantity(cartItemKey, saved.quantity)
      added += 1
    }

    if (added === 0) {
      toast.message('Tu último pedido cambió. Elegí los productos nuevamente.')
      setDismissed(true)
      return
    }

    if (skipped > 0) toast.message(`Agregamos ${added}. ${skipped} ${skipped === 1 ? 'producto cambió' : 'productos cambiaron'} y quedó afuera.`)
    else toast.success('Tu último pedido volvió al carrito.')
    openCart()
  }

  return (
    <div className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-[34rem] sm:inset-x-auto sm:left-1/2 sm:w-[34rem] sm:-translate-x-1/2">
      <div className="flex items-center gap-3 rounded-[calc(var(--store-button-radius)+4px)] border p-2.5 pl-3.5 backdrop-blur-xl" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-surface) 94%, transparent)', boxShadow: 'var(--store-shadow)' }}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: 'color-mix(in srgb, var(--store-primary) 12%, transparent)', color: 'var(--store-primary)' }}><RotateCcw className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>¿Repetir tu último pedido?</p>
          <p className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--store-muted-text)' }}>{repeatableCount} {repeatableCount === 1 ? 'producto disponible' : 'productos disponibles'} hoy.</p>
        </div>
        <button type="button" onClick={repeatOrder} className="store-button min-h-10 shrink-0 px-3 text-xs font-semibold" style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}>Repetir</button>
        <button type="button" onClick={() => setDismissed(true)} className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ color: 'var(--store-muted-text)' }} aria-label="Ocultar"><X className="size-4" /></button>
      </div>
    </div>
  )
}

function resolveCurrentOptions(product: RepeatableProduct, saved?: Record<string, string>) {
  if (product.options.length === 0) return undefined
  const selected: Record<string, string> = {}
  for (const option of product.options) {
    const value = saved?.[option.name]
    if (!value || !option.values.includes(value)) return null
    selected[option.name] = value
  }
  return selected
}
