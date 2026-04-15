import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { COPY } from '@/data/system-copy'
import { buildStorefrontHref, type StorefrontRouteState } from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type FeaturedSectionProps = {
  products: ProductWithImages[]
  pathname: string
  routeState: StorefrontRouteState
  theme: StoreTheme
  containerClass: string
  productCount: number
}

export function FeaturedSection({
  products,
  pathname,
  routeState,
  theme,
  containerClass,
  productCount,
}: FeaturedSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="py-[var(--store-space-section)]">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Para comprar mas rapido
            </p>
            <h2
              className="store-heading mt-3 text-3xl font-semibold tracking-tight sm:text-[2.2rem]"
              style={{ color: 'var(--store-text)' }}
            >
              {COPY.product.featured}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
              {productCount <= 8
                ? 'Una seleccion breve para que encuentres algo rapido y sigas directo al catalogo.'
                : 'Arranca por aqui si quieres ver opciones clave antes de recorrer todo el catalogo.'}
            </p>
          </div>

          <a
            href="#catalogo"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold transition hover:gap-3"
            style={{ color: 'var(--store-primary)' }}
          >
            Ver todos
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="w-[18rem] shrink-0 sm:w-auto">
              <ProductCard
                product={product}
                productHref={buildStorefrontHref(pathname, {
                  category: routeState.activeCategory,
                  page: routeState.page,
                  pageSize: routeState.pageSize,
                  product: product.slug,
                })}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
