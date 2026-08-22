'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function BillingReturnRefresh() {
  const router = useRouter()

  useEffect(() => {
    const timeout = window.setTimeout(() => router.refresh(), 3500)
    return () => window.clearTimeout(timeout)
  }, [router])

  return (
    <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-amber-700">
      <Loader2 className="size-3.5 animate-spin" />
      Confirmando con Mercado Pago…
    </div>
  )
}
