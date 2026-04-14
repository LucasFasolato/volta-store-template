import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, MessageCircle } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { Button } from '@/components/ui/button'

type AdminDashboardHeroProps = {
  plan: StoreLaunchPlan
  storeName: string
}

export function AdminDashboardHero({
  plan,
  storeName,
}: AdminDashboardHeroProps) {
  return (
    <section className="admin-surface relative overflow-hidden rounded-[28px] px-5 py-6 sm:px-7 sm:py-8 lg:px-8">
      <div
        className="pointer-events-none absolute inset-y-0 right-[-3rem] w-48 rounded-full bg-emerald-300/12 blur-3xl sm:w-64"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-3rem] left-[-1rem] h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Lista para recibir pedidos
            </span>
          </div>

          <h1 className="mt-4 text-balance font-heading text-[1.95rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.45rem] sm:leading-[1.08]">
            {storeName} ya puede recibir pedidos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Comparti el enlace o proba como llega un pedido por WhatsApp.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:justify-end">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl bg-[linear-gradient(135deg,#2ee6a6,#72f6df)] px-5 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_45px_rgba(46,230,166,0.18)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_22px_60px_rgba(46,230,166,0.28)]"
          >
            <Link href={plan.publicPath} target="_blank" rel="noreferrer">
              <ArrowUpRight className="size-4" />
              Ver tienda
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-border bg-black/[0.04] px-5 text-sm text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
          >
            <Link href={plan.whatsappShareUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              Compartir por WhatsApp
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
