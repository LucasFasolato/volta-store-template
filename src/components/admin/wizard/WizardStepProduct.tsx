'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct } from '@/lib/actions/products'
import { formatPriceTypingValue, parsePriceTypingValue } from '@/lib/utils/price-input'
import type { Category } from '@/types/store'

export function WizardStepProduct({
  categories,
  activeProductCount,
}: {
  categories: Category[]
  activeProductCount: number
}) {
  void categories
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canSave = name.trim().length > 0 && price.trim().length > 0

  function handleAdd() {
    setError(null)
    const priceNum = parsePriceTypingValue(price)
    if (priceNum <= 0) return setError('Ingresá un precio mayor a 0.')
    const savedName = name.trim()

    startTransition(async () => {
      const result = await createProduct({
        name: savedName,
        price: priceNum,
        is_active: true,
        is_featured: false,
        sort_order: 0,
      })
      if (result?.error) {
        const fields = Object.values(result.error.fieldErrors ?? {}).flat()
        setError(result.error.formErrors?.[0] ?? fields[0] ?? 'No pudimos guardar el producto.')
        return
      }
      setLastAdded(savedName)
      setName('')
      setPrice('')
    })
  }

  return (
    <div className="space-y-5">
      {lastAdded ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" />{lastAdded} agregado.</div>
      ) : null}
      <div>
        <Label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Remera básica" disabled={isPending} className="h-12 rounded-[10px] bg-white dark:bg-white/5" />
      </div>
      <div>
        <Label className="mb-1.5 block text-sm font-medium text-foreground">Precio</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input inputMode="decimal" value={price} onChange={(event) => setPrice(formatPriceTypingValue(event.target.value))} placeholder="25.000" disabled={isPending} className="h-12 rounded-[10px] bg-white pl-8 dark:bg-white/5" />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Los miles se separan automáticamente para que el valor sea fácil de leer.</p>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button type="button" onClick={handleAdd} disabled={isPending || !canSave} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] disabled:opacity-45 sm:w-auto">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}{isPending ? 'Guardando…' : activeProductCount > 0 ? 'Continuar' : 'Crear producto'}
      </button>
    </div>
  )
}
