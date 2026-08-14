'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
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
const SHORT_COPY: Record<string, string> = {
  minimal: 'Limpio y simple',
  fashion: 'Editorial y llamativo',
  bakery: 'Suave y cercano',
  deco: 'Sobrio y elegante',
}

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
        <h3 className="text-lg font-semibold tracking-[-0.035em] text-foreground">Elegí cómo querés que se sienta</h3>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {FRIENDLY_PRESETS.map((preset) => {
            const active = selected === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                data-appearance-no-dirty="true"
                onClick={() => chooseStyle(preset.id)}
                disabled={isPending}
                className={cn(
                  'relative overflow-hidden rounded-[14px] border text-left transition active:scale-[0.99]',
                  active
                    ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/7'
                    : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]',
                )}
              >
                <PresetSketch preset={preset} />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{SHORT_COPY[preset.id] ?? preset.description}</p>
                    </div>
                    {active ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : null}
                  </div>
                </div>
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

function PresetSketch({ preset }: { preset: ThemePreset }) {
  const [background, text, accent] = preset.previewColors
  const rounded = preset.theme.border_radius === 'none' ? '3px' : preset.theme.border_radius === 'sm' ? '6px' : '9px'
  return (
    <div className="h-24 p-3" style={{ backgroundColor: background }}>
      <div className="flex items-center justify-between">
        <span className="h-2 w-12 rounded-full" style={{ backgroundColor: text, opacity: 0.85 }} />
        <span className="h-5 w-12" style={{ backgroundColor: accent, borderRadius: rounded }} />
      </div>
      <div className="mt-3 grid grid-cols-[1.2fr_.8fr] gap-2">
        <div>
          <span className="block h-2 w-4/5 rounded-full" style={{ backgroundColor: text, opacity: 0.8 }} />
          <span className="mt-1.5 block h-1.5 w-3/5 rounded-full" style={{ backgroundColor: text, opacity: 0.3 }} />
          <span className="mt-2 block h-4 w-14" style={{ backgroundColor: accent, borderRadius: rounded }} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[0, 1].map((item) => (
            <span key={item} className="block border" style={{ backgroundColor: `${text}10`, borderColor: `${text}18`, borderRadius: rounded }} />
          ))}
        </div>
      </div>
    </div>
  )
}
