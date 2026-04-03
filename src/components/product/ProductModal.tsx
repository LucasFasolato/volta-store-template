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
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-h-[92dvh] overflow-y-auto sm:mx-4 sm:max-w-4xl"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 88%, white 12%), color-mix(in srgb, var(--store-bg) 94%, var(--store-text) 6%))',
            borderRadius: '28px 28px 0 0',
            boxShadow: 'var(--store-shadow)',
          }}
        >
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-black/12 sm:hidden" />

          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
                {selectedImage ? (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.alt ?? product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center text-sm"
                    style={{
                      backgroundColor: 'var(--store-surface-soft)',
                      color: 'color-mix(in srgb, var(--store-text) 45%, transparent)',
                    }}
                  >
                    Sin imagen
                  </div>
                )}

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                  aria-label="Cerrar"
                >
                  <X className="size-4" />
                </button>

                {product.badge ? (
                  <span
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--store-secondary) 22%, white 78%)',
                      color: 'var(--store-primary)',
                    }}
                  >
                    {product.badge}
                  </span>
                ) : null}
              </div>

              {product.images && product.images.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition"
                      style={{
                        borderColor:
                          index === selectedImageIndex ? 'var(--store-primary)' : 'var(--store-border)',
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
                <p
                  className="text-xs font-semibold uppercase tracking-[0.24em]"
                  style={{ color: 'color-mix(in srgb, var(--store-text) 55%, transparent)' }}
                >
                  {product.category.name}
                </p>
              ) : null}

              <h2
                id="product-modal-title"
                className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ color: 'var(--store-text)' }}
              >
                {product.name}
              </h2>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-3xl font-semibold" style={{ color: 'var(--store-primary)' }}>
                  {formatCurrency(product.price)}
                </span>
                {product.compare_price && product.compare_price > product.price ? (
                  <span
                    className="text-base line-through"
                    style={{ color: 'color-mix(in srgb, var(--store-text) 42%, transparent)' }}
                  >
                    {formatCurrency(product.compare_price)}
                  </span>
                ) : null}
              </div>

              {product.description ? (
                <p
                  className="mt-5 text-sm leading-7 sm:text-[15px]"
                  style={{ color: 'color-mix(in srgb, var(--store-text) 72%, transparent)' }}
                >
                  {product.description}
                </p>
              ) : null}

              <div
                className="mt-6 rounded-[26px] border p-4"
                style={{
                  borderColor: 'var(--store-border)',
                  backgroundColor: 'color-mix(in srgb, var(--store-bg) 75%, transparent)',
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'color-mix(in srgb, var(--store-text) 50%, transparent)' }}
                >
                  {COPY.cart.quantity}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="flex size-11 items-center justify-center rounded-full border transition hover:bg-black/4"
                      style={{ borderColor: 'var(--store-border-strong)', color: 'var(--store-text)' }}
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-lg font-semibold" style={{ color: 'var(--store-text)' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="flex size-11 items-center justify-center rounded-full border transition hover:bg-black/4"
                      style={{ borderColor: 'var(--store-border-strong)', color: 'var(--store-text)' }}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-xs uppercase tracking-[0.18em]"
                      style={{ color: 'color-mix(in srgb, var(--store-text) 50%, transparent)' }}
                    >
                      Total
                    </p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--store-primary)' }}>
                      {formatCurrency(product.price * quantity)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition hover:opacity-95 active:scale-[0.99]"
                  style={{
                    background:
                      'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                    color: 'var(--store-bg)',
                  }}
                >
                  <ShoppingBag className="mr-2 size-4" />
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
