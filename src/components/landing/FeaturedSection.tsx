import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { COPY } from '@/data/system-copy'
import { cn } from '@/lib/utils'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type FeaturedSectionProps = {
  products: ProductWithImages[]
  theme: StoreTheme
  containerClass: string
  onSelectProduct: (product: ProductWithImages) => void
}

export function FeaturedSection({
  products,
  theme,
  containerClass,
  onSelectProduct,
}: FeaturedSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="py-[var(--store-space-section)]">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div
          className="mb-8 flex flex-col gap-5 rounded-[calc(var(--store-card-radius)*0.9)] p-6 sm:flex-row sm:items-end sm:justify-between"
          style={{
            background:
              'linear-gradient(145deg, color-mix(in srgb, var(--store-surface) 88%, white 12%), color-mix(in srgb, var(--store-bg) 94%, transparent))',
            border: '1px solid var(--store-card-border)',
          }}
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--store-muted-text)' }}>
              Seleccion curada
            </p>
            <h2 className="store-heading mt-3 text-3xl font-semibold tracking-tight sm:text-[2.2rem]" style={{ color: 'var(--store-text)' }}>
              {COPY.product.featured}
            </h2>
            <p className="mt-3 text-sm leading-7 sm:text-[15px]" style={{ color: 'var(--store-soft-text)' }}>
              Piezas con mejor traccion visual, listas para abrir conversacion y acelerar la conversion.
            </p>
          </div>

          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 text-sm font-semibold transition"
            style={{ color: 'var(--store-primary)' }}
          >
            Ir al catalogo
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="w-[18rem] shrink-0 sm:w-auto">
              <ProductCard product={product} theme={theme} onClick={() => onSelectProduct(product)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
