'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { COPY } from '@/data/system-copy'
import { useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp/builder'

type CartSheetProps = {
  whatsapp: string
  storeName: string
}

export function CartSheet({ whatsapp, storeName }: CartSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const closeCart = useCartStore((state) => state.closeCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getSubtotal = useCartStore((state) => state.getSubtotal)

  const subtotal = getSubtotal()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeCart()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeCart, isOpen])

  function handleCheckout() {
    if (!whatsapp || items.length === 0) return
    const url = buildWhatsAppUrl(whatsapp, items)
    window.open(url, '_blank', 'noopener,noreferrer')
    closeCart()
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            onClick={closeCart}
            aria-label="Cerrar carrito"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 90%, white 10%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
              borderLeft: '1px solid var(--store-border)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--store-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-5" style={{ color: 'var(--store-text)' }} />
                  <h2 id="cart-title" className="text-lg font-semibold" style={{ color: 'var(--store-text)' }}>
                    {COPY.cart.title}
                  </h2>
                  {itemCount > 0 ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                        color: 'var(--store-primary)',
                      }}
                    >
                      {itemCount}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--store-text) 52%, transparent)' }}>
                  Pedido para {storeName}
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeCart}
                className="flex size-9 items-center justify-center rounded-full transition hover:bg-black/5"
                style={{ color: 'var(--store-text)' }}
                aria-label="Cerrar carrito"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title={COPY.cart.empty}
                  description={COPY.cart.emptyDescription}
                  action={
                    <button
                      type="button"
                      onClick={closeCart}
                      className="rounded-full px-5 py-3 text-sm font-semibold transition hover:opacity-95"
                      style={{
                        background:
                          'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                        color: 'var(--store-bg)',
                      }}
                    >
                      {COPY.cart.continueShopping}
                    </button>
                  }
                  className="border-0 bg-transparent px-4 py-10 shadow-none"
                  tone="light"
                />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onUpdateQty={(quantity) => updateQuantity(item.productId, quantity)}
                      onRemove={() => removeItem(item.productId)}
                    />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t px-5 py-5" style={{ borderColor: 'var(--store-border)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--store-text) 50%, transparent)' }}>
                      {COPY.cart.subtotal}
                    </p>
                    <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--store-primary)' }}>
                      {formatCurrency(subtotal)}
                    </p>
                  </div>
                  <p className="text-xs text-right leading-5" style={{ color: 'color-mix(in srgb, var(--store-text) 55%, transparent)' }}>
                    El mensaje incluye productos,
                    <br />
                    cantidades y total estimado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!whatsapp}
                  className="inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                  }}
                >
                  <MessageCircle className="mr-2 size-4" />
                  {COPY.cart.checkout}
                </button>

                {!whatsapp ? (
                  <p className="mt-3 text-center text-xs text-amber-200/80">
                    Configura un numero de WhatsApp en el admin para habilitar pedidos.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-3 w-full text-sm transition hover:opacity-80"
                  style={{ color: 'color-mix(in srgb, var(--store-text) 62%, transparent)' }}
                >
                  {COPY.cart.continueShopping}
                </button>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function CartItem({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: { productId: string; name: string; price: number; quantity: number; imageUrl: string | null }
  onUpdateQty: (quantity: number) => void
  onRemove: () => void
}) {
  return (
    <div
      className="rounded-[24px] border p-3"
      style={{
        borderColor: 'var(--store-border)',
        backgroundColor: 'color-mix(in srgb, var(--store-bg) 82%, white 18%)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="relative size-16 shrink-0 overflow-hidden rounded-[18px]"
          style={{ backgroundColor: 'var(--store-surface-soft)' }}
        >
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-5" style={{ color: 'var(--store-text)' }}>
            {item.name}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--store-primary)' }}>
              {formatCurrency(item.price * item.quantity)}
            </p>
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--store-text) 50%, transparent)' }}>
              {item.quantity} x {formatCurrency(item.price)}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateQty(item.quantity - 1)}
                className="flex size-8 items-center justify-center rounded-full border"
                style={{ borderColor: 'var(--store-border-strong)', color: 'var(--store-text)' }}
                aria-label="Reducir cantidad"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQty(item.quantity + 1)}
                className="flex size-8 items-center justify-center rounded-full border"
                style={{ borderColor: 'var(--store-border-strong)', color: 'var(--store-text)' }}
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-400/10 hover:text-red-300"
              aria-label={COPY.cart.remove}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
