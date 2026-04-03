import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
  tone?: 'dark' | 'light'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = 'dark',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] px-6 py-10 text-center sm:px-8',
        tone === 'dark'
          ? 'surface-panel-soft premium-ring text-white'
          : 'border shadow-none',
        className,
      )}
      style={
        tone === 'light'
          ? {
              borderColor: 'var(--store-border)',
              background:
                'linear-gradient(145deg, color-mix(in srgb, var(--store-bg) 86%, white 14%), color-mix(in srgb, var(--store-bg) 94%, var(--store-text) 6%))',
            }
          : undefined
      }
    >
      <div
        className={cn(
          'mx-auto mb-4 flex size-14 items-center justify-center rounded-full',
          tone === 'dark' ? 'bg-white/8 text-white/80' : 'bg-black/5 text-black/65',
        )}
      >
        <Icon className="size-6" />
      </div>
      <h3 className={cn('text-lg font-semibold', tone === 'dark' ? 'text-white' : 'text-black/85')}>{title}</h3>
      <p
        className={cn(
          'mx-auto mt-2 max-w-md text-sm leading-6',
          tone === 'dark' ? 'text-neutral-400' : 'text-black/60',
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
