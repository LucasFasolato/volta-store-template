import Link from 'next/link'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ProductCatalogGrid } from '@/components/landing/ProductCatalogGrid'
import { COPY } from '@/data/system-copy'
import { PAGE_SIZE_OPTIONS, buildStorefrontHref, type StorefrontRouteState } from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import type { Category, ProductWithImages, StoreTheme } from '@/types/store'

type CatalogSectionProps = { products: ProductWithImages[]; totalFiltered: number; categories: Category[]; theme: StoreTheme; containerClass: string; pathname: string; routeState: StorefrontRouteState; totalPages: number; catalogSize: 'small' | 'medium' | 'large' }

export function CatalogSection({ products, totalFiltered, categories, theme, containerClass, pathname, routeState, totalPages, catalogSize }: CatalogSectionProps) {
  const isSmallCatalog = catalogSize === 'small'
  const activeCategoryName = categories.find((category) => category.slug === routeState.activeCategory)?.name
  const eyebrow = routeState.query
    ? `Resultados para “${routeState.query}”`
    : routeState.activePromotion
      ? 'Promociones'
      : activeCategoryName ?? (routeState.activeBrand ? 'Productos de la marca' : 'Productos')

  const items = products.map((product) => ({
    product,
    href: buildStorefrontHref(pathname, {
      category: routeState.activeCategory,
      brand: routeState.activeBrand,
      promotion: routeState.activePromotion,
      query: routeState.query,
      page: routeState.page,
      pageSize: routeState.pageSize,
      sort: routeState.sort,
      product: product.slug,
    }),
  }))

  return (
    <section id="catalogo" className={cn('pb-[var(--store-space-section)]', isSmallCatalog ? 'pt-5 sm:pt-7' : 'pt-[var(--store-space-section)]')}>
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className={cn('flex items-end justify-between gap-4', isSmallCatalog ? 'mb-4' : 'mb-7')}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>{eyebrow}</p>
            <h2 className={cn('store-heading mt-2 font-semibold tracking-tight', isSmallCatalog ? 'text-2xl sm:text-[1.8rem]' : 'text-3xl')} style={{ color: 'var(--store-text)' }}>{COPY.product.catalog}</h2>
          </div>
          <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums" style={{ color: 'var(--store-primary)', backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--store-primary) 18%, transparent)' }}>{totalFiltered}</span>
        </div>

        {categories.length > 0 ? <div className={cn('-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0', isSmallCatalog ? 'mb-4' : 'mb-7')}><CategoryPill label="Todos" href={buildStorefrontHref(pathname, { brand: routeState.activeBrand, promotion: routeState.activePromotion, query: routeState.query, page: 1, pageSize: routeState.pageSize, sort: routeState.sort })} active={!routeState.activeCategory} />{categories.map((category) => <CategoryPill key={category.id} label={category.name} href={buildStorefrontHref(pathname, { category: category.slug, brand: routeState.activeBrand, promotion: routeState.activePromotion, query: routeState.query, page: 1, pageSize: routeState.pageSize, sort: routeState.sort })} active={routeState.activeCategory === category.slug} />)}</div> : null}

        {totalFiltered === 0 ? <EmptyState icon={SearchX} title={routeState.query ? `No encontramos “${routeState.query}”` : routeState.activePromotion ? 'No hay promociones con estos filtros' : activeCategoryName ? `No encontramos productos en ${activeCategoryName}` : COPY.product.noProducts} description="Probá con otra búsqueda o limpiá los filtros para volver a ver todo el catálogo." action={(routeState.activeCategory || routeState.activeBrand || routeState.activePromotion || routeState.query) ? <Link href={buildStorefrontHref(pathname, { pageSize: routeState.pageSize, sort: routeState.sort })} scroll={false} className="store-button px-5 py-3 text-sm font-semibold" style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}>Limpiar filtros</Link> : undefined} className="border-0" tone="light" /> : <>
          <ProductCatalogGrid items={items} theme={theme} desktopColumns={theme.grid_columns} />
          {(totalPages > 1 || totalFiltered > PAGE_SIZE_OPTIONS[0]) ? <Pagination pathname={pathname} routeState={routeState} totalPages={totalPages} totalFiltered={totalFiltered} /> : null}
        </>}
      </div>
    </section>
  )
}

function Pagination({ pathname, routeState, totalPages, totalFiltered }: { pathname: string; routeState: StorefrontRouteState; totalPages: number; totalFiltered: number }) {
  const shared = { category: routeState.activeCategory, brand: routeState.activeBrand, promotion: routeState.activePromotion, query: routeState.query, sort: routeState.sort }
  return <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
    {totalFiltered > PAGE_SIZE_OPTIONS[0] ? <div className="flex items-center gap-2"><span className="text-xs" style={{ color: 'var(--store-muted-text)' }}>Mostrar</span>{PAGE_SIZE_OPTIONS.map((size) => <Link key={size} href={buildStorefrontHref(pathname, { ...shared, page: 1, pageSize: size })} scroll={false} className="min-w-9 rounded-full px-2.5 py-1.5 text-center text-xs font-semibold" style={routeState.pageSize === size ? { background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' } : { border: '1px solid var(--store-card-border)', color: 'var(--store-soft-text)' }}>{size}</Link>)}</div> : <span />}
    {totalPages > 1 ? <div className="flex items-center gap-2"><PageArrow disabled={routeState.page <= 1} href={buildStorefrontHref(pathname, { ...shared, page: routeState.page - 1, pageSize: routeState.pageSize })}><ChevronLeft className="size-4" /></PageArrow><span className="text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>{routeState.page} / {totalPages}</span><PageArrow disabled={routeState.page >= totalPages} href={buildStorefrontHref(pathname, { ...shared, page: routeState.page + 1, pageSize: routeState.pageSize })}><ChevronRight className="size-4" /></PageArrow></div> : null}
  </div>
}

function PageArrow({ disabled, href, children }: { disabled: boolean; href: string; children: React.ReactNode }) {
  if (disabled) return <span className="flex size-9 items-center justify-center rounded-full opacity-25" style={{ border: '1px solid var(--store-card-border)', color: 'var(--store-text)' }}>{children}</span>
  return <Link href={href} scroll={false} className="flex size-9 items-center justify-center rounded-full" style={{ border: '1px solid var(--store-card-border)', color: 'var(--store-text)' }}>{children}</Link>
}

function CategoryPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return <Link href={href} scroll={false} className="whitespace-nowrap px-4 py-2 text-sm font-medium transition active:scale-[0.97]" style={active ? { borderRadius: 'var(--store-button-radius)', background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' } : { borderRadius: 'var(--store-button-radius)', backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)', color: 'var(--store-soft-text)', border: '1px solid var(--store-card-border)' }}>{label}</Link>
}
