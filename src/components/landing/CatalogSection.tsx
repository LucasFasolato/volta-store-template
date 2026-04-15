import Link from 'next/link'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ProductCard } from '@/components/product/ProductCard'
import { COPY } from '@/data/system-copy'
import {
  PAGE_SIZE_OPTIONS,
  buildStorefrontHref,
  type StorefrontRouteState,
} from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import { GRID_COLS_CLASS } from '@/lib/utils/theme'
import type { Category, ProductWithImages, StoreTheme } from '@/types/store'

type CatalogSectionProps = {
  products: ProductWithImages[]
  totalFiltered: number
  categories: Category[]
  theme: StoreTheme
  containerClass: string
  pathname: string
  routeState: StorefrontRouteState
  totalPages: number
}

export function CatalogSection({
  products,
  totalFiltered,
  categories,
  theme,
  containerClass,
  pathname,
  routeState,
  totalPages,
}: CatalogSectionProps) {
  const gridClass = GRID_COLS_CLASS[theme.grid_columns] ?? GRID_COLS_CLASS[2]
  const activeCategoryName = categories.find((category) => category.slug === routeState.activeCategory)?.name

  return (
    <section id="catalogo" className="py-[var(--store-space-section)]">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Todos los productos
            </p>
            <h2
              className="store-heading mt-3 text-3xl font-semibold tracking-tight sm:text-[2.2rem]"
              style={{ color: 'var(--store-text)' }}
            >
              {COPY.product.catalog}
            </h2>
          </div>
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold tabular-nums"
            style={{
              color: 'var(--store-primary)',
              backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--store-primary) 18%, transparent)',
            }}
          >
            {totalFiltered} {totalFiltered === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        {categories.length > 0 ? (
          <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <CategoryPill
              label="Todos"
              href={buildStorefrontHref(pathname, {
                category: null,
                page: 1,
                pageSize: routeState.pageSize,
              })}
              active={!routeState.activeCategory}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category.id}
                label={category.name}
                href={buildStorefrontHref(pathname, {
                  category: category.slug,
                  page: 1,
                  pageSize: routeState.pageSize,
                })}
                active={routeState.activeCategory === category.slug}
              />
            ))}
          </div>
        ) : null}

        {totalFiltered === 0 ? (
          <EmptyState
            icon={SearchX}
            title={
              activeCategoryName
                ? `No encontramos productos en ${activeCategoryName}`
                : COPY.product.noProducts
            }
            description={
              activeCategoryName
                ? COPY.product.noProductsInCategoryDescription
                : COPY.product.noProductsDescription
            }
            action={
              routeState.activeCategory ? (
                <Link
                  href={buildStorefrontHref(pathname, { pageSize: routeState.pageSize })}
                  scroll={false}
                  className="store-button px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                    color: 'var(--store-primary-contrast)',
                  }}
                >
                  Volver al catalogo
                </Link>
              ) : undefined
            }
            className="border-0"
            tone="light"
          />
        ) : (
          <>
            <div className={cn('grid gap-5 sm:gap-6', gridClass)}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  productHref={buildStorefrontHref(pathname, {
                    category: routeState.activeCategory,
                    page: routeState.page,
                    pageSize: routeState.pageSize,
                    product: product.slug,
                  })}
                  theme={theme}
                />
              ))}
            </div>

            {(totalPages > 1 || totalFiltered > PAGE_SIZE_OPTIONS[0]) ? (
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--store-muted-text)' }}>
                    Mostrar
                  </span>
                  <div className="flex gap-1.5">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <Link
                        key={size}
                        href={buildStorefrontHref(pathname, {
                          category: routeState.activeCategory,
                          page: 1,
                          pageSize: size,
                        })}
                        scroll={false}
                        className="min-w-[2.5rem] px-3 py-1.5 text-center text-[12px] font-semibold transition duration-200 active:scale-95"
                        style={{
                          borderRadius: 'var(--store-button-radius)',
                          ...(routeState.pageSize === size
                            ? {
                                background:
                                  'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                                color: 'var(--store-primary-contrast)',
                              }
                            : {
                                backgroundColor:
                                  'color-mix(in srgb, var(--store-surface) 82%, transparent)',
                                color: 'var(--store-soft-text)',
                                border: '1px solid var(--store-card-border)',
                              }),
                        }}
                      >
                        {size}
                      </Link>
                    ))}
                  </div>
                </div>

                {totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    {routeState.page > 1 ? (
                      <Link
                        href={buildStorefrontHref(pathname, {
                          category: routeState.activeCategory,
                          page: routeState.page - 1,
                          pageSize: routeState.pageSize,
                        })}
                        scroll={false}
                        className="flex size-9 items-center justify-center rounded-full transition duration-200 hover:-translate-y-0.5 active:scale-95"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
                          color: 'var(--store-text)',
                          border: '1px solid var(--store-card-border)',
                        }}
                        aria-label="Pagina anterior"
                      >
                        <ChevronLeft className="size-4" />
                      </Link>
                    ) : (
                      <span
                        className="flex size-9 items-center justify-center rounded-full opacity-30"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
                          color: 'var(--store-text)',
                          border: '1px solid var(--store-card-border)',
                        }}
                        aria-hidden="true"
                      >
                        <ChevronLeft className="size-4" />
                      </span>
                    )}

                    <PageNumbers pathname={pathname} routeState={routeState} totalPages={totalPages} />

                    {routeState.page < totalPages ? (
                      <Link
                        href={buildStorefrontHref(pathname, {
                          category: routeState.activeCategory,
                          page: routeState.page + 1,
                          pageSize: routeState.pageSize,
                        })}
                        scroll={false}
                        className="flex size-9 items-center justify-center rounded-full transition duration-200 hover:-translate-y-0.5 active:scale-95"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
                          color: 'var(--store-text)',
                          border: '1px solid var(--store-card-border)',
                        }}
                        aria-label="Pagina siguiente"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    ) : (
                      <span
                        className="flex size-9 items-center justify-center rounded-full opacity-30"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
                          color: 'var(--store-text)',
                          border: '1px solid var(--store-card-border)',
                        }}
                        aria-hidden="true"
                      >
                        <ChevronRight className="size-4" />
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

function PageNumbers({
  pathname,
  routeState,
  totalPages,
}: {
  pathname: string
  routeState: StorefrontRouteState
  totalPages: number
}) {
  const pages: Array<number | 'ellipsis'> = []
  const delta = 1

  for (let index = 1; index <= totalPages; index += 1) {
    if (
      index === 1 ||
      index === totalPages ||
      (index >= routeState.page - delta && index <= routeState.page + delta)
    ) {
      pages.push(index)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <div className="flex items-center gap-1">
      {pages.map((item, idx) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-1 text-[13px]"
            style={{ color: 'var(--store-muted-text)' }}
          >
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={buildStorefrontHref(pathname, {
              category: routeState.activeCategory,
              page: item,
              pageSize: routeState.pageSize,
            })}
            scroll={false}
            className="flex size-9 items-center justify-center rounded-full text-[13px] font-semibold transition duration-200 active:scale-95"
            style={
              item === routeState.page
                ? {
                    background:
                      'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                    color: 'var(--store-primary-contrast)',
                    boxShadow: '0 8px 20px color-mix(in srgb, var(--store-primary) 20%, transparent)',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: 'var(--store-soft-text)',
                  }
            }
            aria-label={`Ir a pagina ${item}`}
            aria-current={item === routeState.page ? 'page' : undefined}
          >
            {item}
          </Link>
        ),
      )}
    </div>
  )
}

function CategoryPill({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="whitespace-nowrap px-4 py-2.5 text-sm font-medium transition duration-200 active:scale-[0.97] hover:-translate-y-0.5"
      style={
        active
          ? {
              borderRadius: 'var(--store-button-radius)',
              background:
                'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
              color: 'var(--store-primary-contrast)',
              boxShadow: '0 12px 26px color-mix(in srgb, var(--store-primary) 20%, transparent)',
            }
          : {
              borderRadius: 'var(--store-button-radius)',
              backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
              color: 'var(--store-soft-text)',
              border: '1px solid var(--store-card-border)',
            }
      }
    >
      {label}
    </Link>
  )
}
