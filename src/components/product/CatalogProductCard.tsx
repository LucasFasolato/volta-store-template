'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, PackageX, Plus, ShoppingBag } from 'lucide-react'
import { isProductPurchasable, isProductSoldOut } from '@/lib/products/availability'
import { getProductOptionSummary } from '@/lib/products/options-display'
import { useCartStore } from '@/lib/stores/cart'
import { normalizeCardLayout } from '@/lib/utils/card-layout'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type Props = { product: ProductWithImages; productHref: string; theme: StoreTheme }

export function CatalogProductCard({ product, productHref, theme }: Props) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const coverImage = product.images?.[0]
  const hasOptions = (product.options?.length ?? 0) > 0
  const soldOut = isProductSoldOut(product) || !isProductPurchasable(product)
  const [added, setAdded] = useState(false)
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardModel = normalizeCardLayout(theme.card_layout)
  const discountPct = product.compare_price && product.compare_price > product.price ? Math.round((1 - product.price / product.compare_price) * 100) : null
  const summary = product.short_description || (hasOptions ? getProductOptionSummary(product.options) : null)
  const imageRatio = theme.image_ratio === '1:1' ? 'aspect-square' : theme.image_ratio === '3:4' ? 'aspect-[3/4]' : theme.image_ratio === '16:9' ? 'aspect-video' : 'aspect-[4/5]'

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current) }, [])
  function openProduct() { router.push(productHref, { scroll: false }) }
  function handleAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (soldOut) return
    if (hasOptions) { openProduct(); return }
    addItem({ cartItemKey: product.id, productId: product.id, name: product.name, price: product.price, imageUrl: coverImage?.url ?? null })
    if (addedTimer.current) clearTimeout(addedTimer.current)
    setAdded(true)
    addedTimer.current = setTimeout(() => setAdded(false), 1400)
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct() }
  }

  const badgeLabel = soldOut ? 'Agotado' : product.badge || (discountPct ? `${discountPct}% OFF` : null)

  return (
    <article role="button" tabIndex={0} onClick={openProduct} onKeyDown={handleKeyDown} data-card-layout={cardModel} className="catalog-product-card store-card group flex h-full min-w-0 flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ outlineColor: 'var(--store-primary)' }} aria-label={`Ver detalle de ${product.name}`}>
      <div className="relative overflow-hidden">
        <div className={`catalog-product-image relative w-full overflow-hidden ${imageRatio}`} style={{ background: coverImage ? 'var(--store-surface)' : 'linear-gradient(135deg, color-mix(in srgb, var(--store-primary) 9%, var(--store-surface)), color-mix(in srgb, var(--store-accent) 11%, var(--store-surface)))' }}>
          {coverImage ? <Image src={coverImage.url} alt={coverImage.alt ?? product.name} fill className={soldOut ? 'object-cover opacity-65 grayscale-[0.3]' : 'object-cover transition-transform duration-700 group-hover:scale-[1.035]'} sizes="(max-width: 640px) 48vw, (max-width: 1280px) 45vw, 24vw" /> : <div className="absolute inset-0 flex items-center justify-center"><span className="flex size-14 items-center justify-center rounded-2xl text-xl font-bold" style={{ background: 'color-mix(in srgb, var(--store-primary) 14%, transparent)', color: 'var(--store-primary)' }}>{product.name.charAt(0).toUpperCase()}</span></div>}
          {coverImage ? <div className="pointer-events-none absolute inset-0" style={{ background: soldOut ? 'color-mix(in srgb, var(--store-bg) 24%, transparent)' : cardModel === 'visual' ? 'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 46%, transparent), transparent 52%)' : 'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 14%, transparent), transparent 36%)' }} /> : null}
          {badgeLabel ? <span className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ background: soldOut ? 'color-mix(in srgb, var(--store-bg) 90%, transparent)' : product.badge ? 'var(--store-primary)' : 'color-mix(in srgb, var(--store-bg) 86%, transparent)', color: soldOut || !product.badge ? 'var(--store-text)' : 'var(--store-primary-contrast)', border: soldOut || !product.badge ? '1px solid var(--store-card-border)' : undefined, backdropFilter: 'blur(10px)' }}>{badgeLabel}</span> : null}
        </div>
      </div>

      <div className="catalog-product-content flex flex-1 flex-col" style={{ padding: 'var(--store-card-padding)' }}>
        <div className="catalog-product-meta flex min-w-0 items-center gap-2">
          {product.category?.name ? <span className="truncate text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--store-secondary)' }}>{product.category.name}</span> : null}
          {product.brand?.name ? <span className="truncate text-[10px] font-semibold" style={{ color: 'var(--store-muted-text)' }}>{product.brand.name}</span> : null}
        </div>
        <h3 className="catalog-product-name store-heading mt-1.5 line-clamp-2 text-[15px] font-bold leading-[1.18] tracking-[-0.025em] sm:text-base" style={{ color: 'var(--store-text)', fontWeight: 'var(--store-heading-weight)' }}>{product.name}</h3>
        {summary ? <p className="catalog-product-summary mt-2 line-clamp-2 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>{summary}</p> : null}
        <div className="catalog-product-footer mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0"><p className="catalog-product-price text-lg font-bold tracking-[-0.025em] sm:text-xl" style={{ color: soldOut ? 'var(--store-soft-text)' : 'var(--store-primary)' }}>{formatCurrency(product.price)}</p>{discountPct ? <p className="mt-0.5 text-[11px] line-through" style={{ color: 'var(--store-muted-text)' }}>{formatCurrency(product.compare_price!)}</p> : null}</div>
          <button type="button" onClick={handleAdd} disabled={soldOut} className="catalog-product-action store-button inline-flex shrink-0 items-center justify-center gap-1.5 px-3.5 text-xs font-bold transition-all duration-200 active:scale-95 disabled:cursor-default disabled:opacity-70" style={soldOut ? { background: 'color-mix(in srgb, var(--store-surface) 82%, var(--store-bg))', color: 'var(--store-muted-text)', border: '1px solid var(--store-card-border)', minHeight: '2.5rem' } : { background: added ? 'linear-gradient(145deg, #22c55e, #16a34a)' : 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 76%, black 24%))', color: added ? '#fff' : 'var(--store-primary-contrast)', minHeight: '2.5rem', boxShadow: '0 10px 24px color-mix(in srgb, var(--store-primary) 17%, transparent)' }} aria-label={soldOut ? `${product.name} agotado` : hasOptions ? `Elegir opciones de ${product.name}` : `Agregar ${product.name}`}>
            {soldOut ? <PackageX className="size-3.5" /> : added ? <Check className="size-3.5" /> : hasOptions ? <ShoppingBag className="size-3.5" /> : <Plus className="size-3.5" />}
            <span>{soldOut ? 'Agotado' : added ? 'Listo' : hasOptions ? 'Opciones' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
