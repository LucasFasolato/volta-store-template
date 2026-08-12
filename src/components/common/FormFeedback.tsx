'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('volta:form-feedback', {
        detail: { kind },
      }),
    )
  }, [kind, message, title])

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm shadow-sm',
        kind === 'error'
          ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-100'
          : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100',
        className,
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
          kind === 'error'
            ? 'bg-red-100 text-red-700 dark:bg-red-400/12 dark:text-red-200'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-200',
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        {title ? <p className="font-semibold text-current">{title}</p> : null}
        <p className={cn('leading-6', title ? 'mt-1 opacity-80' : '')}>{message}</p>
      </div>
    </div>
  )
}
