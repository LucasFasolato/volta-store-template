'use client'

import { useEffect } from 'react'
import { StateScreen, RetryButton } from '@/components/common/StateScreen'

export default function StoreError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StateScreen
      eyebrow="Tienda"
      title="No pudimos cargar esta tienda"
      description="La tienda existe pero hubo un problema al traer la informacion. Probemos otra vez en unos segundos."
      primaryAction={<RetryButton onClick={unstable_retry} />}
    />
  )
}
