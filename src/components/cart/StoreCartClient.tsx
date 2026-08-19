'use client'

import { useEffect } from 'react'
import { CartFloatingBar } from '@/components/cart/CartFloatingBar'
import { CartSheet } from '@/components/cart/CartSheet'
import { RepeatOrderBar } from '@/components/cart/RepeatOrderBar'
import { trackStoreEvent } from '@/lib/analytics/store-events'
import { useCartStore } from '@/lib/stores/cart'
import type { CheckoutCustomField, RepeatableProduct, SalesSettings } from '@/types/store'

type StoreCartClientProps = {
  storeId: string
  storeSlug: string
  storeName: string
  whatsapp: string
  askName: boolean
  askFulfillment: boolean
  allowNotes: boolean
  customFields: CheckoutCustomField[]
  salesSettings: SalesSettings
  repeatableProducts: RepeatableProduct[]
}

export function StoreCartClient({
  storeId,
  storeSlug,
  storeName,
  whatsapp,
  askName,
  askFulfillment,
  allowNotes,
  customFields,
  salesSettings,
  repeatableProducts,
}: StoreCartClientProps) {
  const setStoreContext = useCartStore((state) => state.setStoreContext)
  const isOpen = useCartStore((state) => state.isOpen)

  useEffect(() => {
    setStoreContext(storeSlug, storeId)
  }, [setStoreContext, storeId, storeSlug])

  useEffect(() => {
    if (!isOpen) return
    trackStoreEvent({ storeId, type: 'cart_open' })
  }, [isOpen, storeId])

  return (
    <>
      <CartSheet
        storeId={storeId}
        storeSlug={storeSlug}
        whatsapp={whatsapp}
        storeName={storeName}
        askName={askName}
        askFulfillment={askFulfillment}
        allowNotes={allowNotes}
        customFields={customFields}
        salesSettings={salesSettings}
      />
      <CartFloatingBar />
      <RepeatOrderBar storeSlug={storeSlug} products={repeatableProducts} />
    </>
  )
}
