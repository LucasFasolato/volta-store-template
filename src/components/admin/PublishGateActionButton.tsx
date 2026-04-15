'use client'

import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function PublishGateActionButton({
  idleLabel,
  pendingLabel,
  variant = 'default',
  className,
  disabled,
}: {
  idleLabel: string
  pendingLabel: string
  variant?: 'default' | 'outline'
  className?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={disabled || pending}
      className={className}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  )
}
