import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormFeedbackProps = {
  kind: 'error' | 'success'
  message: string
  className?: string
}

export function FormFeedback({ kind, message, className }: FormFeedbackProps) {
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm',
        kind === 'error'
          ? 'border-red-400/20 bg-red-400/8 text-red-100'
          : 'border-emerald-400/20 bg-emerald-400/8 text-emerald-100',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p className="leading-5">{message}</p>
    </div>
  )
}
