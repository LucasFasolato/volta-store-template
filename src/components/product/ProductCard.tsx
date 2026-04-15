'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, ShoppingBag } from 'lucide-react'
import { COPY } from '@/data/system-copy'
import { useCartStore } from '@/lib/stores/cart'
import { normalizeCardLayout } from '@/lib/utils/card-layout'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type ProductCardProps = {
  product: ProductWithImages
  productHref: string
  theme: StoreTheme
}

export function ProductCard({ product, productHref, theme }: ProductCardProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const coverImage = product.images?.[0]
  const hasOptions = (product.options?.length ?? 0) > 0
  const [added, setAdded] = useState(false)
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current)
    }
  }, [])

  function openProduct() {
    router.push(productHref, { scroll: false })
  }

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (hasOptions) {
      openProduct()
      return
    }

    addItem({
      cartItemKey: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: coverImage?.url ?? null,
    })

    if (addedTimer.current) clearTimeout(addedTimer.current)
    setAdded(true)
    addedTimer.current = setTimeout(() => setAdded(false), 1500)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProduct()
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

  const cardModel = normalizeCardLayout(theme.card_layout)
  const summary = product.short_description || (hasOptions ? product.options!.map((option) => option.name).join(' / ') : null)
  const buttonLabel = hasOptions ? 'Ver opciones' : 'Agregar'

  const actionButton = (
    <button
      type="button"
      onClick={handleAddToCart}
      className="store-button inline-flex shrink-0 items-center justify-center gap-1.5 px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95"
      style={{
        background: added
          ? 'linear-gradient(145deg, #22c55e, #16a34a)'
          : 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
        color: added ? '#ffffff' : 'var(--store-primary-contrast)',
        boxShadow: added
          ? '0 8px 20px rgba(34,197,94,0.22)'
          : '0 10px 24px color-mix(in srgb, var(--store-primary) 18%, transparent)',
        minHeight: '2.4rem',
        paddingTop: '0.55rem',
        paddingBottom: '0.55rem',
        transform: added ? 'scale(1.03)' : undefined,
      }}
      aria-label={hasOptions ? `Elegir opciones de ${product.name}` : COPY.cart.addToCart}
    >
      {added ? (
        <>
          <Check className="size-3.5" />
          <span className="hidden sm:inline">Listo</span>
        </>
      ) : (
        <>
          <ShoppingBag className="size-3.5" />
          <span>{buttonLabel}</span>
        </>
      )}
    </button>
  )

  const badge = product.badge ? (
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
  ) : null

  const placeholder = (
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
  )

  const imageBlock = (
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
        placeholder
      )}
      {coverImage ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              cardModel === 'visual'
                ? 'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 78%, transparent) 0%, color-mix(in srgb, var(--store-bg) 18%, transparent) 54%, transparent 100%)'
                : 'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 20%, transparent) 0%, transparent 38%)',
          }}
        />
      ) : null}
      {badge}
    </div>
  )

  if (cardModel === 'compact') {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={handleKeyDown}
        className="store-card group flex h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ outlineColor: 'var(--store-primary)' }}
        aria-label={`Ver detalle de ${product.name}`}
      >
        <div className="relative w-[7.5rem] shrink-0 overflow-hidden">{imageBlock}</div>

        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{
            padding: 'var(--store-card-padding)',
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
            className="store-heading mt-1 line-clamp-2 text-sm font-semibold leading-snug"
            style={{ color: 'var(--store-text)' }}
          >
            {product.name}
          </p>

          {summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>
              {summary}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-base font-semibold tracking-tight" style={{ color: 'var(--store-primary)' }}>
                {formatCurrency(product.price)}
              </p>
              {discountPct ? (
                <p className="mt-0.5 text-xs line-through" style={{ color: 'var(--store-muted-text)' }}>
                  {formatCurrency(product.compare_price!)}
                </p>
              ) : null}
            </div>
            {actionButton}
          </div>
        </div>
      </article>
    )
  }

  if (cardModel === 'visual') {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={handleKeyDown}
        className="store-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ outlineColor: 'var(--store-primary)' }}
        aria-label={`Ver detalle de ${product.name}`}
      >
        <div className="relative">
          {imageBlock}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-4">
            <div className="min-w-0">
              {product.category?.name ? (
                <p
                  className="truncate text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: 'color-mix(in srgb, var(--store-text) 72%, white 28%)' }}
                >
                  {product.category.name}
                </p>
              ) : null}
              <p
                className="store-heading mt-1 line-clamp-2 text-base font-semibold leading-tight"
                style={{ color: 'var(--store-text)' }}
              >
                {product.name}
              </p>
            </div>
            <div
              className="rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{
                background: 'color-mix(in srgb, var(--store-surface) 84%, transparent)',
                color: 'var(--store-text)',
                border: '1px solid var(--store-card-border)',
                backdropFilter: 'blur(14px)',
              }}
            >
              {formatCurrency(product.price)}
            </div>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col"
          style={{
            padding: 'var(--store-card-padding)',
            paddingTop: 'calc(var(--store-card-padding) * 0.85)',
          }}
        >
          {summary ? (
            <p className="line-clamp-2 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>
              {summary}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              {discountPct ? (
                <p className="text-xs line-through" style={{ color: 'var(--store-muted-text)' }}>
                  {formatCurrency(product.compare_price!)}
                </p>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                  {hasOptions ? 'Personalizable' : 'Listo para pedir'}
                </p>
              )}
            </div>
            {actionButton}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openProduct}
      onKeyDown={handleKeyDown}
      className="store-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ outlineColor: 'var(--store-primary)' }}
      aria-label={`Ver detalle de ${product.name}`}
    >
      <div className="relative">
        {imageBlock}
        {coverImage ? (
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
        ) : null}
      </div>

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

        {summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>
            {summary}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-base font-semibold tracking-tight sm:text-lg" style={{ color: 'var(--store-primary)' }}>
              {formatCurrency(product.price)}
            </p>
            {discountPct ? (
              <p className="mt-0.5 text-xs line-through" style={{ color: 'var(--store-muted-text)' }}>
                {formatCurrency(product.compare_price!)}
              </p>
            ) : null}
          </div>

          {actionButton}
        </div>
      </div>
    </article>
  )
}
