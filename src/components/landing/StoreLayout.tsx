'use client'

import { useEffect, useMemo, useState } from 'react'
import { CartFloatingBar } from '@/components/cart/CartFloatingBar'
import { CartSheet } from '@/components/cart/CartSheet'
import { CatalogSection } from '@/components/landing/CatalogSection'
import { FeaturedSection } from '@/components/landing/FeaturedSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { StoreFooter } from '@/components/landing/StoreFooter'
import { StoreNav } from '@/components/landing/StoreNav'
import { TrustBar } from '@/components/landing/TrustBar'
import { ProductModal } from '@/components/product/ProductModal'
import { useCartStore } from '@/lib/stores/cart'
import { buildThemeVars, CONTAINER_CLASS } from '@/lib/utils/theme'
import type { ProductWithImages, StorePublicData } from '@/types/store'

const DEFAULT_PAGE_SIZE = 12

type StoreLayoutProps = {
  data: StorePublicData
  activeCategory?: string
  activeProduct?: string
}

export function StoreLayout({
  data,
  activeCategory,
  activeProduct,
}: StoreLayoutProps) {
  const { store, theme, layout, content, categories, products } = data
  const [selectedProduct, setSelectedProduct] = useState<ProductWithImages | null>(
    () => products.find((item) => item.slug === activeProduct) ?? null,
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory ?? null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
  )
  const containerClass = CONTAINER_CLASS[theme.container_width] ?? CONTAINER_CLASS.lg
  const setStoreSlug = useCartStore((state) => state.setStoreSlug)

  useEffect(() => {
    setStoreSlug(store.slug)
  }, [store.slug, setStoreSlug])

  useEffect(() => {
    if (theme.visual_mode !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystemMode(media.matches ? 'dark' : 'light')
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [theme.visual_mode])

  const resolvedMode: 'light' | 'dark' =
    theme.visual_mode === 'auto' ? systemMode : theme.visual_mode === 'dark' ? 'dark' : 'light'

  const themeVars = useMemo(() => buildThemeVars(theme, resolvedMode), [resolvedMode, theme])

  const featuredProducts = products.filter((product) => product.is_featured)

  const filteredProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter((product) => {
            const category = categories.find((item) => item.slug === selectedCategory)
            return category ? product.category_id === category.id : true
          })
        : products,
    [products, categories, selectedCategory],
  )

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)

  function handleCategoryChange(slug: string | null) {
    setSelectedCategory(slug)
    setPage(1)
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(1)
  }

  return (
    <div
      className="store-shell store-body"
      data-store-mode={theme.visual_mode}
      style={{
        ...themeVars,
        background: 'var(--store-bg-gradient)',
        color: 'var(--store-text)',
        fontFamily: 'var(--store-font-body)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[40rem]"
        style={{
          background:
            'radial-gradient(circle at 10% 18%, var(--store-glow), transparent 26%), radial-gradient(circle at 88% 0%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(180deg, transparent, rgba(255,255,255,0.01))',
        }}
      />

      <StoreNav store={store} containerClass={containerClass} />

      <main id="main-content" className="relative z-10 pb-24 sm:pb-10">
        {layout.show_hero ? (
          <HeroSection content={content} store={store} containerClass={containerClass} />
        ) : null}

        <TrustBar store={store} content={content} />

        {layout.show_featured && featuredProducts.length > 0 ? (
          <FeaturedSection
            products={featuredProducts}
            theme={theme}
            containerClass={containerClass}
            onSelectProduct={setSelectedProduct}
          />
        ) : null}

        {layout.show_catalog ? (
          <CatalogSection
            products={paginatedProducts}
            totalFiltered={filteredProducts.length}
            categories={layout.show_categories ? categories : []}
            theme={theme}
            containerClass={containerClass}
            activeCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onSelectProduct={setSelectedProduct}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : null}

        <HowItWorksSection store={store} containerClass={containerClass} />
      </main>

      {layout.show_footer ? <StoreFooter store={store} containerClass={containerClass} /> : null}

      {selectedProduct ? (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      ) : null}

      <CartSheet whatsapp={store.whatsapp} storeName={store.name} />
      <CartFloatingBar />
    </div>
  )
}
