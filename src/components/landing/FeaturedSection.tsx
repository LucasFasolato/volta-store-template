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
    <section className="py-16 sm:py-20">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'color-mix(in srgb, var(--store-text) 50%, transparent)' }}
            >
              Seleccion curada
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--store-text)' }}>
              {COPY.product.featured}
            </h2>
          </div>

          <a
            href="#catalogo"
            className="hidden items-center text-sm font-medium sm:inline-flex"
            style={{ color: 'var(--store-primary)' }}
          >
            Ir al catalogo
            <ArrowRight className="ml-2 size-4" />
          </a>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="w-[17rem] shrink-0 sm:w-auto">
              <ProductCard product={product} theme={theme} onClick={() => onSelectProduct(product)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
