'use client'

import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

export type RelatedProductLink = {
  product: ProductWithImages
  href: string
}

export function RelatedProductsStrip({
  items,
  onSelect,
  title = 'También te puede servir',
}: {
  items: RelatedProductLink[]
  onSelect: (href: string) => void
  title?: string
}) {
  if (items.length === 0) return null

  return (
    <section className="mt-8 border-t pt-6" style={{ borderColor: 'var(--store-card-border)' }} aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
            Descubrí algo más
          </p>
          <h3 className="store-heading mt-1 text-lg font-semibold" style={{ color: 'var(--store-text)' }}>
            {title}
          </h3>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(({ product, href }) => {
          const image = product.images?.[0]
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(href)}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
              style={{
                borderColor: 'var(--store-card-border)',
                background: 'color-mix(in srgb, var(--store-surface) 78%, transparent)',
              }}
              aria-label={`Ver ${product.name}`}
            >
              <div
                className="relative size-14 shrink-0 overflow-hidden rounded-xl"
                style={{ background: 'color-mix(in srgb, var(--store-bg) 72%, var(--store-surface))' }}
              >
                {image ? (
                  <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold" style={{ color: 'var(--store-primary)' }}>
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--store-muted-text)' }}>
                  {product.brand?.name || product.category?.name || 'Producto'}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-4" style={{ color: 'var(--store-text)' }}>
                  {product.name}
                </p>
                <p className="mt-1 text-xs font-bold" style={{ color: 'var(--store-primary)' }}>
                  {formatCurrency(product.price)}
                </p>
              </div>

              <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: 'var(--store-muted-text)' }} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
