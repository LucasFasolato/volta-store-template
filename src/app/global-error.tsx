'use client'

import './globals.css'
import { StateScreen, RetryButton } from '@/components/common/StateScreen'

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="es">
      <body>
        <StateScreen
          eyebrow="Error inesperado"
          title="Algo salio mal"
          description="Tuvimos un problema inesperado al cargar la aplicacion. Podes intentar nuevamente o volver al inicio."
          primaryAction={<RetryButton onClick={unstable_retry} />}
        />
      </body>
    </html>
  )
}
