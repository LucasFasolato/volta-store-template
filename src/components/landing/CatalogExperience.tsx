'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCatalogGrid } from '@/components/landing/ProductCatalogGrid'
import { CatalogProductCard } from '@/components/product/CatalogProductCard'
import { getProductDiscountPercent, isProductOnPromotion } from '@/lib/products/promotion'
import { isProductSoldOut } from '@/lib/products/availability'
import {
  STOREFRONT_SORT_OPTIONS,
  buildStorefrontHref,
  type StorefrontRouteState,
  type StorefrontSort,
} from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import { GRID_COLS_CLASS } from '@/lib/utils/theme'
import type { Brand, Category, ProductWithImages, StoreTheme } from '@/types/store'

type Props = {
  products: ProductWithImages[]
  categories: Category[]
  brands: Brand[]
  pathname: string
  routeState: StorefrontRouteState
  theme: StoreTheme
  containerClass: string
  catalogMode: 'all' | 'sections' | 'navigation'
  hasPromotions: boolean
  showSearch: boolean
  showCategories: boolean
  showBrands: boolean
  showSort: boolean
}

type OrderedProduct = ProductWithImages & { category_sort_order?: number }

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

function matchesSearch(product: ProductWithImages, query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true
  const haystack = normalize([
    product.name,
    product.sku,
    product.brand?.name,
    product.category?.name,
    product.short_description,
    product.description,
    ...product.options.flatMap((option) => option.values),
  ].filter(Boolean).join(' '))
  return tokens.every((token) => haystack.includes(token))
}

function sortProducts(products: ProductWithImages[], sort: StorefrontSort, categorySelected: boolean, promotionSelected: boolean) {
  return [...products].sort((left, right) => {
    const availability = Number(isProductSoldOut(left)) - Number(isProductSoldOut(right))
    if (availability !== 0) return availability

    if (sort === 'price-asc' && left.price !== right.price) return left.price - right.price
    if (sort === 'price-desc' && left.price !== right.price) return right.price - left.price
    if (sort === 'discount') {
      const difference = (getProductDiscountPercent(right) ?? 0) - (getProductDiscountPercent(left) ?? 0)
      if (difference !== 0) return difference
    }
    if (sort === 'newest') {
      const difference = Date.parse(right.created_at) - Date.parse(left.created_at)
      if (Number.isFinite(difference) && difference !== 0) return difference
    }
    if (promotionSelected) {
      const difference = (getProductDiscountPercent(right) ?? 0) - (getProductDiscountPercent(left) ?? 0)
      if (difference !== 0) return difference
    }
    if (categorySelected) {
      const a = (left as OrderedProduct).category_sort_order ?? left.sort_order
      const b = (right as OrderedProduct).category_sort_order ?? right.sort_order
      if (a !== b) return a - b
    }
    return left.sort_order - right.sort_order
  })
}

export function CatalogExperience({
  products,
  categories,
  brands,
  pathname,
  routeState,
  theme,
  containerClass,
  catalogMode,
  hasPromotions,
  showSearch,
  showCategories,
  showBrands,
  showSort,
}: Props) {
  const [query, setQuery] = useState(routeState.query)
  const [category, setCategory] = useState<string | null>(routeState.activeCategory)
  const [brand, setBrand] = useState<string | null>(routeState.activeBrand)
  const [promotion, setPromotion] = useState(routeState.activePromotion)
  const [sort, setSort] = useState<StorefrontSort>(routeState.sort)
  const [visiblePages, setVisiblePages] = useState(Math.max(1, routeState.page))
  const deferredQuery = useDeferredValue(query)
  const visibleBrands = brands.filter((item) => item.is_active)

  const filtered = useMemo(() => {
    const categoryRecord = categories.find((item) => item.slug === category)
    const brandRecord = visibleBrands.find((item) => item.slug === brand)
    let next = products
    if (categoryRecord) next = next.filter((product) => product.category_id === categoryRecord.id)
    if (brandRecord) next = next.filter((product) => product.brand_id === brandRecord.id)
    if (promotion) next = next.filter(isProductOnPromotion)
    if (deferredQuery.trim()) next = next.filter((product) => matchesSearch(product, deferredQuery))
    return sortProducts(next, sort, Boolean(categoryRecord), promotion)
  }, [brand, categories, category, deferredQuery, products, promotion, sort, visibleBrands])

  const pageSize = routeState.pageSize || 12
  const shown = filtered.slice(0, visiblePages * pageSize)
  const hasMore = shown.length < filtered.length
  const hasFilters = Boolean(category || brand || promotion || query.trim() || sort !== 'recommended')
  const showGroupedSections = catalogMode === 'sections' && !hasFilters

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const href = buildStorefrontHref(pathname, {
        category,
        brand,
        promotion,
        query,
        product: routeState.activeProduct,
        pageSize,
        sort,
      })
      window.history.replaceState(window.history.state, '', href)
    }, 80)
    return () => window.clearTimeout(timeout)
  }, [brand, category, pageSize, pathname, promotion, query, routeState.activeProduct, sort])

  function resetPage() {
    setVisiblePages(1)
  }

  function clearFilters() {
    setQuery('')
    setCategory(null)
    setBrand(null)
    setPromotion(false)
    setSort('recommended')
    setVisiblePages(1)
  }

  function productHref(product: ProductWithImages) {
    return buildStorefrontHref(pathname, {
      category,
      brand,
      promotion,
      query,
      pageSize,
      sort,
      product: product.slug,
    })
  }

  return (
    <section id="catalogo" className="scroll-mt-24 pb-[var(--store-space-section)] pt-6 sm:pt-8">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Productos</p>
            <h2 className="store-heading mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--store-text)' }}>Catálogo</h2>
          </div>
          <span className="rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums" style={{ color: 'var(--store-primary)', background: 'color-mix(in srgb, var(--store-primary) 10%, transparent)' }}>{filtered.length}</span>
        </div>

        <div className="mb-5 space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {showSearch ? (
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--store-muted-text)' }} />
                <input
                  value={query}
                  onChange={(event) => { setQuery(event.target.value.slice(0, 120)); resetPage() }}
                  placeholder="Buscar producto, marca o sabor"
                  aria-label="Buscar productos"
                  className="h-11 w-full rounded-xl pl-10 pr-10 text-sm outline-none transition focus:ring-2"
                  style={{ color: 'var(--store-text)', background: 'color-mix(in srgb, var(--store-surface) 82%, transparent)', border: '1px solid var(--store-card-border)' }}
                />
                {query ? <button type="button" onClick={() => { setQuery(''); resetPage() }} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full" aria-label="Limpiar búsqueda" style={{ color: 'var(--store-muted-text)' }}><X className="size-4" /></button> : null}
              </div>
            ) : null}

            {showSort ? (
              <div className="flex h-11 shrink-0 items-center gap-2 rounded-xl px-3" style={{ background: 'color-mix(in srgb, var(--store-surface) 82%, transparent)', border: '1px solid var(--store-card-border)' }}>
                <ArrowDownUp className="size-4" style={{ color: 'var(--store-primary)' }} />
                <select value={sort} onChange={(event) => { setSort(event.target.value as StorefrontSort); resetPage() }} aria-label="Ordenar productos" className="bg-transparent text-sm font-semibold outline-none" style={{ color: 'var(--store-text)', colorScheme: 'dark' }}>
                  {STOREFRONT_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            ) : null}
          </div>

          {(showCategories || hasPromotions) ? (
            <FilterLine label="Categoría">
              <Pill active={!category && !promotion} label="Todas" onClick={() => { setCategory(null); setPromotion(false); resetPage() }} />
              {hasPromotions ? <Pill active={promotion} label="Promociones" onClick={() => { setPromotion(!promotion); resetPage() }} /> : null}
              {showCategories ? categories.map((item) => <Pill key={item.id} active={category === item.slug} label={item.name} onClick={() => { setCategory(category === item.slug ? null : item.slug); resetPage() }} />) : null}
            </FilterLine>
          ) : null}

          {showBrands && visibleBrands.length > 0 ? (
            <FilterLine label="Marca">
              <Pill active={!brand} label="Todas" onClick={() => { setBrand(null); resetPage() }} />
              {visibleBrands.map((item) => <Pill key={item.id} active={brand === item.slug} label={item.name} onClick={() => { setBrand(brand === item.slug ? null : item.slug); resetPage() }} />)}
            </FilterLine>
          ) : null}

          {hasFilters ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--store-muted-text)' }}><SlidersHorizontal className="size-3.5" />Filtros aplicados</div>
              <button type="button" onClick={clearFilters} className="text-xs font-semibold" style={{ color: 'var(--store-primary)' }}>Limpiar</button>
            </div>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border px-5 py-12 text-center" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-soft-text)' }}>
            <p className="font-semibold" style={{ color: 'var(--store-text)' }}>No encontramos productos</p>
            <p className="mt-1 text-sm">Probá otra búsqueda o limpiá los filtros.</p>
          </div>
        ) : showGroupedSections ? (
          <GroupedCatalog products={products} categories={categories} theme={theme} productHref={productHref} />
        ) : (
          <>
            <ProductCatalogGrid items={shown.map((product) => ({ product, href: productHref(product) }))} theme={theme} desktopColumns={theme.grid_columns} />
            {hasMore ? <div className="mt-7 flex justify-center"><button type="button" onClick={() => setVisiblePages((current) => current + 1)} className="store-button px-5 py-3 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--store-surface) 90%, transparent)', color: 'var(--store-text)', border: '1px solid var(--store-card-border)' }}>Ver más productos</button></div> : null}
          </>
        )}
      </div>
    </section>
  )
}

function FilterLine({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3 overflow-hidden"><span className="hidden w-[66px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] sm:block" style={{ color: 'var(--store-muted-text)' }}>{label}</span><div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">{children}</div></div>
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition active:scale-[0.97]" style={active ? { background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' } : { background: 'color-mix(in srgb, var(--store-surface) 74%, transparent)', color: 'var(--store-soft-text)', border: '1px solid var(--store-card-border)' }}>{label}</button>
}

function GroupedCatalog({ products, categories, theme, productHref }: { products: ProductWithImages[]; categories: Category[]; theme: StoreTheme; productHref: (product: ProductWithImages) => string }) {
  const groups = [...categories.map((category) => ({ id: category.id, name: category.name, products: products.filter((product) => product.category_id === category.id) })), { id: 'otros', name: 'Otros productos', products: products.filter((product) => !product.category_id) }].filter((group) => group.products.length > 0)
  const gridClass = GRID_COLS_CLASS[theme.grid_columns] ?? GRID_COLS_CLASS[2]
  return <div className="space-y-10">{groups.map((group) => <section key={group.id}><div className="mb-4 flex items-end justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--store-card-border)' }}><h3 className="store-heading text-xl font-semibold" style={{ color: 'var(--store-text)' }}>{group.name}</h3><span className="text-xs" style={{ color: 'var(--store-muted-text)' }}>{group.products.length}</span></div><div className={cn('grid gap-3 sm:gap-5', gridClass)}>{group.products.map((product) => <CatalogProductCard key={product.id} product={product} productHref={productHref(product)} theme={theme} />)}</div></section>)}</div>
}
