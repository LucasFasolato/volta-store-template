'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StoreCartClient } from '@/components/cart/StoreCartClient'
import { ProductModal } from '@/components/product/ProductModal'
import { trackStoreEvent } from '@/lib/analytics/store-events'
import { buildThemeVars } from '@/lib/utils/theme'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type StoreInteractiveShellProps = {
  closeModalHref: string
  selectedProduct: ProductWithImages | null
  storeId: string
  storeName: string
  storeRootId: string
  storeSlug: string
  theme: StoreTheme
  whatsapp: string
  checkoutAskName: boolean
  checkoutAskFulfillment: boolean
  checkoutAllowNotes: boolean
}

export function StoreInteractiveShell({
  closeModalHref,
  selectedProduct,
  storeId,
  storeName,
  storeRootId,
  storeSlug,
  theme,
  whatsapp,
  checkoutAskName,
  checkoutAskFulfillment,
  checkoutAllowNotes,
}: StoreInteractiveShellProps) {
  useEffect(() => {
    trackStoreEvent({ storeId, type: 'store_view', dedupeKey: 'store-view' })
  }, [storeId])

  useEffect(() => {
    if (!selectedProduct) return
    trackStoreEvent({
      storeId,
      type: 'product_view',
      productId: selectedProduct.id,
      dedupeKey: `product-view:${selectedProduct.id}`,
    })
  }, [selectedProduct, storeId])

  return (
    <>
      <StoreThemeAutoSync storeRootId={storeRootId} theme={theme} />
      <StoreCartClient
        storeId={storeId}
        storeSlug={storeSlug}
        storeName={storeName}
        whatsapp={whatsapp}
        askName={checkoutAskName}
        askFulfillment={checkoutAskFulfillment}
        allowNotes={checkoutAllowNotes}
      />
      {selectedProduct ? (
        <StoreProductModalClient
          closeHref={closeModalHref}
          product={selectedProduct}
          storeName={storeName}
          whatsapp={whatsapp}
        />
      ) : null}
    </>
  )
}

function StoreProductModalClient({
  closeHref,
  product,
  storeName,
  whatsapp,
}: {
  closeHref: string
  product: ProductWithImages
  storeName: string
  whatsapp: string
}) {
  const router = useRouter()

  return (
    <ProductModal
      product={product}
      storeName={storeName}
      whatsapp={whatsapp}
      onClose={() => router.replace(closeHref, { scroll: false })}
    />
  )
}

function StoreThemeAutoSync({
  storeRootId,
  theme,
}: {
  storeRootId: string
  theme: StoreTheme
}) {
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

        if (key === 'colorScheme') {
          storeRootElement.style.colorScheme = String(value)
          continue
        }

        storeRootElement.style.setProperty(key, String(value))
      }
    }

    applyMode()
    media.addEventListener('change', applyMode)

    return () => media.removeEventListener('change', applyMode)
  }, [storeRootId, theme])

  return null
}
