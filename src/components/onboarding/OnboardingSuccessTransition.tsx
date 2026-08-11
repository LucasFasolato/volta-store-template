'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function OnboardingSuccessTransition() {
  const router = useRouter()

  useEffect(() => {
    const timeout = window.setTimeout(() => router.replace('/admin'), 1650)
    return () => window.clearTimeout(timeout)
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4">
      <div className="w-full max-w-lg text-center">
        <motion.div
          initial={{ scale: .82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#12e89a] text-[#062117] shadow-[0_14px_36px_rgba(18,232,154,.2)]"
        >
          <Check className="size-5" strokeWidth={2.4} />
        </motion.div>

        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .12, duration: .3 }}>
          <h1 className="mt-5 text-[2rem] font-semibold tracking-[-0.055em] text-slate-950 sm:text-[2.45rem]">Tu tienda ya existe</h1>
          <p className="mt-2 text-sm text-slate-500">Preparando tu espacio para empezar a vender.</p>
        </motion.div>

        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .22, duration: .38 }} className="mx-auto mt-8 max-w-sm overflow-hidden rounded-[18px] border border-black/8 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,.08)]">
          <div className="h-2.5 w-16 rounded-full bg-slate-900" />
          <div className="mt-3 grid grid-cols-[1.1fr_.9fr] gap-2">
            <div className="space-y-2 rounded-[12px] bg-[#f7f8fa] p-3">
              <motion.div animate={{ opacity: [.45, .8, .45] }} transition={{ duration: 1.1, repeat: Infinity }} className="h-3 w-14 rounded bg-slate-200" />
              <motion.div animate={{ opacity: [.5, .9, .5] }} transition={{ duration: 1.1, repeat: Infinity, delay: .1 }} className="h-6 w-28 rounded bg-slate-900/90" />
              <div className="h-8 w-20 rounded-[8px] bg-[#12e89a]" />
            </div>
            <motion.div animate={{ opacity: [.62, 1, .62] }} transition={{ duration: 1.15, repeat: Infinity }} className="rounded-[12px] bg-slate-200" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((item) => <motion.div key={item} animate={{ opacity: [.45, .85, .45] }} transition={{ duration: 1.2, repeat: Infinity, delay: item * .1 }} className="aspect-[4/3] rounded-[10px] bg-slate-100" />)}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
