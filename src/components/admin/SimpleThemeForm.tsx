'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { FONT_FAMILY_MAP, FONT_PRESETS, normalizeThemeFontSelection } from '@/data/defaults'
import { updateStoreTheme } from '@/lib/actions/store'
import { getAccessibleTextColor, getContrastRatio, mixHexColors } from '@/lib/utils/color'
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
      primary_color: normalized.primary_color, secondary_color: normalized.secondary_color, accent_color: normalized.accent_color, background_color: normalized.background_color, surface_color: normalized.surface_color, text_color: normalized.text_color,
      visual_mode: normalized.visual_mode as StoreThemeInput['visual_mode'], border_radius: normalized.border_radius as StoreThemeInput['border_radius'], container_width: normalized.container_width as StoreThemeInput['container_width'], font_preset: normalized.font_preset as StoreThemeInput['font_preset'], heading_font: normalized.heading_font as StoreThemeInput['heading_font'], body_font: normalized.body_font as StoreThemeInput['body_font'], font_family: normalized.font_family as StoreThemeInput['font_family'], heading_scale: normalized.heading_scale as StoreThemeInput['heading_scale'], heading_weight: normalized.heading_weight as StoreThemeInput['heading_weight'], body_scale: normalized.body_scale as StoreThemeInput['body_scale'], ui_density: normalized.ui_density as StoreThemeInput['ui_density'], spacing_scale: normalized.spacing_scale as StoreThemeInput['spacing_scale'], card_style: normalized.card_style as StoreThemeInput['card_style'], card_layout: normalized.card_layout as StoreThemeInput['card_layout'], button_style: normalized.button_style as StoreThemeInput['button_style'], grid_columns: normalized.grid_columns, image_ratio: normalized.image_ratio as StoreThemeInput['image_ratio'], background_color_2: normalized.background_color_2 ?? null, background_direction: (normalized.background_direction ?? 'diagonal') as StoreThemeInput['background_direction'],
    },
  })
  const values = useWatch({ control })
  const current = { ...normalized, ...values } as StoreTheme
  const set = <K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) => { setValue(name as never, value as never, { shouldDirty: true }); setSaved(false) }

  function chooseFont(value: StoreThemeInput['font_preset']) {
    const preset = FONT_PRESETS.find((item) => item.value === value)
    if (!preset) return
    set('font_preset', value)
    set('heading_font', preset.heading_font as StoreThemeInput['heading_font'])
    set('body_font', preset.body_font as StoreThemeInput['body_font'])
    set('font_family', preset.body_font as StoreThemeInput['font_family'])
    set('heading_weight', preset.heading_weight as StoreThemeInput['heading_weight'])
  }

  function background(mode: 'light' | 'dark') {
    if (mode === 'light') {
      set('visual_mode', 'light'); set('background_color', '#ffffff'); set('background_color_2', null); set('surface_color', '#f7f8fa'); set('text_color', '#111827')
    } else {
      set('visual_mode', 'dark'); set('background_color', '#0b0b0f'); set('background_color_2', null); set('surface_color', '#15161a'); set('text_color', '#f8fafc')
    }
  }

  function customBackground(value: string) {
    const text = getAccessibleTextColor(value)
    const darkMode = text === '#f8fafc'
    set('background_color', value)
    set('background_color_2', null)
    set('text_color', text)
    set('visual_mode', darkMode ? 'dark' : 'light')
    set('surface_color', darkMode ? mixHexColors(value, '#ffffff', 0.08) : mixHexColors(value, '#ffffff', 0.76))
  }

  async function onSubmit(data: StoreThemeInput) {
    const result = await updateStoreTheme({ ...data, font_family: data.body_font })
    if (result?.error) { toast.error('No pudimos guardar.'); return }
    setSaved(true); toast.success('Diseño guardado.'); setTimeout(() => setSaved(false), 2200)
  }
  const readable = getContrastRatio(current.text_color, current.background_color) >= 4.5

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
    {activeSection === 'colores' ? <>
      <Panel title="Colores principales" description="El color de marca vende la identidad. El fondo define cómo se siente toda la tienda.">
        <div className="grid gap-2 sm:grid-cols-2">
          <ColorChoice label="Color de tu marca" value={current.primary_color} onChange={(value) => set('primary_color', value)} />
          <ColorChoice label="Fondo de la tienda" value={current.background_color} onChange={customBackground} />
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Al cambiar el fondo, VOLTA ajusta automáticamente texto y superficie para mantener buena lectura.</p>
      </Panel>
      <Panel title="Atajo de aspecto" description="Si preferís no elegir un color, usá uno de estos dos puntos de partida."><div className="grid grid-cols-2 gap-2"><Choice selected={current.visual_mode !== 'dark'} onClick={() => background('light')}>Tienda clara</Choice><Choice selected={current.visual_mode === 'dark'} onClick={() => background('dark')}>Tienda oscura</Choice></div><div className={cn('mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium', readable ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300')}>{readable ? <Check className="size-4" /> : null}{readable ? 'Se lee bien' : 'Estos colores cuestan leer'}</div></Panel>
      <button type="button" onClick={() => setMoreColors((value) => !value)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-black/8 bg-white text-sm font-medium text-foreground dark:border-white/10 dark:bg-[#111820]">Más opciones <ChevronDown className={cn('size-4', moreColors && 'rotate-180')} /></button>
      {moreColors ? <Panel title="Detalles opcionales" description="No hace falta tocarlos salvo que quieras afinar más el resultado."><div className="grid gap-2 sm:grid-cols-2"><ColorChoice label="Superficie de tarjetas" value={current.surface_color} onChange={(value) => set('surface_color', value)} /><ColorChoice label="Detalles destacados" value={current.accent_color} onChange={(value) => set('accent_color', value)} /><ColorChoice label="Color secundario" value={current.secondary_color} onChange={(value) => set('secondary_color', value)} /></div></Panel> : null}
    </> : null}
    {activeSection === 'fuentes' ? <Panel title="Estilo de letras" description="Elegí mirando cómo se ve una frase real. No necesitás conocer el nombre de la fuente."><div className="grid gap-2 sm:grid-cols-2">{FONT_PRESETS.slice(0, 4).map((preset) => <FontPresetChoice key={preset.value} preset={preset} selected={current.font_preset === preset.value} onClick={() => chooseFont(preset.value as StoreThemeInput['font_preset'])} />)}</div></Panel> : null}
    {activeSection === 'productos' ? <><Panel title="Cómo se ven" description="Elegí la forma de las tarjetas de producto."><div className="grid grid-cols-3 gap-2"><CardChoice variant="classic" selected={current.card_layout === 'classic'} onClick={() => set('card_layout', 'classic')} label="Clásicos" /><CardChoice variant="visual" selected={current.card_layout === 'visual'} onClick={() => set('card_layout', 'visual')} label="Visuales" /><CardChoice variant="compact" selected={current.card_layout === 'compact'} onClick={() => set('card_layout', 'compact')} label="Compactos" /></div></Panel><Panel title="Productos por fila" description="Solo cambia cuántos productos aparecen uno al lado del otro."><div className="grid grid-cols-3 gap-2"><GridChoice columns={2} selected={current.grid_columns === 2} onClick={() => set('grid_columns', 2)} /><GridChoice columns={3} selected={current.grid_columns === 3} onClick={() => set('grid_columns', 3)} /><GridChoice columns={4} selected={current.grid_columns === 4} onClick={() => set('grid_columns', 4)} /></div></Panel></> : null}
    {activeSection === 'layout' ? <Panel title="Espaciado" description="Elegí cuánto aire querés entre bloques mirando la miniatura."><div className="grid grid-cols-3 gap-2"><SpacingChoice label="Compacto" gap="tight" selected={current.spacing_scale === 'tight'} onClick={() => set('spacing_scale', 'tight')} /><SpacingChoice label="Balanceado" gap="balanced" selected={current.spacing_scale === 'balanced'} onClick={() => set('spacing_scale', 'balanced')} /><SpacingChoice label="Con aire" gap="airy" selected={current.spacing_scale === 'airy'} onClick={() => set('spacing_scale', 'airy')} /></div></Panel> : null}
    <div className="flex justify-end"><SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar" /></div>
  </form>
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="rounded-[14px] border border-black/8 bg-white p-3.5 dark:border-white/10 dark:bg-[#111820]"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{description ? <p className="mb-3 mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : <div className="mb-3" />}{children}</section> }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={cn('min-h-11 rounded-[10px] border px-2 text-sm font-medium text-foreground', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}>{children}</button> }
function FontPresetChoice({ preset, selected, onClick }: { preset: (typeof FONT_PRESETS)[number]; selected: boolean; onClick: () => void }) { const weight = preset.heading_weight === 'bold' ? 700 : preset.heading_weight === 'medium' ? 500 : 600; return <button type="button" onClick={onClick} className={cn('min-h-[92px] rounded-[12px] border p-3 text-left transition active:scale-[0.99]', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{preset.label}</span><span className="mt-2 block text-[1.05rem] leading-tight text-foreground" style={{ fontFamily: FONT_FAMILY_MAP[preset.heading_font], fontWeight: weight }}>Tu tienda, a tu estilo.</span><span className="mt-1.5 block text-[11px] leading-4 text-muted-foreground" style={{ fontFamily: FONT_FAMILY_MAP[preset.body_font] }}>Productos claros, simples de elegir.</span></button> }
function SpacingChoice({ label, gap, selected, onClick }: { label: string; gap: 'tight' | 'balanced' | 'airy'; selected: boolean; onClick: () => void }) { const spacing = gap === 'tight' ? 'gap-1' : gap === 'balanced' ? 'gap-2' : 'gap-3'; return <button type="button" onClick={onClick} className={cn('rounded-[10px] border p-2.5 text-foreground transition active:scale-[0.99]', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}><span className={cn('mx-auto flex h-[54px] max-w-[86px] flex-col justify-center rounded-[8px] border border-black/6 bg-white p-2 dark:border-white/8 dark:bg-white/[0.04]', spacing)}><span className="h-2 w-3/4 rounded bg-slate-300 dark:bg-white/25" /><span className="h-3 w-full rounded bg-slate-200 dark:bg-white/15" /><span className="h-2 w-5/6 rounded bg-slate-300 dark:bg-white/25" /></span><span className="mt-2 block text-[11px] font-semibold">{label}</span></button> }
function ColorChoice({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="flex min-h-12 cursor-pointer items-center justify-between rounded-[10px] border border-black/8 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/[0.03]"><span className="text-sm font-medium text-foreground">{label}</span><span className="relative size-8 overflow-hidden rounded-full border border-black/10" style={{ backgroundColor: value }}><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" /></span></label> }
function CardChoice({ variant, selected, onClick, label }: { variant: 'classic' | 'visual' | 'compact'; selected: boolean; onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className={cn('rounded-[10px] border p-2 text-foreground', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}><CardSketch variant={variant} /><span className="mt-2 block text-[11px] font-semibold">{label}</span></button> }
function CardSketch({ variant }: { variant: 'classic' | 'visual' | 'compact' }) { if (variant === 'compact') return <div className="space-y-1">{[1,2].map((i) => <div key={i} className="flex h-5 gap-1 rounded border border-black/8 bg-white p-0.5 dark:border-white/10 dark:bg-white/5"><span className="w-5 rounded-sm bg-slate-300 dark:bg-white/15" /><span className="mt-1 h-1 w-8 rounded bg-slate-400/50" /></div>)}</div>; if (variant === 'visual') return <div className="grid grid-cols-2 gap-1">{[1,2].map((i) => <div key={i} className="relative h-10 rounded bg-slate-300 dark:bg-white/15"><span className="absolute inset-x-1 bottom-1 h-1 rounded bg-white/80" /></div>)}</div>; return <div className="grid grid-cols-2 gap-1">{[1,2].map((i) => <div key={i} className="overflow-hidden rounded border border-black/8 bg-white dark:border-white/10 dark:bg-white/5"><div className="h-6 bg-slate-300 dark:bg-white/15" /><div className="m-1 h-1 rounded bg-slate-400/50" /></div>)}</div> }
function GridChoice({ columns, selected, onClick }: { columns: 2 | 3 | 4; selected: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={cn('rounded-[10px] border p-2.5 text-foreground', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}><div className="flex items-center justify-center gap-1.5 py-2">{Array.from({ length: columns }).map((_, i) => <span key={i} className="size-2.5 rounded-full bg-slate-400 dark:bg-white/35" />)}</div><span className="mt-1 block text-xs font-semibold">{columns}</span></button> }
