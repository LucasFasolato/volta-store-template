'use client'

import Image from 'next/image'
import { Eye, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/format'
import { COPY } from '@/data/system-copy'
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
      className="group rounded-[30px] p-3 transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 85%, white 15%), color-mix(in srgb, var(--store-bg) 92%, var(--store-text) 8%))',
        boxShadow: 'var(--store-shadow)',
        border: '1px solid var(--store-border)',
        outlineColor: 'var(--store-primary)',
      }}
      aria-label={`Ver detalle de ${product.name}`}
    >
      <div className={cn('relative overflow-hidden rounded-[24px]', imageRatio)}>
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 24vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs"
            style={{
              backgroundColor: 'var(--store-surface-soft)',
              color: 'color-mix(in srgb, var(--store-text) 45%, transparent)',
            }}
          >
            Sin imagen
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--store-text) 10%, transparent))',
          }}
        />

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

        <div className="absolute inset-x-3 bottom-3 hidden items-center justify-between gap-2 sm:flex">
          <span
            className="inline-flex items-center rounded-full px-3 py-2 text-xs font-medium backdrop-blur-xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--store-bg) 64%, transparent)',
              color: 'var(--store-text)',
              border: '1px solid var(--store-border)',
            }}
          >
            <Eye className="mr-1.5 size-3.5" />
            Ver detalle
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition hover:opacity-95 active:scale-[0.98]"
            style={{
              background:
                'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
              color: 'var(--store-bg)',
            }}
            aria-label={COPY.cart.addToCart}
          >
            <ShoppingBag className="mr-1.5 size-3.5" />
            {COPY.cart.addToCart}
          </button>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <p
          className="line-clamp-2 text-sm font-semibold leading-6 sm:text-[15px]"
          style={{ color: 'var(--store-text)' }}
        >
          {product.name}
        </p>

        {product.short_description ? (
          <p
            className="mt-1 line-clamp-2 text-sm leading-6"
            style={{ color: 'color-mix(in srgb, var(--store-text) 62%, transparent)' }}
          >
            {product.short_description}
          </p>
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold" style={{ color: 'var(--store-primary)' }}>
              {formatCurrency(product.price)}
            </p>
            {product.compare_price && product.compare_price > product.price ? (
              <p
                className="mt-0.5 text-xs line-through"
                style={{ color: 'color-mix(in srgb, var(--store-text) 42%, transparent)' }}
              >
                {formatCurrency(product.compare_price)}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex shrink-0 items-center rounded-full px-4 py-2 text-xs font-semibold transition active:scale-[0.98] sm:hidden"
            style={{
              background:
                'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
              color: 'var(--store-bg)',
            }}
          >
            <ShoppingBag className="mr-1.5 size-3.5" />
            {COPY.cart.addToCart}
          </button>
        </div>
      </div>
    </article>
  )
}
