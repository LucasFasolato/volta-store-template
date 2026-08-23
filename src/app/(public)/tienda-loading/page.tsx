import type { Metadata } from 'next'
import { Suspense } from 'react'
import { StoreReadyWatcher } from '@/components/store-loading/StoreReadyWatcher'

export const metadata: Metadata = {
  title: 'Abriendo tu tienda…',
  robots: { index: false, follow: false },
}

export default function StoreLoadingPage() {
  return (
    <Suspense>
      <StoreReadyWatcher />
    </Suspense>
  )
}
