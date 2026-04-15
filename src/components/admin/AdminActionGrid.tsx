import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminActionItem = {
  href: string
  label: string
  description: string
  icon: React.ElementType
  badge?: string
  target?: '_blank'
  tone?: 'default' | 'primary'
}

type AdminActionGridProps = {
  eyebrow: string
  title: string
  description: string
  actions: AdminActionItem[]
  className?: string
}

export function AdminActionGrid({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminActionGridProps) {
  return (
    <section className={cn('admin-surface rounded-[24px] p-4 sm:p-6', className)}>
      <div className="max-w-3xl">
        <p className="admin-label">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              target={action.target}
              rel={action.target === '_blank' ? 'noreferrer' : undefined}
              className={cn(
                'group rounded-[22px] border p-4 transition duration-200 hover:-translate-y-0.5',
                action.tone === 'primary'
                  ? 'border-emerald-300/18 bg-emerald-400/8 hover:bg-emerald-400/12'
                  : 'border-border bg-black/[0.04] hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    action.tone === 'primary'
                      ? 'bg-emerald-400/14 text-emerald-200'
                      : 'bg-black/[0.06] text-muted-foreground dark:bg-white/[0.06]',
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex items-center gap-2">
                  {action.badge ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                      {action.badge}
                    </span>
                  ) : null}
                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
