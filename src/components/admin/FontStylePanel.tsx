'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { FONT_FAMILY_MAP, normalizeThemeFontSelection } from '@/data/defaults'
import { updateStoreTheme } from '@/lib/actions/store'
import type { StoreThemeInput } from '@/lib/validations/store'
import { cn } from '@/lib/utils'
import type { StoreTheme } from '@/types/store'

type FontChoice = {
  value: StoreThemeInput['font_preset']
  label: string
  description: string
  heading: StoreThemeInput['heading_font']
  body: StoreThemeInput['body_font']
  weight: StoreThemeInput['heading_weight']
  sample: string
}

const CHOICES: FontChoice[] = [
  { value: 'modern', label: 'Moderna', description: 'Clara, comercial y versátil.', heading: 'plus-jakarta', body: 'geist', weight: 'semibold', sample: 'Strong Protein' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, directa y muy limpia.', heading: 'geist', body: 'geist', weight: 'medium', sample: 'Strong Protein' },
  { value: 'elegant', label: 'Editorial', description: 'Más carácter para marcas premium.', heading: 'playfair', body: 'geist', weight: 'semibold', sample: 'Strong Protein' },
  { value: 'bold', label: 'Con fuerza', description: 'Más peso para productos y precios.', heading: 'plus-jakarta', body: 'geist', weight: 'bold', sample: 'STRONG PROTEIN' },
]

export function FontStylePanel({ theme }: { theme: StoreTheme }) {
  const normalized = useMemo(() => normalizeThemeFontSelection(theme), [theme])
  const initial = CHOICES.some((choice) => choice.value === normalized.font_preset) ? normalized.font_preset as StoreThemeInput['font_preset'] : 'modern'
  const [selected, setSelected] = useState<StoreThemeInput['font_preset']>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const choice = CHOICES.find((item) => item.value === selected) ?? CHOICES[0]
    setSaving(true)
    setSaved(false)

    const payload: StoreThemeInput = {
      primary_color: normalized.primary_color,
      secondary_color: normalized.secondary_color,
      accent_color: normalized.accent_color,
      background_color: normalized.background_color,
      surface_color: normalized.surface_color,
      text_color: normalized.text_color,
      visual_mode: normalized.visual_mode as StoreThemeInput['visual_mode'],
      border_radius: normalized.border_radius as StoreThemeInput['border_radius'],
      container_width: normalized.container_width as StoreThemeInput['container_width'],
      font_preset: choice.value,
      heading_font: choice.heading,
      body_font: choice.body,
      font_family: choice.body,
      heading_scale: normalized.heading_scale as StoreThemeInput['heading_scale'],
      heading_weight: choice.weight,
      body_scale: normalized.body_scale as StoreThemeInput['body_scale'],
      ui_density: normalized.ui_density as StoreThemeInput['ui_density'],
      spacing_scale: normalized.spacing_scale as StoreThemeInput['spacing_scale'],
      card_style: normalized.card_style as StoreThemeInput['card_style'],
      card_layout: normalized.card_layout as StoreThemeInput['card_layout'],
      button_style: normalized.button_style as StoreThemeInput['button_style'],
      grid_columns: normalized.grid_columns,
      image_ratio: normalized.image_ratio as StoreThemeInput['image_ratio'],
      background_color_2: normalized.background_color_2 ?? null,
      background_direction: (normalized.background_direction ?? 'diagonal') as StoreThemeInput['background_direction'],
    }

    const result = await updateStoreTheme(payload)
    setSaving(false)
    if (result?.error) {
      toast.error('No pudimos guardar las letras.')
      return
    }
    setSaved(true)
    toast.success('Estilo de letras actualizado.')
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <section className="rounded-[14px] border border-black/8 bg-white p-3.5 dark:border-white/10 dark:bg-[#111820] sm:p-5">
        <div className="max-w-2xl">
          <h3 className="text-sm font-semibold text-foreground">Personalidad de la tienda</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Elegí mirando el resultado. VOLTA aplica la combinación al título, productos y textos de forma consistente.</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CHOICES.map((choice) => {
            const active = selected === choice.value
            const weight = choice.weight === 'bold' ? 720 : choice.weight === 'medium' ? 560 : 640
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => setSelected(choice.value)}
                className={cn('relative min-h-[150px] overflow-hidden rounded-[14px] border p-4 text-left transition active:scale-[0.99]', active ? 'border-[#12e89a] bg-emerald-50 shadow-sm dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 hover:border-black/15 dark:border-white/10 dark:bg-white/[0.03]')}
              >
                {active ? <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-[#12e89a] text-[#062117]"><Check className="size-3.5" /></span> : null}
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{choice.label}</span>
                <span className="mt-5 block truncate text-[1.65rem] leading-none tracking-[-0.045em] text-foreground" style={{ fontFamily: FONT_FAMILY_MAP[choice.heading], fontWeight: weight }}>{choice.sample}</span>
                <span className="mt-3 block text-[11px] leading-5 text-muted-foreground" style={{ fontFamily: FONT_FAMILY_MAP[choice.body] }}>{choice.description}</span>
                <span className="mt-3 block text-lg font-bold tracking-[-0.03em] text-foreground" style={{ fontFamily: FONT_FAMILY_MAP[choice.heading], fontWeight: weight }}>$ 145.200</span>
              </button>
            )
          })}
        </div>
      </section>
      <div className="flex justify-end"><SaveButton isLoading={saving} isSaved={saved} label="Guardar letras" /></div>
    </form>
  )
}
