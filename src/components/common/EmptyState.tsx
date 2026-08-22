import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
  tone?: 'dark' | 'light' | 'store'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = 'dark',
}: EmptyStateProps) {
  const contextualTone = tone === 'light' || tone === 'store'

  return (
    <div
      className={cn(
        'rounded-[28px] px-6 py-10 text-center sm:px-8',
        tone === 'dark'
          ? 'surface-panel-soft premium-ring text-white'
          : 'store-contrast-surface border shadow-none',
        className,
      )}
      style={
        contextualTone
          ? {
              borderColor: 'var(--store-card-border, rgba(15, 23, 42, 0.1))',
              background:
                'linear-gradient(145deg, color-mix(in srgb, var(--store-surface, #ffffff) 94%, var(--store-text, #0f172a) 6%), color-mix(in srgb, var(--store-bg, #f8fafc) 94%, var(--store-surface, #ffffff) 6%))',
              color: 'var(--store-text, #0f172a)',
            }
          : undefined
      }
    >
      <div
        className={cn(
          'mx-auto mb-4 flex size-14 items-center justify-center rounded-full',
          tone === 'dark' ? 'bg-white/8 text-white/80' : '',
        )}
        style={
          contextualTone
            ? {
                color: 'var(--store-primary, #0f172a)',
                background: 'color-mix(in srgb, var(--store-primary, #0f172a) 11%, transparent)',
                border: '1px solid color-mix(in srgb, var(--store-primary, #0f172a) 18%, var(--store-card-border, rgba(15, 23, 42, 0.1)))',
              }
            : undefined
        }
      >
        <Icon className="size-6" />
      </div>
      <h3
        className={cn('text-lg font-semibold', tone === 'dark' ? 'text-white' : '')}
        style={contextualTone ? { color: 'var(--store-text, #0f172a)' } : undefined}
      >
        {title}
      </h3>
      <p
        className={cn('mx-auto mt-2 max-w-md text-sm leading-6', tone === 'dark' ? 'text-neutral-400' : '')}
        style={contextualTone ? { color: 'var(--store-soft-text, #64748b)' } : undefined}
      >
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
