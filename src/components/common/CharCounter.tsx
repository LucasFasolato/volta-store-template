import { cn } from '@/lib/utils'

type CharCounterProps = {
  current: number
  max: number
  className?: string
}

export function CharCounter({ current, max, className }: CharCounterProps) {
  const remaining = max - current
  const isWarning = remaining <= Math.floor(max * 0.15)
  const isError = remaining < 0

  return (
    <span
      className={cn(
        'text-xs tabular-nums transition-colors',
        isError
          ? 'text-red-400 font-medium'
          : isWarning
            ? 'text-amber-400'
            : 'text-neutral-500',
        className,
      )}
    >
      {current}/{max}
    </span>
  )
}
