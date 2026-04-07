'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Check, ShoppingBag } from 'lucide-react'
import { COPY } from '@/data/system-copy'
import { useCartStore } from '@/lib/stores/cart'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type ProductCardProps = {
  product: ProductWithImages
  theme: StoreTheme
  onClick: () => void
}

export function ProductCard({ product, theme, onClick }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const coverImage = product.images?.[0]
  const hasOptions = (product.options?.length ?? 0) > 0
  const [added, setAdded] = useState(false)
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (hasOptions) {
      onClick()
      return
    }
    addItem({
      cartItemKey: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: coverImage?.url ?? null,
    })
    // Brief "added" feedback — no useEffect needed, fires inside event handler
    if (addedTimer.current) clearTimeout(addedTimer.current)
    setAdded(true)
    addedTimer.current = setTimeout(() => setAdded(false), 1500)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  const imageRatio =
    theme.image_ratio === '1:1'
      ? 'aspect-square'
      : theme.image_ratio === '3:4'
        ? 'aspect-[3/4]'
        : theme.image_ratio === '16:9'
          ? 'aspect-video'
          : 'aspect-[4/5]'

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="store-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ outlineColor: 'var(--store-primary)' }}
      aria-label={`Ver detalle de ${product.name}`}
    >
      {/* ── Image ── */}
      <div
        className={`relative w-full overflow-hidden ${imageRatio}`}
        style={{
          background: coverImage
            ? 'var(--store-surface)'
            : 'linear-gradient(135deg, color-mix(in srgb, var(--store-primary) 9%, var(--store-surface)), color-mix(in srgb, var(--store-accent) 11%, var(--store-surface)))',
        }}
      >
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 28vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex size-14 items-center justify-center rounded-2xl text-xl font-bold"
              style={{
                background: 'color-mix(in srgb, var(--store-primary) 14%, transparent)',
                color: 'var(--store-primary)',
                border: '1px solid color-mix(in srgb, var(--store-primary) 22%, transparent)',
              }}
            >
              {product.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Bottom scrim */}
        {coverImage ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 20%, transparent) 0%, transparent 38%)',
            }}
          />
        ) : null}

        {/* Badge */}
        {product.badge ? (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              background: 'var(--store-primary)',
              color: 'var(--store-primary-contrast)',
            }}
          >
            {product.badge}
          </span>
        ) : discountPct ? (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{
              background: 'color-mix(in srgb, var(--store-bg) 82%, transparent)',
              color: 'var(--store-text)',
              border: '1px solid var(--store-card-border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            -{discountPct}%
          </span>
        ) : null}

        {/* Hover overlay — fade + pill slides up */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-250 group-hover:opacity-100"
          style={{ background: 'color-mix(in srgb, var(--store-primary) 10%, transparent)' }}
        >
          <span
            className="translate-y-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-transform duration-250 group-hover:translate-y-0"
            style={{
              background: 'var(--store-primary)',
              color: 'var(--store-primary-contrast)',
              boxShadow: '0 8px 20px color-mix(in srgb, var(--store-primary) 28%, transparent)',
            }}
          >
            Ver detalle
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="flex flex-1 flex-col"
        style={{
          padding: 'var(--store-card-padding)',
          paddingTop: 'calc(var(--store-card-padding) * 0.75)',
        }}
      >
        {product.category?.name ? (
          <p
            className="truncate text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--store-muted-text)' }}
          >
            {product.category.name}
          </p>
        ) : null}

        <p
          className="store-heading mt-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-[15px]"
          style={{ color: 'var(--store-text)' }}
        >
          {product.name}
        </p>

        {product.short_description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>
            {product.short_description}
          </p>
        ) : hasOptions ? (
          <p className="mt-2 text-xs" style={{ color: 'var(--store-muted-text)' }}>
            {product.options!.map((o) => o.name).join(' · ')}
          </p>
        ) : null}

        {/* ── Price + CTA ── */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-base font-semibold tracking-tight sm:text-lg" style={{ color: 'var(--store-text)' }}>
              {formatCurrency(product.price)}
            </p>
            {discountPct ? (
              <p className="mt-0.5 text-xs line-through" style={{ color: 'var(--store-muted-text)' }}>
                {formatCurrency(product.compare_price!)}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="store-button inline-flex shrink-0 items-center gap-1.5 px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95"
            style={{
              background: added
                ? 'linear-gradient(145deg, #22c55e, #16a34a)'
                : 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
              color: added ? '#ffffff' : 'var(--store-primary-contrast)',
              boxShadow: added
                ? '0 8px 20px rgba(34,197,94,0.22)'
                : '0 10px 24px color-mix(in srgb, var(--store-primary) 18%, transparent)',
              minHeight: '2.25rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              transform: added ? 'scale(1.04)' : undefined,
            }}
            aria-label={hasOptions ? `Elegir opciones de ${product.name}` : COPY.cart.addToCart}
          >
            {added ? (
              <>
                <Check className="size-3.5" />
                <span className="hidden sm:inline">¡Listo!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-3.5" />
                {hasOptions ? (
                  'Elegir'
                ) : (
                  <span className="hidden sm:inline">Agregar</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
