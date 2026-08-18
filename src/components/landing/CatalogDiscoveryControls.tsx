'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { buildStorefrontHref, type StorefrontRouteState } from '@/lib/storefront/view'
import { cn } from '@/lib/utils'
import type { Brand, Category } from '@/types/store'

type Props = {
  pathname: string
  routeState: StorefrontRouteState
  categories: Category[]
  brands: Brand[]
  showSearch: boolean
  showCategories: boolean
  showBrands: boolean
  containerClass: string
}

export function CatalogDiscoveryControls({
  pathname,
  routeState,
  categories,
  brands,
  showSearch,
  showCategories,
  showBrands,
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
          query: searchValue,
          page: 1,
          pageSize: routeState.pageSize,
        }),
        { scroll: false },
      )
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [pathname, routeState.activeBrand, routeState.activeCategory, routeState.pageSize, routeState.query, router, searchValue, showSearch])

  const hasActiveFilters = Boolean(routeState.activeCategory || routeState.activeBrand || routeState.query)
  const visibleBrands = brands.filter((brand) => brand.is_active)

  return (
    <section className="pt-5 sm:pt-7" aria-label="Buscar y filtrar productos">
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

          {showCategories && categories.length > 0 ? (
            <FilterRow
              label="Categoría"
              items={categories.map((category) => ({ id: category.id, slug: category.slug, name: category.name }))}
              activeSlug={routeState.activeCategory}
              allHref={buildStorefrontHref(pathname, {
                brand: routeState.activeBrand,
                query: routeState.query,
                page: 1,
                pageSize: routeState.pageSize,
              })}
              hrefFor={(slug) => buildStorefrontHref(pathname, {
                category: slug,
                brand: routeState.activeBrand,
                query: routeState.query,
                page: 1,
                pageSize: routeState.pageSize,
              })}
              separated={showSearch}
            />
          ) : null}

          {showBrands && visibleBrands.length > 0 ? (
            <FilterRow
              label="Marca"
              items={visibleBrands.map((brand) => ({ id: brand.id, slug: brand.slug, name: brand.name }))}
              activeSlug={routeState.activeBrand}
              allHref={buildStorefrontHref(pathname, {
                category: routeState.activeCategory,
                query: routeState.query,
                page: 1,
                pageSize: routeState.pageSize,
              })}
              hrefFor={(slug) => buildStorefrontHref(pathname, {
                category: routeState.activeCategory,
                brand: slug,
                query: routeState.query,
                page: 1,
                pageSize: routeState.pageSize,
              })}
              separated={showSearch || (showCategories && categories.length > 0)}
            />
          ) : null}

          {hasActiveFilters ? (
            <div className="mt-3 flex justify-end border-t pt-3" style={{ borderColor: 'var(--store-card-border)' }}>
              <Link
                href={buildStorefrontHref(pathname, { pageSize: routeState.pageSize })}
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
