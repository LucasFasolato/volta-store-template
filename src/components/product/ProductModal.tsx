'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { COPY } from '@/data/system-copy'
import { useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

type ProductModalProps = {
  product: ProductWithImages
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  const selectedImage = product.images?.[selectedImageIndex]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleAddToCart() {
    for (let index = 0; index < quantity; index += 1) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0]?.url ?? null,
      })
    }
    openCart()
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{
            background: 'color-mix(in srgb, var(--store-bg) 35%, black 65%)',
            backdropFilter: 'blur(18px)',
          }}
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="relative max-h-[92dvh] w-full overflow-y-auto sm:max-w-5xl"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 92%, white 8%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
            borderRadius: 'calc(var(--store-card-radius) + 8px)',
            border: '1px solid var(--store-card-border)',
            boxShadow: 'var(--store-shadow)',
          }}
        >
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full sm:hidden" style={{ backgroundColor: 'var(--store-card-border)' }} />

          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-4 sm:p-5 lg:p-6">
              <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{
                  borderRadius: 'calc(var(--store-card-radius) * 0.9)',
                  backgroundColor: 'color-mix(in srgb, var(--store-surface) 88%, transparent)',
                }}
              >
                {selectedImage ? (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.alt ?? product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                    Sin imagen
                  </div>
                )}

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 6%, transparent), transparent 35%, color-mix(in srgb, var(--store-text) 16%, transparent))',
                  }}
                />

                {product.badge ? (
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--store-bg) 78%, transparent)',
                      color: 'var(--store-text)',
                      border: '1px solid var(--store-card-border)',
                      backdropFilter: 'blur(18px)',
                    }}
                  >
                    {product.badge}
                  </span>
                ) : null}

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 flex size-11 items-center justify-center transition"
                  style={{
                    borderRadius: 'var(--store-button-radius)',
                    backgroundColor: 'color-mix(in srgb, var(--store-bg) 72%, transparent)',
                    color: 'var(--store-text)',
                    border: '1px solid var(--store-card-border)',
                    backdropFilter: 'blur(16px)',
                  }}
                  aria-label="Cerrar"
                >
                  <X className="size-4" />
                </button>
              </div>

              {product.images && product.images.length > 1 ? (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative h-20 w-16 shrink-0 overflow-hidden transition"
                      style={{
                        borderRadius: 'calc(var(--store-radius) * 0.72)',
                        border: `1px solid ${
                          index === selectedImageIndex ? 'var(--store-primary)' : 'var(--store-card-border)'
                        }`,
                        boxShadow:
                          index === selectedImageIndex
                            ? '0 14px 28px color-mix(in srgb, var(--store-primary) 20%, transparent)'
                            : 'none',
                      }}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <Image src={image.url} alt={`Vista ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col p-5 sm:p-6 lg:p-8">
              {product.category?.name ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--store-muted-text)' }}>
                  {product.category.name}
                </p>
              ) : null}

              <h2
                id="product-modal-title"
                className="store-heading mt-3 text-3xl font-semibold tracking-tight sm:text-[2.6rem]"
                style={{ color: 'var(--store-text)' }}
              >
                {product.name}
              </h2>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <span className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]" style={{ color: 'var(--store-primary)' }}>
                  {formatCurrency(product.price)}
                </span>
                {product.compare_price && product.compare_price > product.price ? (
                  <span className="pb-1 text-base line-through" style={{ color: 'var(--store-muted-text)' }}>
                    {formatCurrency(product.compare_price)}
                  </span>
                ) : null}
              </div>

              {product.description ? (
                <p className="mt-5 max-w-xl text-sm leading-7 sm:text-[15px]" style={{ color: 'var(--store-soft-text)' }}>
                  {product.description}
                </p>
              ) : (
                <p className="mt-5 max-w-xl text-sm leading-7" style={{ color: 'var(--store-muted-text)' }}>
                  Este producto se gestiona por pedido directo. Agregalo al carrito y continua la conversacion por WhatsApp.
                </p>
              )}

              <div
                className="mt-7 rounded-[calc(var(--store-card-radius)*0.84)] p-5"
                style={{
                  background: 'var(--store-card-background)',
                  border: '1px solid var(--store-card-border)',
                  boxShadow: 'var(--store-card-shadow)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
                      {COPY.cart.quantity}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <QuantityButton
                        label="Reducir cantidad"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        <Minus className="size-4" />
                      </QuantityButton>
                      <span className="w-10 text-center text-xl font-semibold" style={{ color: 'var(--store-text)' }}>
                        {quantity}
                      </span>
                      <QuantityButton label="Aumentar cantidad" onClick={() => setQuantity((current) => current + 1)}>
                        <Plus className="size-4" />
                      </QuantityButton>
                    </div>
                  </div>

                  <div className="rounded-[calc(var(--store-radius)*0.72)] px-4 py-3 text-right" style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary) 9%, transparent)' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
                      Total estimado
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: 'var(--store-primary)' }}>
                      {formatCurrency(product.price * quantity)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="store-button inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background:
                      'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                    color: 'var(--store-bg)',
                    boxShadow: '0 18px 40px color-mix(in srgb, var(--store-primary) 24%, transparent)',
                  }}
                >
                  <ShoppingBag className="size-4" />
                  {COPY.cart.addToCart}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function QuantityButton({
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
      className="flex size-11 items-center justify-center transition"
      style={{
        borderRadius: 'var(--store-button-radius)',
        border: '1px solid var(--store-card-border)',
        backgroundColor: 'color-mix(in srgb, var(--store-surface) 72%, transparent)',
        color: 'var(--store-text)',
      }}
      aria-label={label}
    >
      {children}
    </button>
  )
}
