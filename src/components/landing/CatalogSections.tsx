import { CatalogProductCard } from '@/components/product/CatalogProductCard'
import { buildStorefrontHref } from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import { GRID_COLS_CLASS } from '@/lib/utils/theme'
import type { Category, ProductWithImages, StoreTheme } from '@/types/store'

type OrderedProduct = ProductWithImages & { category_sort_order?: number }

type Props = {
  products: ProductWithImages[]
  categories: Category[]
  theme: StoreTheme
  containerClass: string
  pathname: string
}

export function CatalogSections({ products, categories, theme, containerClass, pathname }: Props) {
  const groups = [
    ...categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      products: (products as OrderedProduct[])
        .filter((product) => product.category_id === category.id)
        .sort((a, b) => (a.category_sort_order ?? a.sort_order) - (b.category_sort_order ?? b.sort_order)),
    })),
    {
      id: 'uncategorized',
      slug: 'otros',
      name: 'Otros productos',
      products: (products as OrderedProduct[])
        .filter((product) => !product.category_id)
        .sort((a, b) => (a.category_sort_order ?? a.sort_order) - (b.category_sort_order ?? b.sort_order)),
    },
  ].filter((group) => group.products.length > 0)

  return (
    <section id="catalogo" className="pb-[var(--store-space-section)] pt-[var(--store-space-section)]">
      <div className={cn('mx-auto space-y-12 px-4 sm:px-6', containerClass)}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Catálogo</p>
          <h2 className="store-heading mt-2 text-3xl font-semibold tracking-tight" style={{ color: 'var(--store-text)' }}>Explorá por categoría</h2>
        </div>

        {groups.map((group) => {
          const gridClass = GRID_COLS_CLASS[theme.grid_columns] ?? GRID_COLS_CLASS[2]
          return (
            <section key={group.id} id={`categoria-${group.slug}`} className="scroll-mt-24">
              <div className="mb-5 flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: 'var(--store-card-border)' }}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>Categoría</p>
                  <h3 className="store-heading mt-1 text-2xl font-semibold" style={{ color: 'var(--store-text)' }}>{group.name}</h3>
                </div>
                <span className="rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums" style={{ color: 'var(--store-primary)', backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--store-primary) 18%, transparent)' }}>{group.products.length}</span>
              </div>
              <div className={cn('grid gap-3 sm:gap-5', gridClass)}>
                {group.products.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    productHref={buildStorefrontHref(pathname, { product: product.slug })}
                    theme={theme}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
