'use client'

import { useEffect } from 'react'
import { CartFloatingBar } from '@/components/cart/CartFloatingBar'
import { CartSheet } from '@/components/cart/CartSheet'
import { trackStoreEvent } from '@/lib/analytics/store-events'
import { useCartStore } from '@/lib/stores/cart'

type StoreCartClientProps = {
  storeId: string
  storeSlug: string
  storeName: string
  whatsapp: string
  askName: boolean
  askFulfillment: boolean
  allowNotes: boolean
}

export function StoreCartClient({
  storeId,
  storeSlug,
  storeName,
  whatsapp,
  askName,
  askFulfillment,
  allowNotes,
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
        whatsapp={whatsapp}
        storeName={storeName}
        askName={askName}
        askFulfillment={askFulfillment}
        allowNotes={allowNotes}
      />
      <CartFloatingBar />
    </>
  )
}
