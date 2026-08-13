'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { FONT_PRESETS, normalizeThemeFontSelection } from '@/data/defaults'
import { updateStoreTheme } from '@/lib/actions/store'
import { getContrastRatio } from '@/lib/utils/color'
import { cn } from '@/lib/utils'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { StoreTheme } from '@/types/store'

export type SimpleThemeSection = 'fuentes' | 'colores' | 'layout' | 'productos'

export function SimpleThemeForm({ theme, activeSection }: { theme: StoreTheme; activeSection: SimpleThemeSection }) {
  const normalized = useMemo(() => normalizeThemeFontSelection(theme), [theme])
  const [moreColors, setMoreColors] = useState(false)
  const [saved, setSaved] = useState(false)
  const { handleSubmit, setValue, control, formState: { isSubmitting } } = useForm<StoreThemeInput>({
    resolver: zodResolver(storeThemeSchema),
    defaultValues: {
      primary_color: normalized.primary_color, secondary_color: normalized.secondary_color,
      accent_color: normalized.accent_color, background_color: normalized.background_color,
      surface_color: normalized.surface_color, text_color: normalized.text_color,
      visual_mode: normalized.visual_mode as StoreThemeInput['visual_mode'],
      border_radius: normalized.border_radius as StoreThemeInput['border_radius'],
      container_width: normalized.container_width as StoreThemeInput['container_width'],
      font_preset: normalized.font_preset as StoreThemeInput['font_preset'],
      heading_font: normalized.heading_font as StoreThemeInput['heading_font'],
      body_font: normalized.body_font as StoreThemeInput['body_font'],
      font_family: normalized.font_family as StoreThemeInput['font_family'],
      heading_scale: normalized.heading_scale as StoreThemeInput['heading_scale'],
      heading_weight: normalized.heading_weight as StoreThemeInput['heading_weight'],
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
    },
  })
  const values = useWatch({ control })
  const current = { ...normalized, ...values } as StoreTheme

  function set<K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) { setValue(name as never, value as never, { shouldDirty: true }); setSaved(false) }
  function chooseFont(value: StoreThemeInput['font_preset']) {
    const preset = FONT_PRESETS.find((item) => item.value === value); if (!preset) return
    set('font_preset', value); set('heading_font', preset.heading_font as StoreThemeInput['heading_font']); set('body_font', preset.body_font as StoreThemeInput['body_font']); set('font_family', preset.body_font as StoreThemeInput['font_family']); set('heading_weight', preset.heading_weight as StoreThemeInput['heading_weight'])
  }
  function background(mode: 'light' | 'dark') {
    if (mode === 'light') { set('visual_mode', 'light'); set('background_color', '#ffffff'); set('surface_color', '#f7f8fa'); set('text_color', '#111827') }
    else { set('visual_mode', 'dark'); set('background_color', '#0b0b0f'); set('surface_color', '#15161a'); set('text_color', '#f8fafc') }
  }
  async function onSubmit(data: StoreThemeInput) {
    const result = await updateStoreTheme({ ...data, font_family: data.body_font })
    if (result?.error) { toast.error('No pudimos guardar.'); return }
    setSaved(true); toast.success('Diseño guardado.'); setTimeout(() => setSaved(false), 2200)
  }

  const readable = getContrastRatio(current.text_color, current.background_color) >= 4.5

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
    {activeSection === 'colores' ? <>
      <Panel title="Color de tu marca"><ColorChoice label="Color principal" value={current.primary_color} onChange={(value) => set('primary_color', value)} /></Panel>
      <Panel title="Fondo"><div className="grid grid-cols-2 gap-2"><Choice selected={current.visual_mode !== 'dark'} onClick={() => background('light')}>Claro</Choice><Choice selected={current.visual_mode === 'dark'} onClick={() => background('dark')}>Oscuro</Choice></div><div className={cn('mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium', readable ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300')}>{readable ? <Check className="size-4" /> : null}{readable ? 'Se lee bien' : 'Estos colores cuestan leer'}</div></Panel>
      <button type="button" onClick={() => setMoreColors((value) => !value)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-black/8 bg-white text-sm font-medium text-foreground dark:border-white/10 dark:bg-[#111820]">Más colores <ChevronDown className={cn('size-4', moreColors && 'rotate-180')} /></button>
      {moreColors ? <Panel title="Detalles"><div className="grid gap-2 sm:grid-cols-2"><ColorChoice label="Acentos" value={current.accent_color} onChange={(value) => set('accent_color', value)} /><ColorChoice label="Secundario" value={current.secondary_color} onChange={(value) => set('secondary_color', value)} /></div></Panel> : null}
    </> : null}

    {activeSection === 'fuentes' ? <Panel title="Estilo de letras"><div className="grid grid-cols-2 gap-2">{FONT_PRESETS.slice(0, 4).map((preset) => <Choice key={preset.value} selected={current.font_preset === preset.value} onClick={() => chooseFont(preset.value as StoreThemeInput['font_preset'])}>{preset.label}</Choice>)}</div></Panel> : null}

    {activeSection === 'productos' ? <><Panel title="Cómo se ven"><div className="grid grid-cols-3 gap-2"><Choice selected={current.card_layout === 'classic'} onClick={() => set('card_layout', 'classic')}>Clásicos</Choice><Choice selected={current.card_layout === 'visual'} onClick={() => set('card_layout', 'visual')}>Visuales</Choice><Choice selected={current.card_layout === 'compact'} onClick={() => set('card_layout', 'compact')}>Compactos</Choice></div></Panel><Panel title="Productos por fila"><div className="grid grid-cols-2 gap-2"><Choice selected={current.grid_columns === 2} onClick={() => set('grid_columns', 2)}>2 por fila</Choice><Choice selected={current.grid_columns === 3} onClick={() => set('grid_columns', 3)}>3 por fila</Choice></div></Panel></> : null}

    {activeSection === 'layout' ? <><Panel title="Espaciado"><div className="grid grid-cols-3 gap-2"><Choice selected={current.spacing_scale === 'tight'} onClick={() => set('spacing_scale', 'tight')}>Compacto</Choice><Choice selected={current.spacing_scale === 'balanced'} onClick={() => set('spacing_scale', 'balanced')}>Balanceado</Choice><Choice selected={current.spacing_scale === 'airy'} onClick={() => set('spacing_scale', 'airy')}>Con aire</Choice></div></Panel></> : null}

    <div className="flex justify-end"><SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar" /></div>
  </form>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820]"><h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>{children}</section> }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={cn('min-h-11 rounded-[10px] border px-2 text-sm font-medium', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}>{children}</button> }
function ColorChoice({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="flex min-h-12 cursor-pointer items-center justify-between rounded-[10px] border border-black/8 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/[0.03]"><span className="text-sm font-medium text-foreground">{label}</span><span className="relative size-8 overflow-hidden rounded-full border border-black/10" style={{ backgroundColor: value }}><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" /></span></label> }
