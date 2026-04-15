import { cn } from '@/lib/utils'

type AdminPageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  eyebrow = 'Volta Admin',
  title,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-500 dark:text-emerald-300/80">
          {eyebrow}
        </p>
        <h1 className="text-balance font-heading text-[2.15rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.6rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:pb-1">{action}</div> : null}
    </header>
  )
}
