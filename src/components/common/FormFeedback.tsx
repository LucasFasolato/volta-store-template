import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormFeedbackProps = {
  kind: 'error' | 'success'
  message: string
  title?: string
  className?: string
}

export function FormFeedback({ kind, message, title, className }: FormFeedbackProps) {
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm shadow-[0_18px_40px_rgba(2,6,23,0.16)]',
        kind === 'error'
          ? 'border-red-400/18 bg-[linear-gradient(180deg,rgba(248,113,113,0.12),rgba(127,29,29,0.12))] text-red-50'
          : 'border-emerald-400/18 bg-[linear-gradient(180deg,rgba(52,211,153,0.14),rgba(4,120,87,0.12))] text-emerald-50',
        className,
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
          kind === 'error' ? 'bg-red-400/12 text-red-100' : 'bg-emerald-300/12 text-emerald-50',
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        {title ? <p className="font-semibold text-current">{title}</p> : null}
        <p className={cn('leading-6', title ? 'mt-1 text-current/85' : 'text-current')}>{message}</p>
      </div>
    </div>
  )
}
