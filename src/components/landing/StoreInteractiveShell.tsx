'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StoreCartClient } from '@/components/cart/StoreCartClient'
import { ProductModal } from '@/components/product/ProductModal'
import { buildThemeVars } from '@/lib/utils/theme'
import type { ProductWithImages, StoreTheme } from '@/types/store'

type StoreInteractiveShellProps = {
  closeModalHref: string
  selectedProduct: ProductWithImages | null
  storeName: string
  storeRootId: string
  storeSlug: string
  theme: StoreTheme
  whatsapp: string
}

export function StoreInteractiveShell({
  closeModalHref,
  selectedProduct,
  storeName,
  storeRootId,
  storeSlug,
  theme,
  whatsapp,
}: StoreInteractiveShellProps) {
  return (
    <>
      <StoreThemeAutoSync storeRootId={storeRootId} theme={theme} />
      <StoreCartClient storeSlug={storeSlug} storeName={storeName} whatsapp={whatsapp} />
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
