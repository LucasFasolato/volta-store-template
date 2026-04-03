'use client'

import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SaveButtonProps = {
  isLoading?: boolean
  isSaved?: boolean
  className?: string
  label?: string
}

export function SaveButton({
  isLoading,
  isSaved,
  className,
  label = 'Guardar cambios',
}: SaveButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      aria-busy={isLoading}
      className={cn(
        'min-w-[152px] rounded-full px-5 font-medium transition-all',
        isSaved
          ? 'border border-emerald-400/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/10'
          : 'bg-emerald-400 text-black hover:bg-emerald-300',
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Guardando...
        </>
      ) : isSaved ? (
        <>
          <Check className="mr-2 size-4" />
          Guardado
        </>
      ) : (
        label
      )}
    </Button>
  )
}
