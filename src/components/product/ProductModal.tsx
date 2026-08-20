'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { RelatedProductsStrip, type RelatedProductLink } from '@/components/product/RelatedProductsStrip'
import { COPY } from '@/data/system-copy'
import { getAvailableOptionValues, isOptionValueUnavailable, isProductPurchasable } from '@/lib/products/availability'
import { buildCartItemKey, useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductOption, ProductWithImages } from '@/types/store'

type ProductModalProps = {
  product: ProductWithImages
  relatedProducts: RelatedProductLink[]
  onSelectRelated: (href: string) => void
  onClose: () => void
}

export function ProductModal({ product, relatedProducts, onSelectRelated, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const sortedOptions = useMemo(() => [...(product.options ?? [])].sort((a, b) => a.sort_order - b.sort_order), [product.options])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const option of sortedOptions) {
      const available = getAvailableOptionValues(option)
      if (available.length === 1) initial[option.name] = available[0]
    }
    return initial
  })
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  const selectedImage = product.images?.[selectedImageIndex]
  const hasOptions = sortedOptions.length > 0
  const productPurchasable = isProductPurchasable(product)
  const allOptionsSelected = !hasOptions || sortedOptions.every((option) => {
    const selected = selectedOptions[option.name]
    return Boolean(selected) && !isOptionValueUnavailable(option, selected)
  })
  const canAdd = productPurchasable && allOptionsSelected
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

  function selectOption(option: ProductOption, value: string) {
    if (isOptionValueUnavailable(option, value)) return
    setSelectedOptions((current) => ({ ...current, [option.name]: value }))
  }

  function handleAddToCart() {
    if (!canAdd) return
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
          style={{ background: 'color-mix(in srgb, var(--store-bg) 30%, black 70%)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden sm:max-w-3xl lg:max-h-[84dvh] lg:max-w-[980px] xl:max-h-[720px]"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 94%, white 6%), color-mix(in srgb, var(--store-bg) 97%, var(--store-text) 3%))',
            borderRadius: 'calc(var(--store-card-radius) + 8px)',
            border: '1px solid var(--store-card-border)',
            boxShadow: 'var(--store-shadow)',
          }}
        >
          <div className="flex shrink-0 justify-center pb-1 pt-2 sm:hidden">
            <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: 'var(--store-border)' }} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="lg:grid lg:grid-cols-[0.88fr_1.12fr]">
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-square" style={{ borderRadius: 'calc(var(--store-card-radius) * 0.9)', backgroundColor: 'var(--store-surface)' }}>
                  {selectedImage ? (
                    <Image src={selectedImage.url} alt={selectedImage.alt ?? product.name} fill className="object-cover" priority />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium" style={{ color: 'var(--store-muted-text)' }}>Sin imagen</div>
                  )}
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 flex size-10 items-center justify-center transition hover:scale-105 active:scale-95"
                    style={{ borderRadius: 'var(--store-button-radius)', background: 'color-mix(in srgb, var(--store-bg) 78%, transparent)', color: 'var(--store-text)', border: '1px solid var(--store-card-border)', backdropFilter: 'blur(12px)' }}
                    aria-label="Cerrar"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {product.images.length > 1 ? (
                  <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((image, index) => (
                      <button key={image.id} type="button" onClick={() => setSelectedImageIndex(index)} className="relative h-12 w-10 shrink-0 overflow-hidden sm:h-14 sm:w-11" style={{ borderRadius: 'var(--store-radius)', border: `2px solid ${index === selectedImageIndex ? 'var(--store-primary)' : 'var(--store-card-border)'}`, opacity: index === selectedImageIndex ? 1 : 0.62 }} aria-label={`Ver imagen ${index + 1}`}>
                        <Image src={image.url} alt={`Vista ${index + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="border-t px-4 py-3 sm:px-6 sm:py-5 lg:border-l lg:border-t-0 lg:px-7" style={{ borderColor: 'var(--store-card-border)' }}>
                <div className="flex flex-wrap items-center gap-2">
                  {product.category?.name ? <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-secondary)' }}>{product.category.name}</span> : null}
                  {product.brand?.name ? <span className="text-xs font-medium" style={{ color: 'var(--store-muted-text)' }}>{product.brand.name}</span> : null}
                </div>
                <h2 id="product-modal-title" className="store-heading mt-1.5 text-xl font-semibold tracking-tight sm:text-[1.75rem]" style={{ color: 'var(--store-text)' }}>{product.name}</h2>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-2xl font-bold tracking-tight sm:text-[1.9rem]" style={{ color: 'var(--store-primary)' }}>{formatCurrency(product.price)}</span>
                  {product.compare_price && product.compare_price > product.price ? <span className="pb-0.5 text-sm line-through" style={{ color: 'var(--store-muted-text)' }}>{formatCurrency(product.compare_price)}</span> : null}
                </div>
                {product.description ? <p className="mt-3 line-clamp-2 text-xs leading-5 sm:line-clamp-4 sm:text-sm sm:leading-6" style={{ color: 'var(--store-soft-text)' }}>{product.description}</p> : null}
                <div className="hidden lg:block"><RelatedProductsStrip items={relatedProducts} onSelect={onSelectRelated} /></div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-surface) 97%, var(--store-bg) 3%)', boxShadow: '0 -14px 34px color-mix(in srgb, var(--store-bg) 22%, transparent)' }}>
            <div className="lg:grid lg:grid-cols-[0.88fr_1.12fr]">
              <div className="hidden border-r px-5 py-4 lg:flex lg:items-center" style={{ borderColor: 'var(--store-card-border)' }}>
                <p className="text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>Elegí las opciones, ajustá cantidad y agregá. Todo sin perder el producto de vista.</p>
              </div>
              <div className="px-3.5 pb-4 pt-3 sm:px-6 lg:px-7 lg:py-4">
                {hasOptions ? (
                  <div className="mb-3 space-y-2.5">
                    {sortedOptions.map((option) => (
                      <div key={option.id} className="flex min-w-0 items-center gap-2.5">
                        <span className="w-[58px] shrink-0 truncate text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--store-muted-text)' }}>{option.name}</span>
                        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5">
                          {option.values.map((value) => {
                            const unavailable = isOptionValueUnavailable(option, value)
                            const active = selectedOptions[option.name] === value
                            return (
                              <button
                                key={value}
                                type="button"
                                disabled={unavailable}
                                onClick={() => selectOption(option, value)}
                                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-[0.96] disabled:cursor-not-allowed"
                                style={unavailable
                                  ? { color: 'var(--store-muted-text)', background: 'color-mix(in srgb, var(--store-bg) 70%, transparent)', border: '1px solid var(--store-card-border)', textDecoration: 'line-through', opacity: 0.52 }
                                  : active
                                    ? { color: 'var(--store-primary-contrast)', background: 'var(--store-primary)', border: '1px solid var(--store-primary)' }
                                    : { color: 'var(--store-text)', background: 'color-mix(in srgb, var(--store-surface) 78%, transparent)', border: '1px solid var(--store-card-border)' }}
                                aria-label={unavailable ? `${value}, agotado` : value}
                              >
                                {value}{unavailable ? ' · agotado' : ''}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {!productPurchasable ? <p className="mb-2 text-xs font-medium" style={{ color: 'var(--store-primary)' }}>Por ahora no hay una combinación disponible.</p> : hasOptions && !allOptionsSelected ? <p className="mb-2 text-xs" style={{ color: 'var(--store-muted-text)' }}>Elegí una opción para agregar.</p> : null}

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <QuantityControl quantity={quantity} setQuantity={setQuantity} />
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canAdd}
                    className="store-button inline-flex min-w-0 flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: canAdd ? 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 76%, black 24%))' : 'color-mix(in srgb, var(--store-surface) 80%, transparent)', color: canAdd ? 'var(--store-primary-contrast)' : 'var(--store-muted-text)', border: canAdd ? 'none' : '1px solid var(--store-card-border)', boxShadow: canAdd ? '0 12px 28px color-mix(in srgb, var(--store-primary) 22%, transparent)' : 'none' }}
                  >
                    {canAdd ? <ShoppingBag className="size-4" /> : <Check className="size-4 opacity-40" />}
                    <span className="truncate">{canAdd ? `${COPY.cart.addToCart} · ${formatCurrency(total)}` : 'Elegí las opciones'}</span>
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

function QuantityControl({ quantity, setQuantity }: { quantity: number; setQuantity: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-xl border p-1" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-bg) 64%, transparent)' }}>
      <QuantityButton label="Reducir cantidad" onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus className="size-4" /></QuantityButton>
      <span className="w-7 text-center text-sm font-bold" style={{ color: 'var(--store-text)' }}>{quantity}</span>
      <QuantityButton label="Aumentar cantidad" onClick={() => setQuantity((current) => current + 1)}><Plus className="size-4" /></QuantityButton>
    </div>
  )
}

function QuantityButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="flex size-8 items-center justify-center rounded-lg transition active:scale-90" style={{ color: 'var(--store-text)', background: 'color-mix(in srgb, var(--store-surface) 80%, transparent)' }} aria-label={label}>{children}</button>
}
