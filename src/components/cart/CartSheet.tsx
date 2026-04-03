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
            className="fixed inset-0 z-50"
            style={{
              background: 'color-mix(in srgb, var(--store-bg) 34%, black 66%)',
              backdropFilter: 'blur(14px)',
            }}
            onClick={closeCart}
            aria-label="Cerrar carrito"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[27rem] flex-col"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 94%, white 6%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
              borderLeft: '1px solid var(--store-card-border)',
              boxShadow: 'var(--store-shadow)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="flex items-center justify-between border-b px-5 py-5" style={{ borderColor: 'var(--store-card-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex size-10 items-center justify-center"
                    style={{
                      borderRadius: 'var(--store-button-radius)',
                      backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                    }}
                  >
                    <ShoppingBag className="size-4" style={{ color: 'var(--store-primary)' }} />
                  </div>
                  <div>
                    <h2 id="cart-title" className="store-heading text-lg font-semibold" style={{ color: 'var(--store-text)' }}>
                      {COPY.cart.title}
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                      Pedido para {storeName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {itemCount > 0 ? (
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                      color: 'var(--store-primary)',
                    }}
                  >
                    {itemCount}
                  </span>
                ) : null}
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeCart}
                  className="flex size-10 items-center justify-center transition"
                  style={{
                    borderRadius: 'var(--store-button-radius)',
                    color: 'var(--store-text)',
                    backgroundColor: 'color-mix(in srgb, var(--store-surface) 78%, transparent)',
                    border: '1px solid var(--store-card-border)',
                  }}
                  aria-label="Cerrar carrito"
                >
                  <X className="size-4" />
                </button>
              </div>
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
                      className="store-button px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                      style={{
                        background:
                          'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                        color: 'var(--store-bg)',
                      }}
                    >
                      {COPY.cart.continueShopping}
                    </button>
                  }
                  className="border-0 bg-transparent px-4 py-12 shadow-none"
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
              <div className="border-t px-5 py-5" style={{ borderColor: 'var(--store-card-border)' }}>
                <div
                  className="rounded-[calc(var(--store-card-radius)*0.72)] p-4"
                  style={{
                    background: 'var(--store-card-background)',
                    border: '1px solid var(--store-card-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                        {COPY.cart.subtotal}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: 'var(--store-primary)' }}>
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                    <p className="max-w-[11rem] text-right text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>
                      El mensaje sale ordenado con productos, cantidades y total estimado.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!whatsapp}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[calc(var(--store-button-radius)+2px)] px-6 py-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(145deg, #25D366, #1fb85b)',
                    color: '#ffffff',
                    boxShadow: '0 18px 40px rgba(37, 211, 102, 0.22)',
                  }}
                >
                  <MessageCircle className="size-4" />
                  {COPY.cart.checkout}
                </button>

                {!whatsapp ? (
                  <p className="mt-3 text-center text-xs" style={{ color: 'var(--store-muted-text)' }}>
                    Configura un numero de WhatsApp en el admin para habilitar pedidos.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-3 w-full text-sm transition hover:opacity-80"
                  style={{ color: 'var(--store-soft-text)' }}
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
      className="rounded-[calc(var(--store-card-radius)*0.7)] p-3"
      style={{
        background: 'var(--store-card-background)',
        border: '1px solid var(--store-card-border)',
        boxShadow: 'var(--store-card-shadow)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="relative size-[4.5rem] shrink-0 overflow-hidden"
          style={{
            borderRadius: 'calc(var(--store-radius) * 0.72)',
            backgroundColor: 'color-mix(in srgb, var(--store-surface) 84%, transparent)',
          }}
        >
          {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-5" style={{ color: 'var(--store-text)' }}>
            {item.name}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--store-primary)' }}>
              {formatCurrency(item.price * item.quantity)}
            </p>
            <p className="text-xs" style={{ color: 'var(--store-muted-text)' }}>
              {item.quantity} x {formatCurrency(item.price)}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CounterButton label="Reducir cantidad" onClick={() => onUpdateQty(item.quantity - 1)}>
                <Minus className="size-3.5" />
              </CounterButton>
              <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
                {item.quantity}
              </span>
              <CounterButton label="Aumentar cantidad" onClick={() => onUpdateQty(item.quantity + 1)}>
                <Plus className="size-3.5" />
              </CounterButton>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="flex size-9 items-center justify-center transition"
              style={{
                borderRadius: 'var(--store-button-radius)',
                color: 'var(--store-muted-text)',
                backgroundColor: 'color-mix(in srgb, var(--store-surface) 68%, transparent)',
              }}
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

function CounterButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-8 items-center justify-center transition"
      style={{
        borderRadius: 'var(--store-button-radius)',
        border: '1px solid var(--store-card-border)',
        color: 'var(--store-text)',
      }}
      aria-label={label}
    >
      {children}
    </button>
  )
}
