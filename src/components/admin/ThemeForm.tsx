'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Contrast } from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import {
  BORDER_RADIUS_OPTIONS,
  FONT_FAMILY_MAP,
  FONT_OPTIONS,
  FONT_PRESETS,
  HEADING_WEIGHT_OPTIONS,
  IMAGE_RATIO_OPTIONS,
  VISUAL_MODE_OPTIONS,
} from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import { updateStoreTheme } from '@/lib/actions/store'
import { getAccessibleTextColor, getContrastRatio, withAlpha } from '@/lib/utils/color'
import { buildThemeVars } from '@/lib/utils/theme'
import { cn } from '@/lib/utils'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { StoreTheme } from '@/types/store'

export type ThemeSection = 'fuentes' | 'colores' | 'layout'

type ThemeFormProps = {
  theme: StoreTheme
  activeSection: ThemeSection
}

type VisualOption = {
  value: string
  label: string
}

const COLOR_FIELDS = [
  { name: 'primary_color' as const, label: 'Primary' },
  { name: 'secondary_color' as const, label: 'Secondary' },
  { name: 'accent_color' as const, label: 'Accent' },
  { name: 'background_color' as const, label: 'Background' },
  { name: 'surface_color' as const, label: 'Surface' },
  { name: 'text_color' as const, label: 'Text' },
]

const SCALE_OPTIONS: VisualOption[] = [
  { value: 'compact', label: 'Compacta' },
  { value: 'default', label: 'Balanceada' },
  { value: 'large', label: 'Amplia' },
]

const BODY_SCALE_OPTIONS: VisualOption[] = [
  { value: 'sm', label: 'Compacta' },
  { value: 'base', label: 'Media' },
  { value: 'lg', label: 'Amplia' },
]

const CARD_OPTIONS: VisualOption[] = [
  { value: 'soft', label: 'Suaves' },
  { value: 'sharp', label: 'Firmes' },
  { value: 'glass', label: 'Cristal' },
]

const BUTTON_OPTIONS: VisualOption[] = [
  { value: 'rounded', label: 'Redondeados' },
  { value: 'square', label: 'Rectos' },
  { value: 'pill', label: 'Capsula' },
]

const DENSITY_OPTIONS: VisualOption[] = [
  { value: 'compact', label: 'Compacto' },
  { value: 'comfortable', label: 'Balanceado' },
  { value: 'spacious', label: 'Con aire' },
]

const SPACING_OPTIONS: VisualOption[] = [
  { value: 'tight', label: 'Corto' },
  { value: 'balanced', label: 'Balanceado' },
  { value: 'airy', label: 'Amplio' },
]

const WIDTH_OPTIONS: VisualOption[] = [
  { value: 'sm', label: 'Estrecho' },
  { value: 'md', label: 'Medio' },
  { value: 'lg', label: 'Amplio' },
  { value: 'xl', label: 'Grande' },
  { value: 'full', label: 'Completo' },
]

const GRID_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 2, label: '2 col' },
  { value: 3, label: '3 col' },
  { value: 4, label: '4 col' },
]

const WIDTH_VISUAL: Record<string, string> = {
  sm: '52%',
  md: '66%',
  lg: '80%',
  xl: '92%',
  full: '100%',
}

function colorLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 0.5
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export function ThemeForm({ theme, activeSection }: ThemeFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light')

  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreThemeInput>({
    resolver: zodResolver(storeThemeSchema),
    defaultValues: {
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      accent_color: theme.accent_color,
      background_color: theme.background_color,
      surface_color: theme.surface_color,
      text_color: theme.text_color,
      visual_mode: theme.visual_mode as StoreThemeInput['visual_mode'],
      border_radius: theme.border_radius as StoreThemeInput['border_radius'],
      container_width: theme.container_width as StoreThemeInput['container_width'],
      font_preset: theme.font_preset as StoreThemeInput['font_preset'],
      heading_font: theme.heading_font as StoreThemeInput['heading_font'],
      body_font: theme.body_font as StoreThemeInput['body_font'],
      font_family: theme.font_family as StoreThemeInput['font_family'],
      heading_scale: theme.heading_scale as StoreThemeInput['heading_scale'],
      heading_weight: theme.heading_weight as StoreThemeInput['heading_weight'],
      body_scale: theme.body_scale as StoreThemeInput['body_scale'],
      ui_density: theme.ui_density as StoreThemeInput['ui_density'],
      spacing_scale: theme.spacing_scale as StoreThemeInput['spacing_scale'],
      card_style: theme.card_style as StoreThemeInput['card_style'],
      card_layout: theme.card_layout as StoreThemeInput['card_layout'],
      button_style: theme.button_style as StoreThemeInput['button_style'],
      grid_columns: theme.grid_columns,
      image_ratio: theme.image_ratio as StoreThemeInput['image_ratio'],
    },
  })

  const values = useWatch({ control })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystemMode(media.matches ? 'dark' : 'light')
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const previewTheme = useMemo(
    () =>
      ({
        ...theme,
        ...values,
        font_family: values?.body_font ?? theme.body_font,
        grid_columns: values?.grid_columns ?? theme.grid_columns,
      }) as StoreTheme,
    [theme, values],
  )

  const resolvedMode =
    previewTheme.visual_mode === 'auto'
      ? systemMode
      : previewTheme.visual_mode === 'dark'
        ? 'dark'
        : 'light'

  const previewThemeVars = useMemo(
    () => buildThemeVars(previewTheme, resolvedMode),
    [previewTheme, resolvedMode],
  )

  const contrastTextOnBg = getContrastRatio(previewTheme.text_color, previewTheme.background_color).toFixed(1)
  const contrastTextOnSurface = getContrastRatio(previewTheme.text_color, previewTheme.surface_color).toFixed(1)
  const contrastPrimary = getContrastRatio(getAccessibleTextColor(previewTheme.primary_color), previewTheme.primary_color).toFixed(1)

  async function onSubmit(data: StoreThemeInput) {
    setSubmitError(null)
    const result = await updateStoreTheme({
      ...data,
      font_family: data.body_font,
    })

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }

    setSaved(true)
    toast.success('Apariencia guardada.')
    setTimeout(() => setSaved(false), 2500)
  }

  function setThemeValue<K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) {
    setValue(name as never, value as never, { shouldDirty: true })
  }

  function applyPreset(value: StoreThemeInput['font_preset']) {
    const preset = FONT_PRESETS.find((item) => item.value === value)
    if (!preset) return
    setThemeValue('font_preset', value)
    setThemeValue('heading_font', preset.heading_font as StoreThemeInput['heading_font'])
    setThemeValue('body_font', preset.body_font as StoreThemeInput['body_font'])
    setThemeValue('font_family', preset.body_font as StoreThemeInput['font_family'])
    setThemeValue('heading_weight', preset.heading_weight as StoreThemeInput['heading_weight'])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {activeSection === 'fuentes' ? (
        <EditorShell
          controls={
            <FontsControls
              theme={previewTheme}
              applyPreset={applyPreset}
              setThemeValue={setThemeValue}
            />
          }
          preview={<TypographyLivePreview previewThemeVars={previewThemeVars} />}
        />
      ) : null}

      {activeSection === 'colores' ? (
        <EditorShell
          controls={
            <ColorsControls
              theme={previewTheme}
              setThemeValue={setThemeValue}
              register={register}
              errors={errors}
              contrastTextOnBg={contrastTextOnBg}
              contrastTextOnSurface={contrastTextOnSurface}
              contrastPrimary={contrastPrimary}
            />
          }
          preview={<ColorStoreMockup previewThemeVars={previewThemeVars} />}
        />
      ) : null}

      {activeSection === 'layout' ? (
        <EditorShell
          controls={
            <LayoutControls
              theme={previewTheme}
              setThemeValue={setThemeValue}
            />
          }
          preview={<DesignLivePreview previewThemeVars={previewThemeVars} columns={previewTheme.grid_columns} imageRatio={previewTheme.image_ratio} containerWidth={previewTheme.container_width} />}
        />
      ) : null}

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Apariencia guardada" message="La tienda ya refleja los cambios." /> : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar apariencia" />
      </div>
    </form>
  )
}

function EditorShell({
  controls,
  preview,
}: {
  controls: React.ReactNode
  preview: React.ReactNode
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="admin-surface rounded-[24px] p-4 sm:p-5">{controls}</div>
      <div className="xl:sticky xl:top-6 xl:self-start">{preview}</div>
    </section>
  )
}

function SegmentGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: VisualOption[]
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[12px] px-2 py-2 text-xs font-medium transition duration-150',
              selected === option.value ? 'admin-surface-selected text-white' : 'admin-button-soft text-neutral-400 hover:text-white',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function PillGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: VisualOption[]
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[12px] px-3 py-1.5 text-xs font-medium transition duration-150',
              selected === option.value ? 'admin-surface-selected text-white' : 'admin-button-soft text-neutral-400 hover:text-white',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ContrastStat({ label, value }: { label: string; value: string }) {
  const numeric = Number(value)
  return (
    <div className="admin-surface-muted rounded-[16px] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]', numeric >= 4.5 ? 'bg-emerald-400/12 text-emerald-200' : 'bg-amber-400/12 text-amber-200')}>
          {numeric >= 4.5 ? 'OK' : 'Revisar'}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Contrast className="size-3.5 text-emerald-200" />
        <p className="text-base font-semibold text-white">{value}:1</p>
      </div>
    </div>
  )
}

function FontRow({
  value,
  label,
  style,
  selected,
  onClick,
}: {
  value: string
  label: string
  style: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition duration-150',
        selected ? 'admin-surface-selected' : 'hover:bg-white/[0.06]',
      )}
    >
      <span
        className="w-9 shrink-0 text-xl font-semibold leading-none text-white"
        style={{ fontFamily: FONT_FAMILY_MAP[value] }}
      >
        Aa
      </span>
      <span className={cn('flex-1 text-sm', selected ? 'font-medium text-white' : 'text-neutral-300')}>
        {label}
      </span>
      <span className="text-[11px] text-neutral-500">{style}</span>
      {selected ? <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" /> : null}
    </button>
  )
}

function FontsControls({
  theme,
  applyPreset,
  setThemeValue,
}: {
  theme: StoreTheme
  applyPreset: (value: StoreThemeInput['font_preset']) => void
  setThemeValue: <K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) => void
}) {
  return (
    <div className="space-y-5">
      {/* Presets */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Preset tipografico</p>
        <div className="flex flex-wrap gap-1.5">
          {FONT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => applyPreset(preset.value as StoreThemeInput['font_preset'])}
              className={cn(
                'rounded-[14px] px-3.5 py-2 text-sm font-medium transition duration-150',
                theme.font_preset === preset.value
                  ? 'admin-surface-selected text-white'
                  : 'admin-button-soft text-neutral-400 hover:text-white',
              )}
              style={{ fontFamily: FONT_FAMILY_MAP[preset.heading_font] }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font pickers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Fuente de titulos</p>
          <div className="space-y-0.5">
            {FONT_OPTIONS.map((option) => (
              <FontRow
                key={`h-${option.value}`}
                value={option.value}
                label={option.label}
                style={option.style}
                selected={theme.heading_font === option.value}
                onClick={() => setThemeValue('heading_font', option.value as StoreThemeInput['heading_font'])}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Fuente de texto</p>
          <div className="space-y-0.5">
            {FONT_OPTIONS.map((option) => (
              <FontRow
                key={`b-${option.value}`}
                value={option.value}
                label={option.label}
                style={option.style}
                selected={theme.body_font === option.value}
                onClick={() => {
                  setThemeValue('body_font', option.value as StoreThemeInput['body_font'])
                  setThemeValue('font_family', option.value as StoreThemeInput['font_family'])
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fine controls */}
      <div className="grid grid-cols-3 gap-3">
        <SegmentGroup
          title="Escala titulos"
          options={SCALE_OPTIONS}
          selected={theme.heading_scale}
          onChange={(value) => setThemeValue('heading_scale', value as StoreThemeInput['heading_scale'])}
        />
        <SegmentGroup
          title="Peso"
          options={HEADING_WEIGHT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          selected={theme.heading_weight}
          onChange={(value) => setThemeValue('heading_weight', value as StoreThemeInput['heading_weight'])}
        />
        <SegmentGroup
          title="Escala texto"
          options={BODY_SCALE_OPTIONS}
          selected={theme.body_scale}
          onChange={(value) => setThemeValue('body_scale', value as StoreThemeInput['body_scale'])}
        />
      </div>
    </div>
  )
}

function ColorsControls({
  theme,
  setThemeValue,
  register,
  errors,
  contrastTextOnBg,
  contrastTextOnSurface,
  contrastPrimary,
}: {
  theme: StoreTheme
  setThemeValue: <K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) => void
  register: ReturnType<typeof useForm<StoreThemeInput>>['register']
  errors: ReturnType<typeof useForm<StoreThemeInput>>['formState']['errors']
  contrastTextOnBg: string
  contrastTextOnSurface: string
  contrastPrimary: string
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {COLOR_FIELDS.map((field) => {
          const value = theme[field.name]
          const lum = colorLuminance(value)
          const swatchRing = lum > 0.55 ? 'rgba(0,0,0,0.22)' : lum > 0.28 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.18)'
          return (
            <label key={field.name} className="admin-surface-muted rounded-[18px] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{field.label}</span>
                <span
                  className="size-5 shrink-0 rounded-full"
                  style={{ backgroundColor: value, boxShadow: `0 0 0 1.5px ${swatchRing}` }}
                />
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(event) => setThemeValue(field.name, event.target.value as StoreThemeInput[typeof field.name])}
                  className="size-10 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                />
                <input
                  {...register(field.name)}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-black/10 px-3 font-mono text-sm text-white"
                />
              </div>
              {errors[field.name] ? <p className="mt-1.5 text-xs text-red-300">{errors[field.name]?.message}</p> : null}
            </label>
          )
        })}
      </div>

      <PillGroup
        title="Modo visual"
        options={VISUAL_MODE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
        selected={theme.visual_mode}
        onChange={(value) => setThemeValue('visual_mode', value as StoreThemeInput['visual_mode'])}
      />

      <div className="grid gap-2.5 sm:grid-cols-3">
        <ContrastStat label="Texto / fondo" value={contrastTextOnBg} />
        <ContrastStat label="Texto / surface" value={contrastTextOnSurface} />
        <ContrastStat label="CTA" value={contrastPrimary} />
      </div>
    </div>
  )
}

function LayoutControls({
  theme,
  setThemeValue,
}: {
  theme: StoreTheme
  setThemeValue: <K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) => void
}) {
  return (
    <div className="space-y-5">
      {/* 1. Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PillGroup
          title="Columnas"
          options={GRID_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
          selected={String(theme.grid_columns)}
          onChange={(value) => setThemeValue('grid_columns', Number(value) as 2 | 3 | 4)}
        />
        <PillGroup
          title="Espaciado"
          options={SPACING_OPTIONS}
          selected={theme.spacing_scale}
          onChange={(value) => setThemeValue('spacing_scale', value as StoreThemeInput['spacing_scale'])}
        />
      </div>

      {/* 2. Cards + Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PillGroup
          title="Tarjetas"
          options={CARD_OPTIONS}
          selected={theme.card_style}
          onChange={(value) => setThemeValue('card_style', value as StoreThemeInput['card_style'])}
        />
        <PillGroup
          title="Botones"
          options={BUTTON_OPTIONS}
          selected={theme.button_style}
          onChange={(value) => setThemeValue('button_style', value as StoreThemeInput['button_style'])}
        />
      </div>

      {/* 3. Advanced */}
      <div className="admin-surface-muted rounded-[20px] p-4">
        <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Avanzado</p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <PillGroup
            title="Ancho"
            options={WIDTH_OPTIONS}
            selected={theme.container_width}
            onChange={(value) => setThemeValue('container_width', value as StoreThemeInput['container_width'])}
          />
          <PillGroup
            title="Ratio de imagen"
            options={IMAGE_RATIO_OPTIONS.map((o) => ({ value: o.value, label: o.value }))}
            selected={theme.image_ratio}
            onChange={(value) => setThemeValue('image_ratio', value as StoreThemeInput['image_ratio'])}
          />
          <PillGroup
            title="Densidad"
            options={DENSITY_OPTIONS}
            selected={theme.ui_density}
            onChange={(value) => setThemeValue('ui_density', value as StoreThemeInput['ui_density'])}
          />
          <PillGroup
            title="Redondeo"
            options={BORDER_RADIUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={theme.border_radius}
            onChange={(value) => setThemeValue('border_radius', value as StoreThemeInput['border_radius'])}
          />
        </div>
      </div>
    </div>
  )
}

function TypographyLivePreview({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div className="admin-surface-elevated overflow-hidden rounded-[24px]" style={previewThemeVars}>
      <div className="border-b px-5 py-3" style={{ borderColor: 'var(--store-card-border)' }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Preview tipografico</p>
      </div>

      {/* Side-by-side font specimens */}
      <div className="grid grid-cols-2 gap-px border-b" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-border)' }}>
        <div className="px-4 py-4" style={{ background: 'var(--store-bg)' }}>
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>Titulos</p>
          <p className="store-heading text-5xl leading-none" style={{ color: 'var(--store-text)' }}>Aa</p>
          <p className="store-heading mt-1.5 text-sm tracking-normal" style={{ color: 'var(--store-muted-text)' }}>Bb Cc 123</p>
        </div>
        <div className="px-4 py-4" style={{ background: 'var(--store-bg)' }}>
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>Texto</p>
          <p className="store-body text-5xl leading-none" style={{ color: 'var(--store-text)' }}>Aa</p>
          <p className="store-body mt-1.5 text-sm" style={{ color: 'var(--store-muted-text)' }}>Bb Cc 123</p>
        </div>
      </div>

      {/* Content sample */}
      <div className="space-y-3 px-5 py-5">
        <h4 className="store-heading text-4xl leading-tight" style={{ color: 'var(--store-text)' }}>
          Tu tienda, premium
        </h4>
        <p className="store-body text-sm leading-6" style={{ color: 'var(--store-soft-text)', fontSize: 'calc(0.875rem * var(--store-body-scale))' }}>
          Productos con estilo, precio claro y entrega rapida.
        </p>
        <div className="rounded-[var(--store-card-radius)] border px-4 py-3" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
          <p className="store-heading text-lg" style={{ color: 'var(--store-text)' }}>Titulo de producto</p>
          <p className="store-body mt-1 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>Descripcion breve del articulo en esta fuente.</p>
          <p className="store-heading mt-2 text-base font-semibold" style={{ color: 'var(--store-primary)' }}>$12.900</p>
        </div>
      </div>
    </div>
  )
}

function ColorStoreMockup({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div className="admin-surface-elevated overflow-hidden rounded-[24px]" style={previewThemeVars}>
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: 'var(--store-card-border)' }}>
        <div>
          <p className="store-heading text-base" style={{ color: 'var(--store-text)' }}>Navbar</p>
          <p className="text-xs" style={{ color: 'var(--store-muted-text)' }}>Marca y CTA</p>
        </div>
        <button type="button" className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold" style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))', color: 'var(--store-primary-contrast)' }}>
          Comprar
        </button>
      </div>
      <div className="space-y-3.5 px-5 py-5">
        <div className="rounded-[calc(var(--store-card-radius)*1.05)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-surface) 88%, transparent), color-mix(in srgb, var(--store-bg) 88%, var(--store-text) 12%))' }}>
          <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ backgroundColor: withAlpha('#ffffff', 0.06), color: 'var(--store-secondary)', border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)' }}>
            Badge
          </span>
          <h4 className="store-heading mt-3.5 text-2xl" style={{ color: 'var(--store-text)' }}>Hero</h4>
          <p className="mt-1.5 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>Mini mockup real para validar contraste y personalidad.</p>
        </div>
        <div className="rounded-[var(--store-card-radius)] border p-3.5" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
          <div className="aspect-[4/3] rounded-[calc(var(--store-card-radius)*0.72)]" style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))' }} />
          <div className="mt-3.5 flex items-start justify-between gap-3">
            <div>
              <p className="store-heading text-lg" style={{ color: 'var(--store-text)' }}>Card</p>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>Precio legible y CTA claro.</p>
            </div>
            <p className="text-lg font-semibold" style={{ color: 'var(--store-primary)' }}>$42.000</p>
          </div>
        </div>
        <div className="rounded-[calc(var(--store-card-radius)*0.82)] border-t pt-3.5" style={{ borderColor: 'var(--store-card-border)' }}>
          <div className="flex items-center justify-between rounded-[calc(var(--store-card-radius)*0.72)] px-4 py-2.5" style={{ backgroundColor: withAlpha('#000000', 0.08) }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Footer</p>
            <span className="size-2.5 rounded-full" style={{ backgroundColor: 'var(--store-accent)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DesignLivePreview({
  previewThemeVars,
  columns,
  imageRatio,
  containerWidth,
}: {
  previewThemeVars: React.CSSProperties
  columns: number
  imageRatio: string
  containerWidth: string
}) {
  const previewCount = columns === 4 ? 4 : columns === 3 ? 3 : 2
  const imageClass = imageRatio === '1:1' ? 'aspect-square' : imageRatio === '16:9' ? 'aspect-video' : imageRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/5]'
  const widthPercent = WIDTH_VISUAL[containerWidth] ?? '80%'

  return (
    <div className="admin-surface-elevated overflow-hidden rounded-[24px]" style={previewThemeVars}>
      {/* Header + width indicator */}
      <div className="flex items-center gap-3 border-b px-5 py-3" style={{ borderColor: 'var(--store-card-border)' }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Layout</p>
        <div className="flex flex-1 items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: withAlpha('#ffffff', 0.08) }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: widthPercent, background: 'var(--store-primary)' }}
            />
          </div>
          <p className="shrink-0 text-[9px] font-semibold uppercase" style={{ color: 'var(--store-muted-text)' }}>{containerWidth}</p>
        </div>
      </div>

      <div className="space-y-3.5 px-5 py-5">
        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold" style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))', color: 'var(--store-primary-contrast)' }}>Principal</button>
          <button type="button" className="rounded-[var(--store-button-radius)] border px-4 py-2 text-sm" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)' }}>Secundario</button>
          <button type="button" className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold" style={{ background: 'var(--store-accent)', color: 'var(--store-accent-contrast)' }}>Accion</button>
        </div>

        {/* Card grid, constrained by container width */}
        <div className="transition-all duration-300" style={{ width: widthPercent }}>
          <div className={`grid gap-2 ${previewCount === 4 ? 'grid-cols-4' : previewCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {Array.from({ length: previewCount }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[var(--store-card-radius)] border" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
                <div className={`${imageClass} w-full`} style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 22%, transparent), color-mix(in srgb, var(--store-secondary) 18%, transparent))' }} />
                <div className="space-y-1.5 p-2">
                  <div className="h-2 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.12) }} />
                  <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.07) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
