import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, CircleDashed } from 'lucide-react'
import type { StoreReadinessCheck } from '@/lib/store/readiness'
import { cn } from '@/lib/utils'

export function StoreSetupChecklist({
  checks,
}: {
  checks: StoreReadinessCheck[]
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Checklist operativo
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Esto define si la tienda ya puede publicarse con una base comercial seria.
        </p>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        {checks.map((check) => (
          <article
            key={check.key}
            className={cn(
              'rounded-2xl border px-4 py-3.5 transition',
              check.passed
                ? 'border-emerald-300/16 bg-emerald-400/6'
                : 'border-border bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03]',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl',
                  check.passed
                    ? 'bg-emerald-400/12 text-emerald-600 dark:text-emerald-300'
                    : 'bg-black/[0.05] text-muted-foreground dark:bg-white/[0.06]',
                )}
              >
                {check.passed ? <CheckCircle2 className="size-4" /> : <CircleDashed className="size-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                      check.passed
                        ? 'border-emerald-300/18 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200'
                        : 'border-border bg-black/[0.04] text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]',
                    )}
                  >
                    {check.passed ? 'Listo' : 'Falta'}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">{check.detail}</p>

                {check.passed ? null : (
                  <Link
                    href={check.href}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-emerald-300"
                  >
                    {check.ctaLabel}
                    <ArrowUpRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
