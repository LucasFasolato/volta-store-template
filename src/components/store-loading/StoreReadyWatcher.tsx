'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-[#030712] px-6">
      <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-black">
        V
      </div>

      <StorefrontSkeleton />

      <div className="text-center">
        {timedOut ? (
          <>
            <p className="text-base font-semibold text-white">Tu tienda está lista</p>
            <p className="mt-1.5 text-sm text-white/50">Ya podés verla y compartirla.</p>
            {target ? (
              <a
                href={target}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Abrir tienda
              </a>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold text-white">Abriendo tu tienda…</p>
            <p className="mt-1.5 text-sm text-white/38">Estamos aplicando el estilo y dejando todo listo.</p>
          </>
        )}
      </div>
    </div>
  )
}

function StorefrontSkeleton() {
  return (
    <div className="w-[272px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c1422] shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
      {/* Nav */}
      <div className="flex items-center justify-between border-b border-white/[0.05] px-3.5 py-2.5">
        <Bone className="h-2 w-12 rounded-full" delay={0} />
        <div className="flex items-center gap-2">
          <Bone className="h-1.5 w-8 rounded-full" delay={0.1} />
          <Bone className="h-1.5 w-8 rounded-full" delay={0.15} />
          <Bone className="h-1.5 w-8 rounded-full" delay={0.2} />
        </div>
      </div>

      {/* Hero image area */}
      <div className="relative">
        <Bone className="aspect-[16/8] w-full rounded-none" delay={0.05} />
        {/* Hero text overlay at bottom */}
        <div className="absolute bottom-3 left-3.5 space-y-1.5">
          <Bone className="h-2.5 w-24 rounded-full" delay={0.25} />
          <Bone className="h-1.5 w-16 rounded-full" delay={0.3} />
          <Bone className="mt-2 h-5 w-16 rounded-full" delay={0.35} />
        </div>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-3 gap-1.5 p-2.5">
        {([0, 0.12, 0.24] as const).map((delay, i) => (
          <div key={i} className="space-y-1.5">
            <Bone className="aspect-[3/4] w-full rounded-xl" delay={delay} />
            <Bone className="h-1.5 w-full rounded-full" delay={delay + 0.08} />
            <Bone className="h-1.5 w-2/3 rounded-full" delay={delay + 0.13} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Bone({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={cn('relative overflow-hidden bg-white/[0.07]', className)}
      animate={{ opacity: [0.5, 0.95, 0.5] }}
      transition={{ duration: 2.6, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: 2, delay, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
      />
    </motion.div>
  )
}
