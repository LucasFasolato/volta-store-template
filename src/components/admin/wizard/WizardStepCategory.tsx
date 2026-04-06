'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { assignProductToCategory, createCategory } from '@/lib/actions/products'
import { cn } from '@/lib/utils'
import type { ProductWithImages } from '@/types/store'

export function WizardStepCategory({
  products,
  hasExistingCategories,
}: {
  products: ProductWithImages[]
  hasExistingCategories: boolean
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Auto-select all products when there are no prior categories
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(!hasExistingCategories ? products.map((p) => p.id) : []),
  )

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const canSave = name.trim().length > 0

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await createCategory({ name: name.trim(), sort_order: 0 })

      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const msg = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(msg)
        return
      }

      const categoryId = result.category?.id
      if (categoryId && selectedIds.size > 0) {
        await Promise.all(
          [...selectedIds].map((productId) => assignProductToCategory(productId, categoryId)),
        )
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="max-w-sm">
        <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
          Nombre de la categoría
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSave && !isPending) handleSave()
          }}
          placeholder="Ej: Remeras, Accesorios, Destacados"
          maxLength={24}
          disabled={isPending}
          className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
        />
        <p className="mt-1.5 text-xs text-neutral-500">Podés agregar más desde la sección Categorías.</p>
      </div>

      {products.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Asignar productos a esta categoría
          </p>
          <div className="space-y-1.5">
            {products.map((product) => {
              const checked = selectedIds.has(product.id)
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  disabled={isPending}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition',
                    checked
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'border border-white/8 bg-white/[0.03] hover:bg-white/6',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border transition',
                      checked
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-white/20 bg-transparent',
                    )}
                  >
                    {checked ? <CheckCircle2 className="size-3 text-black" /> : null}
                  </span>
                  <span className="flex-1 text-sm font-medium text-neutral-200">{product.name}</span>
                  <span className="text-xs text-neutral-500">${product.price.toLocaleString('es-AR')}</span>
                </button>
              )
            })}
          </div>
          {!hasExistingCategories ? (
            <p className="mt-2 text-xs text-neutral-600">
              Todos los productos fueron seleccionados automáticamente.
            </p>
          ) : null}
        </div>
      ) : null}

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
