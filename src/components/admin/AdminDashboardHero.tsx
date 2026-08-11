import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, MessageCircle, Rocket } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { Button } from '@/components/ui/button'

type AdminDashboardHeroProps = {
  plan: StoreLaunchPlan
  storeName: string
}

export function AdminDashboardHero({ plan, storeName }: AdminDashboardHeroProps) {
  const isPublished = plan.isPublished
  const storefrontPath = isPublished ? plan.publicPath : plan.previewPath

  return (
    <section className="overflow-hidden rounded-[18px] border border-black/8 bg-white px-4 py-5 dark:border-white/10 dark:bg-[#111820] sm:px-6 sm:py-6 lg:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            {isPublished ? <CheckCircle2 className="size-3.5" /> : <Rocket className="size-3.5" />}
            {isPublished ? 'Lista para recibir pedidos' : 'Lista para publicar'}
          </div>

          <h1 className="mt-3 text-balance text-[1.75rem] font-semibold leading-[1.04] tracking-[-0.055em] text-foreground sm:text-[2.35rem]">
            {storeName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {isPublished
              ? 'Tu tienda está activa. Revisala, compartila y seguí mejorando el catálogo cuando quieras.'
              : 'La base de tu tienda ya está preparada. Revisá la vista previa y publicala cuando esté como querés.'}
          </p>
        </div>

        <div className="grid w-full gap-2 sm:flex lg:w-auto lg:justify-end">
          <Button asChild size="lg" className="h-11 rounded-[10px] bg-[#12e89a] px-5 text-sm font-semibold text-[#062117] shadow-none hover:bg-[#0fd98f]">
            <Link href={storefrontPath} target="_blank" rel="noreferrer">
              <ArrowUpRight className="size-4" />
              {isPublished ? 'Ver tienda' : 'Ver vista previa'}
            </Link>
          </Button>

          {isPublished ? (
            <Button asChild variant="outline" size="lg" className="h-11 rounded-[10px] bg-white px-5 text-sm dark:bg-white/5">
              <Link href={plan.whatsappShareUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Compartir
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg" className="h-11 rounded-[10px] bg-white px-5 text-sm dark:bg-white/5">
              <Link href="#publish-gate">
                <Rocket className="size-4" />
                Publicar tienda
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
