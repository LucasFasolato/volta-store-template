import Link from 'next/link'
import { Eye, QrCode, Share2 } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'

export function AdminDashboardHero({ plan, storeName }: { plan: StoreLaunchPlan; storeName: string }) {
  return (
    <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300"><span className="size-2 rounded-full bg-[#12e89a]" />Tienda online</div>
      <h1 className="mt-2 truncate text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2rem]">{storeName}</h1>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
        <Link href={plan.publicPath} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#12e89a] px-4 text-sm font-semibold text-[#062117]"><Eye className="size-4" />Ver tienda</Link>
        <a href="#share-tools" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-black/8 bg-slate-50 px-4 text-sm font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><Share2 className="size-4" />Compartir <QrCode className="size-3.5" /></a>
      </div>
    </section>
  )
}
