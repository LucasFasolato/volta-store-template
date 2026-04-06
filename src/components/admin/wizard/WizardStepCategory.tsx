'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory } from '@/lib/actions/products'

export function WizardStepCategory() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await createCategory({ name: name.trim(), sort_order: 0 })
      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const msg = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(msg)
      }
    })
  }

  const canSave = name.trim().length > 0

  return (
    <div className="space-y-5">
      <div className="max-w-sm">
        <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
          Nombre de la categoría
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && canSave && !isPending) handleSave() }}
          placeholder="Ej: Remeras, Accesorios, Destacados"
          maxLength={24}
          disabled={isPending}
          className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
        />
        <p className="mt-1.5 text-xs text-neutral-500">Podés agregar más desde la sección Categorías.</p>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        onClick={handleSave}
        disabled={isPending || !canSave}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-6 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(16,185,129,0.2)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {isPending ? 'Guardando...' : 'Crear y continuar'}
      </button>
    </div>
  )
}
