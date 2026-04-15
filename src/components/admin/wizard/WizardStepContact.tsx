'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStoreConfig } from '@/lib/actions/store'
import type { Store } from '@/types/store'

export function WizardStepContact({ store }: { store: Store }) {
  const [name, setName] = useState(store.name ?? '')
  const [whatsapp, setWhatsapp] = useState(store.whatsapp ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    const trimmedName = name.trim() || store.name

    startTransition(async () => {
      const result = await updateStoreConfig({
        name: trimmedName,
        slug: store.slug,
        whatsapp: whatsapp.trim(),
        instagram: store.instagram,
        address: store.address,
        hours: store.hours,
      })

      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const msg = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(msg)
      }
    })
  }

  const canSave = whatsapp.trim().length >= 8 && name.trim().length >= 2

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Nombre del negocio
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Atelier Norte"
            disabled={isPending}
            className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Número de WhatsApp
          </Label>
          <Input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+5491112345678"
            disabled={isPending}
            className="h-12 rounded-md border-white/10 bg-white/5 font-mono text-white placeholder:text-neutral-500"
          />
          <p className="mt-1.5 text-xs text-neutral-500">Con código de país. Ej: +5491112345678</p>
        </div>
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
        {isPending ? 'Guardando...' : 'Guardar y continuar'}
      </button>
    </div>
  )
}
