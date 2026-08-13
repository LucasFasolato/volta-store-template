'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { THEME_PRESETS } from '@/data/theme-presets'
import { applyThemePreset } from '@/lib/actions/store'
import { cn } from '@/lib/utils'
import type { Store, StoreTheme } from '@/types/store'

type AdvancedTab = 'fuentes' | 'colores' | 'productos' | 'layout' | 'avanzado'

type Props = {
  theme: StoreTheme
  store: Store
  onOpenAdvanced: (tab: AdvancedTab) => void
}

const FRIENDLY_PRESETS = THEME_PRESETS.slice(0, 4)

export function QuickAppearanceForm({ theme, store, onOpenAdvanced }: Props) {
  void theme
  void store
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function chooseStyle(id: string) {
    setSelected(id)
    startTransition(async () => {
      const result = await applyThemePreset(id)
      if (result?.error) {
        toast.error(result.error.formErrors?.[0] ?? 'No pudimos aplicar el estilo.')
        return
      }
      toast.success('Estilo aplicado.')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
        <h3 className="text-lg font-semibold tracking-[-0.035em] text-foreground">Elegí una base</h3>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {FRIENDLY_PRESETS.map((preset) => {
            const active = selected === preset.id
            return (
              <button key={preset.id} type="button" data-appearance-no-dirty="true" onClick={() => chooseStyle(preset.id)} disabled={isPending} className={cn('relative rounded-[14px] border p-3 text-left transition active:scale-[0.98]', active ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/7' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}>
                <div className="flex gap-1.5">
                  {preset.previewColors.slice(0, 3).map((color) => <span key={color} className="size-4 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: color }} />)}
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{preset.name}</p>
                {active ? <Check className="absolute right-2.5 top-2.5 size-4 text-emerald-600" /> : null}
              </button>
            )
          })}
        </div>
        {isPending ? <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" />Aplicando estilo…</p> : null}
      </section>

      <button type="button" data-appearance-no-dirty="true" onClick={() => onOpenAdvanced('colores')} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-black/8 bg-white px-4 text-sm font-medium text-foreground dark:border-white/10 dark:bg-[#111820]">
        <SlidersHorizontal className="size-4" />
        Personalizar
      </button>
    </div>
  )
}
