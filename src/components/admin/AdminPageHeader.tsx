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
    <header className={cn('mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/90">Volta Admin</p>
        <h1 className="admin-title text-[2.15rem] font-semibold text-white sm:text-[2.6rem]">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-7 text-neutral-300 sm:text-[15px]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 sm:pb-1">{action}</div> : null}
    </header>
  )
}
