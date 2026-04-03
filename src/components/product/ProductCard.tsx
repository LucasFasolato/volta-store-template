'use client'

import Image from 'next/image'
import { ArrowUpRight, ShoppingBag } from 'lucide-react'
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

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: coverImage?.url ?? null,
    })
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
      className="store-card group flex h-full flex-col overflow-hidden p-[var(--store-card-padding)] transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        outlineColor: 'var(--store-primary)',
      }}
      aria-label={`Ver detalle de ${product.name}`}
    >
      <div
        className={`relative overflow-hidden rounded-[calc(var(--store-card-radius)*0.88)] ${imageRatio}`}
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 82%, white 18%), color-mix(in srgb, var(--store-bg) 92%, transparent))',
        }}
      >
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.045]"
            sizes="(max-width: 768px) 70vw, (max-width: 1280px) 33vw, 24vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
            Sin imagen
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 6%, transparent), transparent 40%, color-mix(in srgb, var(--store-text) 18%, transparent))',
          }}
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
          {product.badge ? (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--store-bg) 76%, transparent)',
                color: 'var(--store-text)',
                border: '1px solid var(--store-card-border)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {product.badge}
            </span>
          ) : (
            <span />
          )}

          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--store-surface) 72%, transparent)',
              color: 'var(--store-soft-text)',
              border: '1px solid var(--store-card-border)',
              backdropFilter: 'blur(16px)',
            }}
          >
            Ver
            <ArrowUpRight className="size-3" />
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3">
          <div
            className="flex items-end justify-between gap-3 rounded-[calc(var(--store-card-radius)*0.72)] p-3"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 68%, transparent), color-mix(in srgb, var(--store-bg) 80%, var(--store-surface) 20%))',
              border: '1px solid var(--store-card-border)',
              backdropFilter: 'blur(22px)',
            }}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                Precio
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight" style={{ color: 'var(--store-text)' }}>
                {formatCurrency(product.price)}
              </p>
              {product.compare_price && product.compare_price > product.price ? (
                <p className="mt-1 text-xs line-through" style={{ color: 'var(--store-muted-text)' }}>
                  {formatCurrency(product.compare_price)}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="store-button inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background:
                  'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                color: 'var(--store-bg)',
                boxShadow: '0 14px 28px color-mix(in srgb, var(--store-primary) 18%, transparent)',
              }}
              aria-label={COPY.cart.addToCart}
            >
              <ShoppingBag className="size-3.5" />
              <span className="hidden sm:block">{COPY.cart.addToCart}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        {product.category?.name ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--store-muted-text)' }}>
            {product.category.name}
          </p>
        ) : null}

        <p className="store-heading mt-2 line-clamp-2 text-lg font-semibold leading-tight" style={{ color: 'var(--store-text)' }}>
          {product.name}
        </p>

        {product.short_description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
            {product.short_description}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-muted-text)' }}>
            Abre el detalle para revisar variantes, materiales o informacion adicional.
          </p>
        )}
      </div>
    </article>
  )
}
