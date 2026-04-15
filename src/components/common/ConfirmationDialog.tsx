'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
  isPending?: boolean
  cancelLabel?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending = false,
  cancelLabel = 'Cancelar',
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isPending}
        className="max-w-md rounded-[28px] border border-white/10 bg-neutral-950/96 p-0 text-white shadow-2xl"
      >
        <DialogHeader className="gap-4 px-6 pt-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-400/20">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-neutral-400">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="rounded-b-[28px] border-white/10 bg-white/[0.03] px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={isPending}
            className="rounded-full border border-red-400/20 bg-red-500/12 text-red-200 hover:bg-red-500/18"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isPending ? 'Eliminando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
