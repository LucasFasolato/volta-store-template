'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const FALLBACK_TIMEOUT_MS = 20_000

export function StoreReadyWatcher() {
  const searchParams = useSearchParams()
  const target = searchParams.get('target') ?? ''
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'volta-store-ready' && event.data?.href) {
        window.location.href = event.data.href
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), FALLBACK_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] px-6 text-center">
      <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-emerald-400 text-2xl font-black text-black">
        V
      </div>

      {timedOut ? (
        <>
          <p className="text-lg font-semibold text-white">Tu tienda está lista</p>
          <p className="mt-2 text-sm text-white/50">Ya podés verla y compartirla.</p>
          {target ? (
            <a
              href={target}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Abrir tienda
            </a>
          ) : null}
        </>
      ) : (
        <>
          <Loader2 className="mb-5 size-8 animate-spin text-emerald-400/70" />
          <p className="text-base font-semibold text-white">Abriendo tu tienda…</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/40">
            Estamos aplicando el estilo y dejando todo listo para compartir.
          </p>
        </>
      )}
    </div>
  )
}
