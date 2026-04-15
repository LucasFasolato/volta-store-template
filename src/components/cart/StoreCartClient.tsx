'use client'

import { useEffect } from 'react'
import { CartFloatingBar } from '@/components/cart/CartFloatingBar'
import { CartSheet } from '@/components/cart/CartSheet'
import { useCartStore } from '@/lib/stores/cart'

type StoreCartClientProps = {
  storeSlug: string
  storeName: string
  whatsapp: string
}

export function StoreCartClient({ storeSlug, storeName, whatsapp }: StoreCartClientProps) {
  const setStoreSlug = useCartStore((state) => state.setStoreSlug)

  useEffect(() => {
    setStoreSlug(storeSlug)
  }, [setStoreSlug, storeSlug])

  return (
    <>
      <CartSheet whatsapp={whatsapp} storeName={storeName} />
      <CartFloatingBar />
    </>
  )
}
