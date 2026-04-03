'use client'

import { useEffect } from 'react'
import { StateScreen, RetryButton } from '@/components/common/StateScreen'

export default function AdminError({
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
      eyebrow="Admin"
      title="No pudimos cargar el panel"
      description="Puede haber sido un problema momentaneo con la sesion o los datos de tu tienda. Reintentemos sin perder el contexto."
      primaryAction={<RetryButton onClick={unstable_retry} />}
      secondaryHref="/admin"
      secondaryLabel="Volver al panel"
    />
  )
}
