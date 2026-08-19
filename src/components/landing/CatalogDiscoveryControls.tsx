'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDownUp, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  STOREFRONT_SORT_OPTIONS,
  buildStorefrontHref,
  type StorefrontRouteState,
  type StorefrontSort,
} from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import type { Brand, Category } from '@/types/store'

type Props = {
  pathname: string
  routeState: StorefrontRouteState
  categories: Category[]
  brands: Brand[]
  hasPromotions: boolean
  showSearch: boolean
  showCategories: boolean
  showBrands: boolean
  showSort: boolean
  containerClass: string
}

export function CatalogDiscoveryControls({
  pathname,
  routeState,
  categories,
  brands,
  hasPromotions,
  showSearch,
  showCategories,
  showBrands,
  showSort,
  containerClass,
}: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(routeState.query)

  useEffect(() => {
    setSearchValue(routeState.query)
  }, [routeState.query])

  useEffect(() => {
    if (!showSearch || searchValue === routeState.query) return

    const timeout = window.setTimeout(() => {
      router.replace(
        buildStorefrontHref(pathname, {
          category: routeState.activeCategory,
          brand: routeState.activeBrand,
          promotion: routeState.activePromotion,
          query: searchValue,
          page: 1,
          pageSize: routeState.pageSize,
          sort: routeState.sort,
        }),
        { scroll: false },
      )
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [pathname, routeState.activeBrand, routeState.activeCategory, routeState.activePromotion, routeState.pageSize, routeState.query, routeState.sort, router, searchValue, showSearch])

  const hasActiveFilters = Boolean(routeState.activeCategory || routeState.activeBrand || routeState.activePromotion || routeState.query)
  const visibleBrands = brands.filter((brand) => brand.is_active)
  const showCategoryRow = (showCategories && categories.length > 0) || hasPromotions
  const hasRowsBeforeSort = showSearch || showCategoryRow || (showBrands && visibleBrands.length > 0)

  function changeSort(sort: StorefrontSort) {
    router.replace(
      buildStorefrontHref(pathname, {
        category: routeState.activeCategory,
        brand: routeState.activeBrand,
        promotion: routeState.activePromotion,
        query: routeState.query,
        page: 1,
        pageSize: routeState.pageSize,
        sort,
      }),
      { scroll: false },
    )
  }

  return (
    <section className="pt-5 sm:pt-7" aria-label="Buscar, filtrar y ordenar productos">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div
          className="rounded-[16px] p-3.5 sm:p-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--store-surface) 88%, transparent)',
            border: '1px solid var(--store-card-border)',
            boxShadow: '0 12px 32px color-mix(in srgb, var(--store-text) 5%, transparent)',
          }}
        >
          {showSearch ? (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2"
                style={{ color: 'var(--store-muted-text)' }}
              />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value.slice(0, 120))}
                placeholder="Buscar en el catálogo"
                aria-label="Buscar en el catálogo"
                className="h-11 border-0 bg-transparent pl-10 pr-10 text-sm shadow-none focus-visible:ring-1"
                style={{
                  color: 'var(--store-text)',
                  backgroundColor: 'color-mix(in srgb, var(--store-bg) 72%, transparent)',
                  border: '1px solid var(--store-card-border)',
                }}
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => setSearchValue('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full transition hover:opacity-80"
                  style={{ color: 'var(--store-muted-text)' }}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          ) : null}

          {showCategoryRow ? (
            <div className={showSearch ? 'mt-3 border-t pt-3' : 'mt-1'} style={showSearch ? { borderColor: 'var(--store-card-border)' } : undefined}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                Categoría
              </p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
                <FilterPill
                  label="Todas"
                  href={buildStorefrontHref(pathname, {
                    brand: routeState.activeBrand,
                    query: routeState.query,
                    page: 1,
                    pageSize: routeState.pageSize,
                    sort: routeState.sort,
                  })}
                  active={!routeState.activeCategory && !routeState.activePromotion}
                />
                {hasPromotions ? (
                  <FilterPill
                    label="Promociones"
                    href={buildStorefrontHref(pathname, {
                      category: routeState.activeCategory,
                      brand: routeState.activeBrand,
                      promotion: true,
                      query: routeState.query,
                      page: 1,
                      pageSize: routeState.pageSize,
                      sort: routeState.sort,
                    })}
                    active={routeState.activePromotion}
                  />
                ) : null}
                {showCategories ? categories.map((category) => (
                  <FilterPill
                    key={category.id}
                    label={category.name}
                    href={buildStorefrontHref(pathname, {
                      category: category.slug,
                      brand: routeState.activeBrand,
                      promotion: routeState.activePromotion,
                      query: routeState.query,
                      page: 1,
                      pageSize: routeState.pageSize,
                      sort: routeState.sort,
                    })}
                    active={routeState.activeCategory === category.slug}
                  />
                )) : null}
              </div>
            </div>
          ) : null}

          {showBrands && visibleBrands.length > 0 ? (
            <FilterRow
              label="Marca"
              items={visibleBrands.map((brand) => ({ id: brand.id, slug: brand.slug, name: brand.name }))}
              activeSlug={routeState.activeBrand}
              allHref={buildStorefrontHref(pathname, {
                category: routeState.activeCategory,
                promotion: routeState.activePromotion,
                query: routeState.query,
                page: 1,
                pageSize: routeState.pageSize,
                sort: routeState.sort,
              })}
              hrefFor={(slug) => buildStorefrontHref(pathname, {
                category: routeState.activeCategory,
                brand: slug,
                promotion: routeState.activePromotion,
                query: routeState.query,
                page: 1,
                pageSize: routeState.pageSize,
                sort: routeState.sort,
              })}
              separated={showSearch || showCategoryRow}
            />
          ) : null}

          {showSort ? (
            <div className={hasRowsBeforeSort ? 'mt-3 flex items-center justify-between gap-3 border-t pt-3' : 'flex items-center justify-between gap-3'} style={hasRowsBeforeSort ? { borderColor: 'var(--store-card-border)' } : undefined}>
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                    color: 'var(--store-primary)',
                  }}
                >
                  <ArrowDownUp className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                    Ordenar
                  </p>
                  <p className="hidden text-xs sm:block" style={{ color: 'var(--store-soft-text)' }}>
                    Elegí qué querés ver primero
                  </p>
                </div>
              </div>

              <select
                value={routeState.sort}
                onChange={(event) => changeSort(event.target.value as StorefrontSort)}
                aria-label="Ordenar productos"
                className="h-10 max-w-[12rem] rounded-xl px-3 text-xs font-semibold outline-none transition focus:ring-2 sm:max-w-none sm:text-sm"
                style={{
                  color: 'var(--store-text)',
                  background: 'color-mix(in srgb, var(--store-bg) 72%, var(--store-surface))',
                  border: '1px solid var(--store-card-border)',
                }}
              >
                {STOREFRONT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ) : null}

          {hasActiveFilters ? (
            <div className="mt-3 flex justify-end border-t pt-3" style={{ borderColor: 'var(--store-card-border)' }}>
              <Link
                href={buildStorefrontHref(pathname, { pageSize: routeState.pageSize, sort: routeState.sort })}
                scroll={false}
                className="text-xs font-semibold transition hover:opacity-75"
                style={{ color: 'var(--store-primary)' }}
              >
                Limpiar filtros
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function FilterRow({
  label,
  items,
  activeSlug,
  allHref,
  hrefFor,
  separated,
}: {
  label: string
  items: Array<{ id: string; slug: string; name: string }>
  activeSlug: string | null
  allHref: string
  hrefFor: (slug: string) => string
  separated: boolean
}) {
  return (
    <div className={separated ? 'mt-3 border-t pt-3' : 'mt-1'} style={separated ? { borderColor: 'var(--store-card-border)' } : undefined}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
        {label}
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
        <FilterPill label="Todas" href={allHref} active={!activeSlug} />
        {items.map((item) => (
          <FilterPill key={item.id} label={item.name} href={hrefFor(item.slug)} active={activeSlug === item.slug} />
        ))}
      </div>
    </div>
  )
}

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className="shrink-0 whitespace-nowrap px-3.5 py-2 text-xs font-semibold transition active:scale-[0.97]"
      style={active
        ? {
            borderRadius: 'var(--store-button-radius)',
            background: 'var(--store-primary)',
            color: 'var(--store-primary-contrast)',
          }
        : {
            borderRadius: 'var(--store-button-radius)',
            backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
            color: 'var(--store-soft-text)',
            border: '1px solid var(--store-card-border)',
          }}
    >
      {label}
    </Link>
  )
}
