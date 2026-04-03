import { cn } from '@/lib/utils'

type SkeletonProps = React.ComponentProps<'div'>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('shimmer rounded-2xl bg-white/8', className)}
      {...props}
    />
  )
}
