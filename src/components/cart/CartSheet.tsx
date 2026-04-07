'use client'

import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { COPY } from '@/data/system-copy'
import {
  getCartItemDisplayName,
  getCartItemLineTotal,
  getCartItemOptionEntries,
  getCartSummary,
} from '@/lib/cart/summary'
import { useCartStore, type CartItem as StoreCartItem } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp/builder'

type CartSheetProps = {
  whatsapp: string
  storeName: string
}

const FLOW_STEPS = [
  'Armas el pedido',
  'Revisas el resumen',
  'Se abre WhatsApp',
  'Envias al vendedor',
]

export function CartSheet({ whatsapp, storeName }: CartSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const closeCart = useCartStore((state) => state.closeCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const { subtotal, totalItems } = useMemo(() => getCartSummary(items), [items])
  const whatsappPreview = useMemo(() => buildWhatsAppMessage(items), [items])

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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[28rem] flex-col"
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
              <div className="min-w-0">
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
                  <div className="min-w-0">
                    <h2 id="cart-title" className="store-heading truncate text-lg font-semibold" style={{ color: 'var(--store-text)' }}>
                      {COPY.cart.title}
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                      Pedido para {storeName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {totalItems > 0 ? (
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                      color: 'var(--store-primary)',
                    }}
                  >
                    {totalItems}
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
                        color: 'var(--store-primary-contrast)',
                      }}
                    >
                      {COPY.cart.continueShopping}
                    </button>
                  }
                  className="border-0 bg-transparent px-4 py-12 shadow-none"
                  tone="light"
                />
              ) : (
                <div className="space-y-4 pb-2">
                  <section
                    className="rounded-[calc(var(--store-card-radius)*0.72)] p-4"
                    style={{
                      background: 'var(--store-card-background)',
                      border: '1px solid var(--store-card-border)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-primary)' }}>
                          Ultimo paso
                        </p>
                        <h3 className="mt-2 text-base font-semibold leading-6" style={{ color: 'var(--store-text)' }}>
                          Revisa el pedido y abre WhatsApp con todo listo
                        </h3>
                        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                          Vas a confirmar productos, variantes, cantidades y total estimado antes de enviar.
                        </p>
                      </div>

                      <div
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                          color: 'var(--store-primary)',
                        }}
                      >
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {FLOW_STEPS.map((step, index) => (
                        <FlowStep key={step} index={index + 1} label={step} />
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-end justify-between gap-3 px-1">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                          Resumen del pedido
                        </p>
                        <p className="mt-1 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                          Todo lo que vas a mandar ya queda visible aca.
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--store-muted-text)' }}>
                        {items.length} {items.length === 1 ? 'linea' : 'lineas'}
                      </p>
                    </div>

                    <div className="mt-3 space-y-3">
                      {items.map((item) => (
                        <CartItem
                          key={item.cartItemKey}
                          item={item}
                          onUpdateQty={(quantity) => updateQuantity(item.cartItemKey, quantity)}
                          onRemove={() => removeItem(item.cartItemKey)}
                        />
                      ))}
                    </div>
                  </section>

                  <section
                    className="rounded-[calc(var(--store-card-radius)*0.72)] p-4"
                    style={{
                      background: 'var(--store-card-background)',
                      border: '1px solid var(--store-card-border)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="flex size-10 shrink-0 items-center justify-center"
                          style={{
                            borderRadius: 'var(--store-button-radius)',
                            backgroundColor: 'color-mix(in srgb, #25D366 12%, transparent)',
                            color: '#25D366',
                          }}
                        >
                          <MessageCircle className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                            Preview de WhatsApp
                          </p>
                          <p className="mt-1 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                            Asi se abre el mensaje final antes de enviarlo.
                          </p>
                        </div>
                      </div>

                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor: 'color-mix(in srgb, #25D366 12%, transparent)',
                          color: '#25D366',
                        }}
                      >
                        Listo
                      </span>
                    </div>

                    <div
                      className="mt-4 rounded-[calc(var(--store-card-radius)*0.6)] p-3"
                      style={{
                        background:
                          'linear-gradient(180deg, color-mix(in srgb, #25D366 10%, var(--store-surface) 90%), color-mix(in srgb, var(--store-surface) 92%, transparent))',
                        border: '1px solid color-mix(in srgb, #25D366 20%, var(--store-card-border) 80%)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                          Mensaje listo para enviar
                        </p>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--store-soft-text)' }}>
                          WhatsApp
                        </p>
                      </div>

                      <pre
                        className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap break-words pr-1 font-sans text-[12px] leading-5"
                        style={{ color: 'var(--store-text)' }}
                      >
                        {whatsappPreview}
                      </pre>
                    </div>
                  </section>
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
                        Subtotal estimado
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight" style={{ color: 'var(--store-primary)' }}>
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                    <div
                      className="rounded-[calc(var(--store-button-radius)+1px)] px-3 py-2 text-right"
                      style={{
                        backgroundColor: 'color-mix(in srgb, #25D366 10%, transparent)',
                        color: '#25D366',
                      }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">Siguiente</p>
                      <p className="mt-1 text-sm font-semibold">WhatsApp</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>
                    Se abrira WhatsApp con tu pedido listo para enviar a {storeName}. Ahi solo revisas el mensaje y confirmas la compra con el vendedor.
                  </p>
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
                  <span>Abrir WhatsApp con mi pedido</span>
                  <ArrowRight className="size-4" />
                </button>

                <p className="mt-3 text-center text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>
                  Paso siguiente: se abre WhatsApp con el mensaje completo y listo para enviar.
                </p>

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
  item: StoreCartItem
  onUpdateQty: (quantity: number) => void
  onRemove: () => void
}) {
  const displayName = getCartItemDisplayName(item)
  const optionEntries = getCartItemOptionEntries(item.selectedOptions)
  const lineTotal = getCartItemLineTotal(item)

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
          {item.imageUrl ? <Image src={item.imageUrl} alt={displayName} fill className="object-cover" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                Producto
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5" style={{ color: 'var(--store-text)' }}>
                {displayName}
              </p>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="flex size-9 shrink-0 items-center justify-center transition"
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

          {optionEntries.length > 0 ? (
            <dl className="mt-3 grid gap-2">
              {optionEntries.map(([name, value]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-[calc(var(--store-button-radius)+1px)] px-3 py-2"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--store-primary) 8%, transparent)',
                  }}
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                    {name}
                  </dt>
                  <dd className="text-sm font-medium text-right" style={{ color: 'var(--store-text)' }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                Subtotal
              </p>
              <p className="mt-1 text-base font-semibold" style={{ color: 'var(--store-primary)' }}>
                {formatCurrency(lineTotal)}
              </p>
            </div>
            <p className="text-xs text-right" style={{ color: 'var(--store-soft-text)' }}>
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

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
              Listo para enviar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowStep({ index, label }: { index: number; label: string }) {
  return (
    <div
      className="rounded-[calc(var(--store-button-radius)+1px)] px-3 py-2"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--store-surface) 78%, transparent)',
        border: '1px solid var(--store-card-border)',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
        Paso {index}
      </p>
      <p className="mt-1 text-sm font-medium leading-5" style={{ color: 'var(--store-text)' }}>
        {label}
      </p>
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
