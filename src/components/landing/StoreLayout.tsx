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
import { buildStorefrontHref, type StorefrontViewModel } from '@/lib/storefront/view'
import { buildThemeVars, CONTAINER_CLASS } from '@/lib/utils/theme'
import type { StorePublicData } from '@/types/store'
import type { CatalogMode } from '@/lib/actions/catalog-presentation'

type StoreLayoutProps = { data: StorePublicData; pathname: string; view: StorefrontViewModel }

export function StoreLayout({ data, pathname, view }: StoreLayoutProps) {
  const { store, theme, layout, content, categories, brands } = data
  const productCount = data.products.length
  const categoryCount = categories.length
  const featuredCount = view.featuredProducts.length
  const densityMode = getStorefrontDensityMode(productCount)
  const showFeaturedSection = layout.show_featured && featuredCount > 0 && productCount > 5
  const showTrustBar = densityMode !== 'small'
  const containerClass = CONTAINER_CLASS[theme.container_width] ?? CONTAINER_CLASS.lg
  const resolvedMode: 'light' | 'dark' = theme.visual_mode === 'dark' ? 'dark' : 'light'
  const themeVars = buildThemeVars(theme, resolvedMode)
  const catalogMode = (layout.catalog_mode ?? 'all') as CatalogMode
  const showCatalogSearch = layout.show_catalog_search ?? true
  const showCatalogBrands = (layout.show_catalog_brands ?? false) && brands.length > 0
  const hasDiscoverySelection = Boolean(view.activeCategory || view.activeBrand || view.query)
  const showDiscoveryControls = layout.show_catalog && (
    showCatalogSearch ||
    (layout.show_categories && categories.length > 0) ||
    showCatalogBrands
  )
  const closeModalHref = buildStorefrontHref(pathname, {
    category: view.activeCategory,
    brand: view.activeBrand,
    query: view.query,
    page: view.page,
    pageSize: view.pageSize,
  })
  const storeRootId = `store-shell-${store.slug}`

  return (
    <div id={storeRootId} className="store-shell store-body" data-store-mode={theme.visual_mode} style={{ ...themeVars, background: 'var(--store-bg-gradient)', color: 'var(--store-text)', fontFamily: 'var(--store-font-body)' }}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[34rem]" style={{ background: 'radial-gradient(circle at 10% 18%, var(--store-glow), transparent 26%), radial-gradient(circle at 88% 0%, rgba(255,255,255,0.08), transparent 26%)' }} />
      <StoreNav store={store} containerClass={containerClass} productCount={productCount} densityMode={densityMode} />
      <main id="main-content" className="relative z-10 pb-20 sm:pb-8">
        {layout.show_hero ? <HeroSection content={content} store={store} containerClass={containerClass} productCount={productCount} categoryCount={categoryCount} featuredCount={featuredCount} densityMode={densityMode} /> : null}
        {showTrustBar ? <TrustBar store={store} content={content} productCount={productCount} categoryCount={categoryCount} /> : null}
        {showFeaturedSection ? <FeaturedSection products={view.featuredProducts} pathname={pathname} routeState={view} theme={theme} containerClass={containerClass} productCount={productCount} /> : null}

        {showDiscoveryControls ? (
          <CatalogDiscoveryControls
            pathname={pathname}
            routeState={view}
            categories={categories}
            brands={brands}
            showSearch={showCatalogSearch}
            showCategories={layout.show_categories}
            showBrands={showCatalogBrands}
            containerClass={containerClass}
          />
        ) : null}

        {layout.show_catalog && catalogMode === 'sections' && !hasDiscoverySelection ? (
          <CatalogSections products={data.products} categories={categories} theme={theme} containerClass={containerClass} pathname={pathname} />
        ) : null}
        {layout.show_catalog && (catalogMode !== 'sections' || hasDiscoverySelection) ? (
          <CatalogSection
            products={view.paginatedProducts}
            totalFiltered={view.filteredProducts.length}
            categories={[]}
            theme={theme}
            containerClass={containerClass}
            pathname={pathname}
            routeState={view}
            totalPages={view.totalPages}
            catalogSize={densityMode}
          />
        ) : null}
      </main>
      {layout.show_footer ? <StoreFooter store={store} containerClass={containerClass} productCount={productCount} categoryCount={categoryCount} /> : null}
      <StoreInteractiveShell closeModalHref={closeModalHref} selectedProduct={view.selectedProduct} storeId={store.id} storeName={store.name} storeRootId={storeRootId} storeSlug={store.slug} theme={theme} whatsapp={store.whatsapp} checkoutAskName={store.checkout_ask_name ?? true} checkoutAskFulfillment={store.checkout_ask_fulfillment ?? true} checkoutAllowNotes={store.checkout_allow_notes ?? true} />
    </div>
  )
}
