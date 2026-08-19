'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { RelatedProductsStrip, type RelatedProductLink } from '@/components/product/RelatedProductsStrip'
import { COPY } from '@/data/system-copy'
import { buildCartItemKey, useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

type ProductModalProps = {
  product: ProductWithImages
  relatedProducts: RelatedProductLink[]
  onSelectRelated: (href: string) => void
  storeName: string
  whatsapp: string
  onClose: () => void
}

export function ProductModal({ product, relatedProducts, onSelectRelated, storeName, whatsapp, onClose }: ProductModalProps) {
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
  const allOptionsSelected = !hasOptions || sortedOptions.every((opt) => !!selectedOptions[opt.name])
  const hasWhatsapp = whatsapp.trim().length > 0
  const total = product.price * quantity

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
    if (!allOptionsSelected) return

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
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5"
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
            background: 'color-mix(in srgb, var(--store-bg) 32%, black 68%)',
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
          className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden sm:max-w-3xl lg:max-h-[80dvh] lg:max-w-[920px] xl:max-h-[690px]"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 92%, white 8%), color-mix(in srgb, var(--store-bg) 96%, var(--store-text) 4%))',
            borderRadius: 'calc(var(--store-card-radius) + 8px)',
            border: '1px solid var(--store-card-border)',
            boxShadow: 'var(--store-shadow)',
          }}
        >
          <div className="flex shrink-0 justify-center pb-1 pt-2 sm:hidden">
            <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: 'var(--store-border)' }} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[0.86fr_1.14fr]">
            <div className="shrink-0 p-3 sm:p-4 lg:overflow-y-auto lg:p-5">
              <div
                className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-square"
                style={{
                  borderRadius: 'calc(var(--store-card-radius) * 0.9)',
                  backgroundColor: 'color-mix(in srgb, var(--store-surface) 88%, transparent)',
                }}
              >
                {selectedImage ? (
                  <Image src={selectedImage.url} alt={selectedImage.alt ?? product.name} fill className="object-cover" priority />
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
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
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
                  className="absolute right-3 top-3 flex size-9 items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 sm:size-10"
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
                <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative h-12 w-10 shrink-0 overflow-hidden transition-all duration-150 hover:scale-105 active:scale-95 sm:h-14 sm:w-11"
                      style={{
                        borderRadius: 'calc(var(--store-radius) * 0.72)',
                        border: `2px solid ${index === selectedImageIndex ? 'var(--store-primary)' : 'var(--store-card-border)'}`,
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

            <div
              className="flex min-h-0 flex-1 flex-col border-t lg:border-l lg:border-t-0"
              style={{ borderColor: 'var(--store-card-border)' }}
            >
              <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-5 lg:px-6 lg:py-5">
                {product.category?.name ? (
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]" style={{ color: 'var(--store-muted-text)' }}>
                    {product.category.name}
                  </p>
                ) : null}

                <h2
                  id="product-modal-title"
                  className="store-heading mt-1 text-xl font-semibold tracking-tight sm:mt-1.5 sm:text-[1.75rem]"
                  style={{ color: 'var(--store-text)' }}
                >
                  {product.name}
                </h2>

                <div className="mt-2 flex flex-wrap items-end gap-3 sm:mt-3">
                  <span className="text-2xl font-semibold tracking-tight sm:text-[1.8rem]" style={{ color: 'var(--store-primary)' }}>
                    {formatCurrency(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price ? (
                    <span className="pb-0.5 text-xs line-through sm:text-sm" style={{ color: 'var(--store-muted-text)' }}>
                      {formatCurrency(product.compare_price)}
                    </span>
                  ) : null}
                </div>

                {product.description ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-6" style={{ color: 'var(--store-soft-text)' }}>
                    {product.description}
                  </p>
                ) : (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-6" style={{ color: 'var(--store-muted-text)' }}>
                    {COPY.product.modalFallbackDescription}
                  </p>
                )}

                <div
                  className="mt-4 hidden items-center gap-3 rounded-2xl px-3.5 py-3 sm:flex"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--store-primary) 8%, var(--store-surface) 92%)',
                    border: '1px solid color-mix(in srgb, var(--store-primary) 18%, var(--store-card-border) 82%)',
                  }}
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--store-primary) 16%, transparent)',
                      color: 'var(--store-primary)',
                    }}
                  >
                    <MessageCircle className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                      Compra directa
                    </p>
                    <p className="mt-0.5 text-xs leading-5 sm:text-sm" style={{ color: 'var(--store-soft-text)' }}>
                      {hasWhatsapp
                        ? `Agregalo al carrito y enviá el pedido a ${storeName} por WhatsApp.`
                        : `Prepará tu pedido en el carrito y revisá los datos de ${storeName}.`}
                    </p>
                  </div>
                </div>

                {hasOptions ? (
                  <div className="mt-3 space-y-3 sm:mt-5 sm:space-y-4">
                    {sortedOptions.map((option) => {
                      const selected = selectedOptions[option.name]
                      return (
                        <div key={option.id}>
                          <div className="mb-2 flex items-center gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                              {option.name}
                            </p>
                            <span
                              className="text-[11px] font-medium"
                              style={{ color: selected ? 'var(--store-primary)' : 'var(--store-muted-text)' }}
                            >
                              {selected ?? 'Elegí una opción'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((value) => {
                              const active = selected === value
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => selectOption(option.name, value)}
                                  className="rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.96]"
                                  style={
                                    active
                                      ? {
                                          backgroundColor: 'var(--store-primary)',
                                          color: 'var(--store-primary-contrast)',
                                          border: '2px solid var(--store-primary)',
                                          boxShadow: '0 5px 14px color-mix(in srgb, var(--store-primary) 20%, transparent)',
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

                <div className="hidden sm:block">
                  <RelatedProductsStrip items={relatedProducts} onSelect={onSelectRelated} />
                </div>
              </div>

              <div
                className="shrink-0 border-t px-4 pb-4 pt-3 sm:px-6 lg:px-6 lg:py-4"
                style={{
                  borderColor: 'var(--store-card-border)',
                  background:
                    'linear-gradient(to bottom, color-mix(in srgb, var(--store-surface) 94%, transparent), color-mix(in srgb, var(--store-surface) 99%, var(--store-bg) 1%))',
                  boxShadow: '0 -12px 28px color-mix(in srgb, var(--store-bg) 18%, transparent)',
                }}
              >
                {hasOptions && !allOptionsSelected ? (
                  <p className="mb-2 text-center text-[11px] sm:text-xs lg:text-left" style={{ color: 'var(--store-muted-text)' }}>
                    Elegí las opciones de arriba para continuar
                  </p>
                ) : null}

                <div className="flex items-end gap-2.5 sm:gap-3">
                  <div className="shrink-0">
                    <p className="mb-1 hidden text-[10px] font-semibold uppercase tracking-[0.16em] sm:block" style={{ color: 'var(--store-muted-text)' }}>
                      Cantidad
                    </p>
                    <QuantityControl quantity={quantity} setQuantity={setQuantity} compact />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!allOptionsSelected}
                    className="store-button inline-flex min-w-0 flex-1 items-center justify-center gap-2 px-3.5 py-3 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3.5 sm:text-sm"
                    style={{
                      background: allOptionsSelected
                        ? 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))'
                        : 'color-mix(in srgb, var(--store-surface) 80%, transparent)',
                      color: allOptionsSelected ? 'var(--store-primary-contrast)' : 'var(--store-muted-text)',
                      boxShadow: allOptionsSelected
                        ? '0 14px 32px color-mix(in srgb, var(--store-primary) 22%, transparent)'
                        : 'none',
                      border: allOptionsSelected ? 'none' : '1px solid var(--store-card-border)',
                    }}
                  >
                    {allOptionsSelected ? (
                      <>
                        <ShoppingBag className="size-4 shrink-0" />
                        <span className="truncate">{COPY.cart.addToCart} · {formatCurrency(total)}</span>
                      </>
                    ) : (
                      <>
                        <Check className="size-4 shrink-0 opacity-40" />
                        <span className="truncate">Elegí las opciones</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function QuantityControl({
  quantity,
  setQuantity,
  compact = false,
}: {
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  compact?: boolean
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <QuantityButton label="Reducir cantidad" onClick={() => setQuantity((q) => Math.max(1, q - 1))} compact={compact}>
        <Minus className="size-4" />
      </QuantityButton>
      <span
        className={compact ? 'w-7 text-center text-sm font-semibold sm:w-8 sm:text-base' : 'w-9 text-center text-xl font-semibold'}
        style={{ color: 'var(--store-text)' }}
      >
        {quantity}
      </span>
      <QuantityButton label="Aumentar cantidad" onClick={() => setQuantity((q) => q + 1)} compact={compact}>
        <Plus className="size-4" />
      </QuantityButton>
    </div>
  )
}

function QuantityButton({
  label,
  onClick,
  compact = false,
  children,
}: {
  label: string
  onClick: () => void
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${compact ? 'size-9' : 'size-11'} flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95`}
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
