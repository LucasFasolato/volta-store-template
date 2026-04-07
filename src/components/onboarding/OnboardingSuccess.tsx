'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function OnboardingSuccess({ storeName }: { storeName: string }) {
  const router = useRouter()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace('/admin')
    }, 1600)

    return () => window.clearTimeout(timeout)
  }, [router])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,230,166,0.14),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(111,243,223,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_26%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 w-full max-w-[320px] overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3 shadow-[0_30px_80px_rgba(2,6,23,0.45)]"
        >
          <div className="overflow-hidden rounded-[20px] border border-white/8 bg-[#081120]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
              <div className="h-2.5 w-20 rounded-full bg-white/70" />
              <div className="h-8 w-8 rounded-full bg-emerald-400" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.35 }}
              className="space-y-4 px-4 py-5"
            >
              <div className="rounded-[18px] bg-[linear-gradient(135deg,rgba(46,230,166,0.16),rgba(111,243,223,0.04))] px-4 py-5 text-left">
                <div className="h-3 w-24 rounded-full bg-emerald-300/80" />
                <div className="mt-3 h-5 w-40 rounded-full bg-white/90" />
                <div className="mt-2 h-3 w-32 rounded-full bg-white/30" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + item * 0.08, duration: 0.3 }}
                    className="overflow-hidden rounded-[16px] border border-white/8 bg-white/[0.03]"
                  >
                    <div className="h-20 bg-[linear-gradient(145deg,rgba(99,102,241,0.18),rgba(46,230,166,0.14))]" />
                    <div className="space-y-2 px-3 py-3">
                      <div className="h-2.5 rounded-full bg-white/70" />
                      <div className="h-2 w-2/3 rounded-full bg-white/20" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.36, duration: 0.32, ease: 'easeOut' }}
            className="absolute right-5 top-5 flex size-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] text-[#04130e] shadow-[0_12px_32px_rgba(46,230,166,0.28)]"
          >
            <svg viewBox="0 0 24 24" className="size-7 fill-none stroke-current stroke-[2.6]">
              <path d="M5 12.5 9.2 17 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-[2.8rem]"
        >
          Ya creamos tu tienda
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.35 }}
          className="mt-4 max-w-md text-sm leading-7 text-white/60 sm:text-[15px]"
        >
          <span className="font-semibold text-white/88">{storeName}</span> ya existe. Ahora vamos a terminar de configurarla para que se vea bien y se pueda compartir.
        </motion.p>
      </motion.div>
    </main>
  )
}
