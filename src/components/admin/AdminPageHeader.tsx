import { cn } from '@/lib/utils'

type AdminPageHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Volta Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.15rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
