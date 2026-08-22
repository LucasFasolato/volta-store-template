import Link from 'next/link'
import { ArrowRight, LockKeyhole, TrendingUp } from 'lucide-react'

export function PlanUpgradePrompt({
  eyebrow = 'Tu negocio está creciendo',
  title,
  description,
  target = 'VOLTA',
  compact = false,
}: {
  eyebrow?: string
  title: string
  description: string
  target?: 'VOLTA' | 'VOLTA PRO'
  compact?: boolean
}) {
  return (
    <section className={`overflow-hidden rounded-[18px] border border-emerald-500/20 bg-[linear-gradient(135deg,rgba(16,185,129,.07),rgba(255,255,255,.98))] dark:bg-[linear-gradient(135deg,rgba(18,232,154,.08),rgba(17,24,32,.98))] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          {target === 'VOLTA PRO' ? <TrendingUp className="size-4" /> : <LockKeyhole className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{eyebrow}</p>
          <h2 className={`${compact ? 'mt-1.5 text-base' : 'mt-2 text-xl'} font-semibold tracking-[-0.035em] text-foreground`}>{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          <Link href="/admin/plan" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-[#10161d] px-4 text-xs font-semibold text-white transition hover:bg-[#17202a] dark:bg-[#12e89a] dark:text-[#062117]">
            Ver {target} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
