import { StoreInteractiveShell } from '@/components/landing/StoreInteractiveShell'
import { CatalogDiscoveryControls } from '@/components/landing/CatalogDiscoveryControls'
import { CatalogSection } from '@/components/landing/CatalogSection'
import { CatalogSections } from '@/components/landing/CatalogSections'
import { FeaturedSection } from '@/components/landing/FeaturedSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { StoreFooter } from '@/components/landing/StoreFooter'
import { StoreNav } from '@/components/landing/StoreNav'
import { TrustBar } from '@/components/landing/TrustBar'
import { getStorefrontDensityMode } from '@/components/landing/storefront-density'
import { isProductSoldOut } from '@/lib/products/availability'
import { isProductOnPromotion } from '@/lib/products/promotion'
import { getRelatedProducts } from '@/lib/products/recommendations'
import { normalizeSalesSettings } from '@/lib/sales/settings'
import { buildStorefrontHref, type StorefrontViewModel } from '@/lib/storefront/view'
import { buildThemeVars, CONTAINER_CLASS } from '@/lib/utils/theme'
import type { StorePublicData } from '@/types/store'
import type { CatalogMode } from '@/lib/actions/catalog-presentation'

type StoreLayoutProps = { data: StorePublicData; pathname: string; view: StorefrontViewModel }

export function StoreLayout({ data, pathname, view }: StoreLayoutProps) {
  const { store, theme, layout, content, categories, brands } = data
  const visibleProductCount = data.products.length
  const availableProductCount = data.products.filter((product) => !isProductSoldOut(product)).length
  const categoryCount = categories.length
  const featuredCount = view.featuredProducts.length
  const hasPromotions = data.products.some(isProductOnPromotion)
  const densityMode = getStorefrontDensityMode(visibleProductCount)
  const containerClass = CONTAINER_CLASS[theme.container_width] ?? CONTAINER_CLASS.lg
  const resolvedMode: 'light' | 'dark' = theme.visual_mode === 'dark' ? 'dark' : 'light'
  const themeVars = buildThemeVars(theme, resolvedMode)
  const catalogMode = (layout.catalog_mode ?? 'all') as CatalogMode
  const showCatalogSearch = layout.show_catalog_search ?? true
  const showCatalogBrands = (layout.show_catalog_brands ?? false) && brands.length > 0
  const showSort = visibleProductCount > 1
  const hasDiscoverySelection = Boolean(
    view.activeCategory || view.activeBrand || view.activePromotion || view.query || view.sort !== 'recommended',
  )
  const showFeaturedSection = layout.show_featured && featuredCount > 0 && visibleProductCount > 5 && !hasDiscoverySelection
  const showDiscoveryControls = layout.show_catalog && (
    showCatalogSearch ||
    (layout.show_categories && categories.length > 0) ||
    showCatalogBrands ||
    hasPromotions ||
    showSort
  )
  const closeModalHref = buildStorefrontHref(pathname, {
    category: view.activeCategory,
    brand: view.activeBrand,
    promotion: view.activePromotion,
    query: view.query,
    page: view.page,
    pageSize: view.pageSize,
    sort: view.sort,
  })
  const storeRootId = `store-shell-${store.slug}`
  const checkoutFields = Array.isArray(store.checkout_custom_fields) ? store.checkout_custom_fields : []
  const salesSettings = normalizeSalesSettings(store)
  const repeatableProducts = data.products
    .filter((product) => !isProductSoldOut(product))
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url ?? null,
      options: product.options.map((option) => ({ name: option.name, values: option.values })),
    }))
  const relatedProducts = view.selectedProduct
    ? getRelatedProducts(view.selectedProduct, data.products, 4).map((product) => ({
        product,
        href: buildStorefrontHref(pathname, {
          category: view.activeCategory,
          brand: view.activeBrand,
          promotion: view.activePromotion,
          query: view.query,
          page: view.page,
          pageSize: view.pageSize,
          sort: view.sort,
          product: product.slug,
        }),
      }))
    : []

  return (
    <div id={storeRootId} className="store-shell store-body" data-store-mode={theme.visual_mode} style={{ ...themeVars, background: 'var(--store-bg-gradient)', color: 'var(--store-text)', fontFamily: 'var(--store-font-body)' }}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[34rem]" style={{ background: 'radial-gradient(circle at 10% 18%, var(--store-glow), transparent 26%), radial-gradient(circle at 88% 0%, rgba(255,255,255,0.08), transparent 26%)' }} />
      <StoreNav store={store} containerClass={containerClass} productCount={visibleProductCount} densityMode={densityMode} />
      <main id="main-content" className="relative z-10 pb-20 sm:pb-8">
        {layout.show_hero ? <HeroSection content={content} store={store} containerClass={containerClass} productCount={availableProductCount} categoryCount={categoryCount} featuredCount={featuredCount} densityMode={densityMode} /> : null}
        <TrustBar store={store} content={content} productCount={availableProductCount} categoryCount={categoryCount} />
        {showFeaturedSection ? <FeaturedSection products={view.featuredProducts} pathname={pathname} routeState={view} theme={theme} containerClass={containerClass} productCount={visibleProductCount} /> : null}
        {showDiscoveryControls ? <CatalogDiscoveryControls pathname={pathname} routeState={view} categories={categories} brands={brands} hasPromotions={hasPromotions} showSearch={showCatalogSearch} showCategories={layout.show_categories} showBrands={showCatalogBrands} showSort={showSort} containerClass={containerClass} /> : null}
        {layout.show_catalog && catalogMode === 'sections' && !hasDiscoverySelection ? <CatalogSections products={data.products} categories={categories} theme={theme} containerClass={containerClass} pathname={pathname} /> : null}
        {layout.show_catalog && (catalogMode !== 'sections' || hasDiscoverySelection) ? <CatalogSection products={view.paginatedProducts} totalFiltered={view.filteredProducts.length} categories={[]} theme={theme} containerClass={containerClass} pathname={pathname} routeState={view} totalPages={view.totalPages} catalogSize={densityMode} /> : null}
      </main>
      {layout.show_footer ? <StoreFooter store={store} containerClass={containerClass} productCount={availableProductCount} categoryCount={categoryCount} /> : null}
      <StoreInteractiveShell closeModalHref={closeModalHref} selectedProduct={view.selectedProduct} relatedProducts={relatedProducts} storeId={store.id} storeName={store.name} storeRootId={storeRootId} storeSlug={store.slug} theme={theme} whatsapp={store.whatsapp} checkoutAskName={store.checkout_ask_name ?? true} checkoutAskFulfillment={store.checkout_ask_fulfillment ?? true} checkoutAllowNotes={store.checkout_allow_notes ?? true} checkoutFields={checkoutFields} salesSettings={salesSettings} repeatableProducts={repeatableProducts} />
    </div>
  )
}
