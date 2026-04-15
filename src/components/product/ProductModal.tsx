'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { COPY } from '@/data/system-copy'
import { buildCartItemKey, useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

type ProductModalProps = {
  product: ProductWithImages
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  const selectedImage = product.images?.[selectedImageIndex]
  const sortedOptions = useMemo(
    () => [...(product.options ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [product.options],
  )
  const hasOptions = sortedOptions.length > 0
  const allOptionsSelected =
    !hasOptions || sortedOptions.every((opt) => !!selectedOptions[opt.name])

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

  function selectOption(optionName: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
  }

  function handleAddToCart() {
    const cartItemKey = buildCartItemKey(product.id, hasOptions ? selectedOptions : undefined)

    for (let index = 0; index < quantity; index += 1) {
      addItem({
        cartItemKey,
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0]?.url ?? null,
        selectedOptions: hasOptions ? { ...selectedOptions } : undefined,
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
        {/* Backdrop */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{
            background: 'color-mix(in srgb, var(--store-bg) 32%, black 68%)',
            backdropFilter: 'blur(18px)',
          }}
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
        />

        {/* Modal panel */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden sm:max-w-5xl"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 92%, white 8%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
            borderRadius: 'calc(var(--store-card-radius) + 8px)',
            border: '1px solid var(--store-card-border)',
            boxShadow: 'var(--store-shadow)',
          }}
        >
          {/* Handle bar — mobile only */}
          <div className="flex shrink-0 justify-center pb-1 pt-3 sm:hidden">
            <div
              className="h-1.5 w-14 rounded-full"
              style={{ backgroundColor: 'var(--store-border)' }}
            />
          </div>

          {/* Body: stacked on mobile, two-column on desktop */}
          <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[1.05fr_0.95fr]">

            {/* ── Image panel ── */}
            <div className="shrink-0 p-4 sm:p-5 lg:overflow-y-auto lg:p-6">
              <div
                className="relative aspect-[5/4] w-full overflow-hidden lg:aspect-[4/5]"
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
                  <div
                    className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-[0.18em]"
                    style={{ color: 'var(--store-muted-text)' }}
                  >
                    Sin imagen
                  </div>
                )}

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 5%, transparent), transparent 30%, color-mix(in srgb, var(--store-text) 12%, transparent))',
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
                  className="absolute right-4 top-4 flex size-10 items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
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

              {/* Thumbnails */}
              {product.images && product.images.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative h-16 w-12 shrink-0 overflow-hidden transition-all duration-150 hover:scale-105 active:scale-95"
                      style={{
                        borderRadius: 'calc(var(--store-radius) * 0.72)',
                        border: `2px solid ${
                          index === selectedImageIndex
                            ? 'var(--store-primary)'
                            : 'var(--store-card-border)'
                        }`,
                        opacity: index === selectedImageIndex ? 1 : 0.65,
                      }}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <Image src={image.url} alt={`Vista ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* ── Detail panel: scrollable content + sticky CTA ── */}
            <div
              className="flex min-h-0 flex-col border-t lg:border-l lg:border-t-0"
              style={{ borderColor: 'var(--store-card-border)' }}
            >
              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 lg:px-8 lg:py-8">
                {product.category?.name ? (
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--store-muted-text)' }}
                  >
                    {product.category.name}
                  </p>
                ) : null}

                <h2
                  id="product-modal-title"
                  className="store-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                  style={{ color: 'var(--store-text)' }}
                >
                  {product.name}
                </h2>

                {/* Price */}
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span
                    className="text-3xl font-semibold tracking-tight sm:text-[2rem]"
                    style={{ color: 'var(--store-primary)' }}
                  >
                    {formatCurrency(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price ? (
                    <span className="pb-0.5 text-base line-through" style={{ color: 'var(--store-muted-text)' }}>
                      {formatCurrency(product.compare_price)}
                    </span>
                  ) : null}
                </div>

                {/* Description */}
                {product.description ? (
                  <p
                    className="mt-5 text-sm leading-7 sm:text-[15px]"
                    style={{ color: 'var(--store-soft-text)' }}
                  >
                    {product.description}
                  </p>
                ) : (
                  <p className="mt-5 text-sm leading-7" style={{ color: 'var(--store-muted-text)' }}>
                    {COPY.product.modalFallbackDescription}
                  </p>
                )}

                {/* ── Option selectors ── */}
                {hasOptions ? (
                  <div className="mt-7 space-y-6">
                    {sortedOptions.map((option) => {
                      const selected = selectedOptions[option.name]
                      return (
                        <div key={option.id}>
                          <div className="mb-3 flex items-center gap-2">
                            <p
                              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                              style={{ color: 'var(--store-muted-text)' }}
                            >
                              {option.name}
                            </p>
                            {selected ? (
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: 'var(--store-primary)' }}
                              >
                                {selected}
                              </span>
                            ) : (
                              <span
                                className="text-[11px] font-medium opacity-45"
                                style={{ color: 'var(--store-text)' }}
                              >
                                elegir
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((value) => {
                              const active = selected === value
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => selectOption(option.name, value)}
                                  className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.94]"
                                  style={
                                    active
                                      ? {
                                          backgroundColor: 'var(--store-primary)',
                                          color: 'var(--store-primary-contrast)',
                                          border: '2px solid var(--store-primary)',
                                          boxShadow: '0 6px 18px color-mix(in srgb, var(--store-primary) 22%, transparent)',
                                          transform: 'scale(1.04)',
                                        }
                                      : {
                                          backgroundColor: 'color-mix(in srgb, var(--store-surface) 72%, transparent)',
                                          color: 'var(--store-text)',
                                          border: '2px solid var(--store-card-border)',
                                        }
                                  }
                                >
                                  {value}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}

                {/* ── Quantity ── */}
                <div className="mt-7">
                  <p
                    className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--store-muted-text)' }}
                  >
                    {COPY.cart.quantity}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <QuantityButton
                        label="Reducir cantidad"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        <Minus className="size-4" />
                      </QuantityButton>
                      <span
                        className="w-10 text-center text-xl font-semibold"
                        style={{ color: 'var(--store-text)' }}
                      >
                        {quantity}
                      </span>
                      <QuantityButton
                        label="Aumentar cantidad"
                        onClick={() => setQuantity((q) => q + 1)}
                      >
                        <Plus className="size-4" />
                      </QuantityButton>
                    </div>

                    {quantity > 1 ? (
                      <div
                        className="rounded-lg px-3 py-2 text-right"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary) 8%, transparent)' }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                          style={{ color: 'var(--store-muted-text)' }}
                        >
                          Total
                        </p>
                        <p
                          className="text-lg font-semibold tracking-tight"
                          style={{ color: 'var(--store-primary)' }}
                        >
                          {formatCurrency(product.price * quantity)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ── Sticky CTA footer ── */}
              <div
                className="shrink-0 border-t px-5 pb-5 pt-4 lg:px-8"
                style={{
                  borderColor: 'var(--store-card-border)',
                  background:
                    'linear-gradient(to bottom, color-mix(in srgb, var(--store-surface) 0%, transparent) 0%, color-mix(in srgb, var(--store-surface) 88%, transparent) 100%)',
                }}
              >
                {hasOptions && !allOptionsSelected ? (
                  <p
                    className="mb-3 text-center text-xs"
                    style={{ color: 'var(--store-muted-text)' }}
                  >
                    Elegí todas las opciones para continuar
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!allOptionsSelected}
                  className="store-button inline-flex w-full items-center justify-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: allOptionsSelected
                      ? 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))'
                      : 'color-mix(in srgb, var(--store-surface) 80%, transparent)',
                    color: allOptionsSelected ? 'var(--store-primary-contrast)' : 'var(--store-muted-text)',
                    boxShadow: allOptionsSelected
                      ? '0 18px 40px color-mix(in srgb, var(--store-primary) 24%, transparent)'
                      : 'none',
                    border: allOptionsSelected ? 'none' : '1px solid var(--store-card-border)',
                  }}
                >
                  {allOptionsSelected ? (
                    <>
                      <ShoppingBag className="size-4" />
                      {quantity > 1
                        ? `${COPY.cart.addToCart} (${quantity}) · ${formatCurrency(product.price * quantity)}`
                        : COPY.cart.addToCart}
                    </>
                  ) : (
                    <>
                      <Check className="size-4 opacity-40" />
                      Elegí todas las opciones
                    </>
                  )}
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
      className="flex size-11 items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
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
