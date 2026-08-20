'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { setProductOptionValueAvailability } from '@/lib/actions/product-options'
import type { ProductOption } from '@/types/store'

type Props = {
  productId: string
  options: ProductOption[]
}

export function OptionAvailabilityPanel({ productId, options }: Props) {
  const [localOptions, setLocalOptions] = useState(options)
  const [isPending, startTransition] = useTransition()

  if (localOptions.length === 0) return null

  function toggle(optionId: string, value: string) {
    const option = localOptions.find((item) => item.id === optionId)
    if (!option) return

    const wasUnavailable = (option.unavailable_values ?? []).includes(value)
    const nextOptions = localOptions.map((item) => {
      if (item.id !== optionId) return item
      const unavailable = new Set(item.unavailable_values ?? [])
      if (wasUnavailable) unavailable.delete(value)
      else unavailable.add(value)
      return { ...item, unavailable_values: item.values.filter((candidate) => unavailable.has(candidate)) }
    })

    setLocalOptions(nextOptions)
    startTransition(async () => {
      const result = await setProductOptionValueAvailability({
        productId,
        optionId,
        value,
        available: wasUnavailable,
      })

      if (result?.error) {
        setLocalOptions(localOptions)
        toast.error(result.error)
        return
      }

      toast.success(wasUnavailable ? `${value}: disponible` : `${value}: agotado`)
    })
  }

  return (
    <section className="admin-surface mb-5 rounded-xl p-5 sm:p-6">
      <div className="mb-4">
        <p className="admin-label">Disponibilidad por opción</p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">¿Qué variantes tenés hoy?</h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Tocá un sabor, talle o valor para marcarlo agotado. No hace falta ocultar el producto completo.
        </p>
      </div>

      <div className="space-y-4">
        {localOptions.map((option) => (
          <div key={option.id} className="admin-surface-muted rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{option.name}</p>
              <p className="text-xs text-muted-foreground">
                {option.values.filter((value) => !(option.unavailable_values ?? []).includes(value)).length} disponibles
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const unavailable = (option.unavailable_values ?? []).includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggle(option.id, value)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
                    style={unavailable
                      ? {
                          borderColor: 'rgba(248,113,113,.28)',
                          background: 'rgba(248,113,113,.08)',
                          color: '#fca5a5',
                        }
                      : {
                          borderColor: 'rgba(52,211,153,.24)',
                          background: 'rgba(52,211,153,.08)',
                          color: '#6ee7b7',
                        }}
                    aria-pressed={!unavailable}
                  >
                    {unavailable ? <PackageX className="size-4" /> : <CheckCircle2 className="size-4" />}
                    <span>{value}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
                      {unavailable ? 'Agotado' : 'Disponible'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
