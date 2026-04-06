'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStoreConfig } from '@/lib/actions/store'
import { sanitizeInstagramHandle, slugify } from '@/lib/utils/format'
import type { Store } from '@/types/store'

export function WizardStepTrust({ store }: { store: Store }) {
  const [instagram, setInstagram] = useState(store.instagram ?? '')
  const [hours, setHours] = useState(store.hours ?? '')
  const [address, setAddress] = useState(store.address ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateStoreConfig({
        name: store.name,
        slug: slugify(store.name).slice(0, 48) || store.slug,
        whatsapp: store.whatsapp,
        instagram: sanitizeInstagramHandle(instagram),
        hours: hours.trim() || null,
        address: address.trim() || null,
      })

      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const msg = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(msg)
      }
    })
  }

  const canSave = instagram.trim().length > 0 || hours.trim().length > 0 || address.trim().length > 0

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Instagram <span className="text-neutral-500">(usuario)</span>
          </Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="ateliernorte"
            disabled={isPending}
            className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Horarios de atención
          </Label>
          <Input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Lun a Vie 9 a 18 hs"
            disabled={isPending}
            className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Dirección o zona <span className="text-neutral-500">(opcional)</span>
          </Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Av. Corrientes 1234, CABA"
            disabled={isPending}
            className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
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
        {isPending ? 'Guardando...' : 'Finalizar'}
      </button>
    </div>
  )
}
