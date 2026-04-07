'use client'

import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SaveButtonProps = {
  isLoading?: boolean
  isSaved?: boolean
  className?: string
  label?: string
  loadingLabel?: string
  savedLabel?: string
}

export function SaveButton({
  isLoading,
  isSaved,
  className,
  label = 'Guardar cambios',
  loadingLabel = 'Guardando...',
  savedLabel = 'Guardado',
}: SaveButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      aria-busy={isLoading}
      className={cn(
        'min-w-[172px] rounded-md px-5 font-medium shadow-[0_18px_36px_rgba(2,6,23,0.22)] transition-all',
        isSaved
          ? 'border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(52,211,153,0.16),rgba(6,95,70,0.18))] text-emerald-50 hover:bg-[linear-gradient(180deg,rgba(52,211,153,0.16),rgba(6,95,70,0.18))]'
          : 'bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] text-black hover:brightness-105',
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {loadingLabel}
        </>
      ) : isSaved ? (
        <>
          <Check className="mr-2 size-4" />
          {savedLabel}
        </>
      ) : (
        label
      )}
    </Button>
  )
}
