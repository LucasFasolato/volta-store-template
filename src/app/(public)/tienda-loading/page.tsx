import { Suspense } from 'react'
import { StoreReadyWatcher } from '@/components/store-loading/StoreReadyWatcher'

export const metadata = { title: 'Abriendo tu tienda…' }

export default function StoreLoadingPage() {
  return (
    <Suspense>
      <StoreReadyWatcher />
    </Suspense>
  )
}
