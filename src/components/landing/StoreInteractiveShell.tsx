'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StoreCartClient } from '@/components/cart/StoreCartClient'
import { ProductModal } from '@/components/product/ProductModal'
import { SoldOutProductModal } from '@/components/product/SoldOutProductModal'
import type { RelatedProductLink } from '@/components/product/RelatedProductsStrip'
import { trackStoreEvent } from '@/lib/analytics/store-events'
import { isProductSoldOut } from '@/lib/products/availability'
import { buildThemeVars } from '@/lib/utils/theme'
import type { CheckoutCustomField, ProductWithImages, RepeatableProduct, SalesSettings, StoreTheme } from '@/types/store'

type StoreInteractiveShellProps = {
  closeModalHref: string
  selectedProduct: ProductWithImages | null
  relatedProducts: RelatedProductLink[]
  storeId: string
  storeName: string
  storeRootId: string
  storeSlug: string
  theme: StoreTheme
  whatsapp: string
  checkoutAskName: boolean
  checkoutAskFulfillment: boolean
  checkoutAllowNotes: boolean
  checkoutFields: CheckoutCustomField[]
  salesSettings: SalesSettings
  repeatableProducts: RepeatableProduct[]
}

export function StoreInteractiveShell(props: StoreInteractiveShellProps) {
  const { selectedProduct, storeId, storeRootId, theme } = props
  useEffect(() => { trackStoreEvent({ storeId, type: 'store_view', dedupeKey: 'store-view' }) }, [storeId])
  useEffect(() => {
    if (!selectedProduct) return
    trackStoreEvent({ storeId, type: 'product_view', productId: selectedProduct.id, dedupeKey: `product-view:${selectedProduct.id}` })
  }, [selectedProduct, storeId])

  return (
    <>
      <StoreThemeAutoSync storeRootId={storeRootId} theme={theme} />
      <StoreCartClient storeId={props.storeId} storeSlug={props.storeSlug} storeName={props.storeName} whatsapp={props.whatsapp} askName={props.checkoutAskName} askFulfillment={props.checkoutAskFulfillment} allowNotes={props.checkoutAllowNotes} customFields={props.checkoutFields} salesSettings={props.salesSettings} repeatableProducts={props.repeatableProducts} />
      {selectedProduct ? <StoreProductModalClient closeHref={props.closeModalHref} product={selectedProduct} relatedProducts={props.relatedProducts} /> : null}
    </>
  )
}

function StoreProductModalClient({ closeHref, product, relatedProducts }: { closeHref: string; product: ProductWithImages; relatedProducts: RelatedProductLink[] }) {
  const router = useRouter()
  const onClose = () => router.replace(closeHref, { scroll: false })
  const onSelectRelated = (href: string) => router.replace(href, { scroll: false })

  if (isProductSoldOut(product)) {
    return <SoldOutProductModal key={product.id} product={product} relatedProducts={relatedProducts} onSelectRelated={onSelectRelated} onClose={onClose} />
  }

  return <ProductModal key={product.id} product={product} relatedProducts={relatedProducts} onSelectRelated={onSelectRelated} onClose={onClose} />
}

function StoreThemeAutoSync({ storeRootId, theme }: { storeRootId: string; theme: StoreTheme }) {
  useEffect(() => {
    if (theme.visual_mode !== 'auto') return
    const storeRoot = document.getElementById(storeRootId)
    if (!storeRoot) return
    const storeRootElement = storeRoot
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function applyMode() {
      const themeVars = buildThemeVars(theme, media.matches ? 'dark' : 'light')
      for (const [key, value] of Object.entries(themeVars)) {
        if (value == null) continue
        if (key === 'colorScheme') storeRootElement.style.colorScheme = String(value)
        else storeRootElement.style.setProperty(key, String(value))
      }
    }
    applyMode()
    media.addEventListener('change', applyMode)
    return () => media.removeEventListener('change', applyMode)
  }, [storeRootId, theme])
  return null
}
