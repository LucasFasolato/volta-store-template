'use client'

import { SearchX } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ProductCard } from '@/components/product/ProductCard'
import { COPY } from '@/data/system-copy'
import { cn } from '@/lib/utils'
import { GRID_COLS_CLASS } from '@/lib/utils/theme'
import type { Category, ProductWithImages, StoreTheme } from '@/types/store'

type CatalogSectionProps = {
  products: ProductWithImages[]
  allProducts: ProductWithImages[]
  categories: Category[]
  theme: StoreTheme
  containerClass: string
  activeCategory: string | null
  onCategoryChange: (slug: string | null) => void
  onSelectProduct: (product: ProductWithImages) => void
}

export function CatalogSection({
  products,
  allProducts,
  categories,
  theme,
  containerClass,
  activeCategory,
  onCategoryChange,
  onSelectProduct,
}: CatalogSectionProps) {
  const gridClass = GRID_COLS_CLASS[theme.grid_columns] ?? GRID_COLS_CLASS[2]
  const activeCategoryName = categories.find((category) => category.slug === activeCategory)?.name

  return (
    <section id="catalogo" className="py-16 sm:py-20">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'color-mix(in srgb, var(--store-text) 50%, transparent)' }}
            >
              Catalogo
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--store-text)' }}>
              {COPY.product.catalog}
            </h2>
          </div>
          <div
            className="rounded-full border px-4 py-2 text-sm"
            style={{
              borderColor: 'var(--store-border)',
              color: 'color-mix(in srgb, var(--store-text) 70%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--store-bg) 82%, white 18%)',
            }}
          >
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <CategoryPill
              label="Todos"
              active={!activeCategory}
              onClick={() => onCategoryChange(null)}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category.id}
                label={category.name}
                active={activeCategory === category.slug}
                onClick={() => onCategoryChange(category.slug)}
              />
            ))}
          </div>
        ) : null}

        {products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={activeCategoryName ? `No encontramos productos en ${activeCategoryName}` : COPY.product.noProducts}
            description={
              activeCategoryName
                ? 'Prueba quitando el filtro o agrega productos a esta categoria desde el admin.'
                : 'Cuando cargues productos activos apareceran aqui con su portada, precio y acceso rapido al pedido.'
            }
            action={
              activeCategory ? (
                <button
                  type="button"
                  onClick={() => onCategoryChange(null)}
                  className="rounded-full px-5 py-3 text-sm font-semibold transition hover:opacity-95"
                  style={{
                    background:
                      'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                    color: 'var(--store-bg)',
                  }}
                >
                  Ver todos los productos
                </button>
              ) : undefined
            }
            className="border-0"
            tone="light"
          />
        ) : (
          <div className={cn('grid gap-5 sm:gap-6', gridClass)}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                theme={theme}
                onClick={() => onSelectProduct(product)}
              />
            ))}
          </div>
        )}

        {products.length > 0 && allProducts.length !== products.length ? (
          <p
            className="mt-5 text-sm"
            style={{ color: 'color-mix(in srgb, var(--store-text) 58%, transparent)' }}
          >
            Mostrando {products.length} de {allProducts.length} productos activos.
          </p>
        ) : null}
      </div>
    </section>
  )
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.98]"
      style={
        active
          ? {
              background:
                'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
              color: 'var(--store-bg)',
            }
          : {
              backgroundColor: 'color-mix(in srgb, var(--store-bg) 82%, white 18%)',
              color: 'var(--store-text)',
              border: '1px solid var(--store-border)',
            }
      }
    >
      {label}
    </button>
  )
}
