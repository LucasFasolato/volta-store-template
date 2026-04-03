'use client'

import { useEffect, useState } from 'react'
import { CartFloatingBar } from '@/components/cart/CartFloatingBar'
import { CartSheet } from '@/components/cart/CartSheet'
import { CatalogSection } from '@/components/landing/CatalogSection'
import { FeaturedSection } from '@/components/landing/FeaturedSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { StoreFooter } from '@/components/landing/StoreFooter'
import { StoreNav } from '@/components/landing/StoreNav'
import { ProductModal } from '@/components/product/ProductModal'
import { useCartStore } from '@/lib/stores/cart'
import { CONTAINER_CLASS } from '@/lib/utils/theme'
import type { ProductWithImages, StorePublicData } from '@/types/store'

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
  const containerClass = CONTAINER_CLASS[theme.container_width] ?? CONTAINER_CLASS.lg
  const setStoreSlug = useCartStore((state) => state.setStoreSlug)

  useEffect(() => {
    setStoreSlug(store.slug)
  }, [store.slug, setStoreSlug])

  const featuredProducts = products.filter((product) => product.is_featured)
  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        const category = categories.find((item) => item.slug === selectedCategory)
        return category ? product.category_id === category.id : true
      })
    : products

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[38rem]"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--store-primary) 10%, transparent), transparent 30%), radial-gradient(circle at 85% 5%, color-mix(in srgb, var(--store-secondary) 14%, transparent), transparent 28%)',
        }}
      />

      <StoreNav store={store} containerClass={containerClass} />

      <main id="main-content" className="relative z-10 pb-24 sm:pb-10">
        {layout.show_hero ? (
          <HeroSection content={content} store={store} containerClass={containerClass} />
        ) : null}

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
            products={filteredProducts}
            allProducts={products}
            categories={layout.show_categories ? categories : []}
            theme={theme}
            containerClass={containerClass}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onSelectProduct={setSelectedProduct}
          />
        ) : null}

        {layout.show_footer ? <StoreFooter store={store} containerClass={containerClass} /> : null}
      </main>

      {selectedProduct ? (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      ) : null}

      <CartSheet whatsapp={store.whatsapp} storeName={store.name} />
      <CartFloatingBar />
    </>
  )
}
