'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Contrast, Layers3, Palette, Type } from 'lucide-react'
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
  { value: 'sm', label: 'Contenido' },
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
    setThemeValue('heading_font', preset.heading_font)
    setThemeValue('body_font', preset.body_font)
    setThemeValue('font_family', preset.body_font)
    setThemeValue('heading_weight', preset.heading_weight)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {activeSection === 'fuentes' ? (
        <EditorShell
          icon={Type}
          title="Fuentes"
          hint="Controles a la izquierda. Preview tipografico fijo a la derecha."
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
          icon={Palette}
          title="Colores"
          hint="Mockup compacto de tienda con navbar, hero, card, badge, CTA y footer."
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
          icon={Layers3}
          title="Diseno"
          hint="Opciones visuales para cards, botones, densidad y catalogo."
          controls={
            <LayoutControls
              theme={previewTheme}
              setThemeValue={setThemeValue}
            />
          }
          preview={<DesignLivePreview previewThemeVars={previewThemeVars} columns={previewTheme.grid_columns} imageRatio={previewTheme.image_ratio} />}
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
  icon: Icon,
  title,
  hint,
  controls,
  preview,
}: {
  icon: React.ElementType
  title: string
  hint: string
  controls: React.ReactNode
  preview: React.ReactNode
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="admin-surface rounded-[30px] p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.05]">
            <Icon className="size-4 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-white">{title}</h3>
            <p className="mt-1 text-sm text-neutral-400">{hint}</p>
          </div>
        </div>
        {controls}
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">{preview}</div>
    </section>
  )
}

function VisualGrid({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
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
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[18px] px-3 py-3 text-sm transition',
              selected === option.value ? 'admin-surface-selected text-white' : 'admin-button-soft text-neutral-300',
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
    <div className="admin-surface-muted rounded-[20px] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
        <span className={cn('rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]', numeric >= 4.5 ? 'bg-emerald-400/12 text-emerald-200' : 'bg-amber-400/12 text-amber-200')}>
          {numeric >= 4.5 ? 'OK' : 'Revisar'}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Contrast className="size-4 text-emerald-200" />
        <p className="text-lg font-semibold text-white">{value}:1</p>
      </div>
    </div>
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
    <div className="space-y-6">
      <VisualGrid title="Preset tipografico">
        {FONT_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => applyPreset(preset.value)}
            className={cn(
              'rounded-[22px] border p-4 text-left transition',
              theme.font_preset === preset.value ? 'admin-surface-selected' : 'admin-button-soft',
            )}
          >
            <p className="text-sm font-semibold text-white">{preset.label}</p>
            <p className="mt-3 text-[1.05rem] font-semibold text-white" style={{ fontFamily: FONT_FAMILY_MAP[preset.heading_font] }}>
              Premium store
            </p>
            <p className="text-xs text-neutral-400" style={{ fontFamily: FONT_FAMILY_MAP[preset.body_font] }}>
              Clear hierarchy
            </p>
          </button>
        ))}
      </VisualGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <VisualGrid title="Fuente principal">
          {FONT_OPTIONS.map((option) => (
            <button
              key={`heading-${option.value}`}
              type="button"
              onClick={() => setThemeValue('heading_font', option.value)}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.heading_font === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <p className="text-sm font-semibold text-white">{option.label}</p>
              <p className="mt-3 text-[1.25rem] font-semibold leading-tight text-white" style={{ fontFamily: FONT_FAMILY_MAP[option.value] }}>
                Tu tienda vende mejor cuando se ve premium
              </p>
            </button>
          ))}
        </VisualGrid>

        <VisualGrid title="Fuente secundaria">
          {FONT_OPTIONS.map((option) => (
            <button
              key={`body-${option.value}`}
              type="button"
              onClick={() => {
                setThemeValue('body_font', option.value)
                setThemeValue('font_family', option.value)
              }}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.body_font === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <p className="text-sm font-semibold text-white">{option.label}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-300" style={{ fontFamily: FONT_FAMILY_MAP[option.value] }}>
                Vista previa de jerarquia, lectura y personalidad visual.
              </p>
            </button>
          ))}
        </VisualGrid>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SegmentGroup
          title="Escala de titulos"
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
          title="Escala de texto"
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {COLOR_FIELDS.map((field) => {
          const value = theme[field.name]
          return (
            <label key={field.name} className="admin-surface-muted rounded-[22px] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{field.label}</span>
                <span className="size-8 rounded-xl border border-white/10" style={{ backgroundColor: value }} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(event) => setThemeValue(field.name, event.target.value as StoreThemeInput[typeof field.name])}
                  className="size-11 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                />
                <input
                  {...register(field.name)}
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-black/10 px-3 font-mono text-sm text-white"
                />
              </div>
              {errors[field.name] ? <p className="mt-2 text-xs text-red-300">{errors[field.name]?.message}</p> : null}
            </label>
          )
        })}
      </div>

      <SegmentGroup
        title="Modo visual"
        options={VISUAL_MODE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
        selected={theme.visual_mode}
        onChange={(value) => setThemeValue('visual_mode', value as StoreThemeInput['visual_mode'])}
      />

      <div className="grid gap-3 sm:grid-cols-3">
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
    <div className="space-y-6">
      <VisualGrid title="Tarjetas">
        {CARD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setThemeValue('card_style', option.value as StoreThemeInput['card_style'])}
            className={cn(
              'rounded-[22px] border p-4 text-left transition',
              theme.card_style === option.value ? 'admin-surface-selected' : 'admin-button-soft',
            )}
          >
            <CardStylePreview variant={option.value} />
            <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
          </button>
        ))}
      </VisualGrid>

      <VisualGrid title="Botones">
        {BUTTON_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setThemeValue('button_style', option.value as StoreThemeInput['button_style'])}
            className={cn(
              'rounded-[22px] border p-4 text-left transition',
              theme.button_style === option.value ? 'admin-surface-selected' : 'admin-button-soft',
            )}
          >
            <ButtonStylePreview variant={option.value} />
            <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
          </button>
        ))}
      </VisualGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <VisualGrid title="Densidad">
          {DENSITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeValue('ui_density', option.value as StoreThemeInput['ui_density'])}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.ui_density === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <DensityPreview variant={option.value} />
              <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
            </button>
          ))}
        </VisualGrid>

        <VisualGrid title="Spacing">
          {SPACING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeValue('spacing_scale', option.value as StoreThemeInput['spacing_scale'])}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.spacing_scale === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <SpacingPreview variant={option.value} />
              <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
            </button>
          ))}
        </VisualGrid>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <VisualGrid title="Ancho">
          {WIDTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeValue('container_width', option.value as StoreThemeInput['container_width'])}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.container_width === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <WidthPreview variant={option.value} />
              <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
            </button>
          ))}
        </VisualGrid>

        <VisualGrid title="Columnas">
          {GRID_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeValue('grid_columns', option.value as 2 | 3 | 4)}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.grid_columns === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <GridPreview columns={option.value} />
              <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
            </button>
          ))}
        </VisualGrid>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <VisualGrid title="Ratio de imagen">
          {IMAGE_RATIO_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeValue('image_ratio', option.value as StoreThemeInput['image_ratio'])}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.image_ratio === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <ImageRatioPreview ratio={option.value} />
              <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
            </button>
          ))}
        </VisualGrid>

        <VisualGrid title="Redondeo">
          {BORDER_RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeValue('border_radius', option.value as StoreThemeInput['border_radius'])}
              className={cn(
                'rounded-[22px] border p-4 text-left transition',
                theme.border_radius === option.value ? 'admin-surface-selected' : 'admin-button-soft',
              )}
            >
              <RadiusPreview radius={option.value} />
              <p className="mt-3 text-sm font-semibold text-white">{option.label}</p>
            </button>
          ))}
        </VisualGrid>
      </div>
    </div>
  )
}

function TypographyLivePreview({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div className="admin-surface-elevated overflow-hidden rounded-[28px]" style={previewThemeVars}>
      <div className="border-b border-white/8 px-5 py-4">
        <p className="admin-label" style={{ color: 'var(--store-muted-text)' }}>Preview tipografico</p>
      </div>
      <div className="space-y-5 px-5 py-5">
        <h4 className="store-heading text-[2rem] leading-[0.95]" style={{ color: 'var(--store-text)', transform: 'scale(var(--store-heading-scale))', transformOrigin: 'left top' }}>
          Tu tienda vende mejor cuando se ve premium
        </h4>
        <p className="text-sm leading-7" style={{ color: 'var(--store-soft-text)', fontSize: 'calc(0.96rem * var(--store-body-scale))' }}>
          Vista previa de jerarquia, lectura y personalidad visual.
        </p>
        <div className="grid gap-3">
          <div className="rounded-[var(--store-card-radius)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>Hero title</p>
            <p className="store-heading mt-2 text-xl" style={{ color: 'var(--store-text)' }}>Titulos con presencia</p>
          </div>
          <div className="rounded-[var(--store-card-radius)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>Body copy</p>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>Textos faciles de leer, precios claros y menos esfuerzo para decidir.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ColorStoreMockup({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div className="admin-surface-elevated overflow-hidden rounded-[28px]" style={previewThemeVars}>
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--store-card-border)' }}>
        <div>
          <p className="store-heading text-base" style={{ color: 'var(--store-text)' }}>Navbar</p>
          <p className="text-xs" style={{ color: 'var(--store-muted-text)' }}>Marca y CTA</p>
        </div>
        <button type="button" className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold" style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))', color: 'var(--store-primary-contrast)' }}>
          Comprar
        </button>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="rounded-[calc(var(--store-card-radius)*1.05)] border p-5" style={{ borderColor: 'var(--store-card-border)', background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-surface) 88%, transparent), color-mix(in srgb, var(--store-bg) 88%, var(--store-text) 12%))' }}>
          <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ backgroundColor: withAlpha('#ffffff', 0.06), color: 'var(--store-secondary)', border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)' }}>
            Badge
          </span>
          <h4 className="store-heading mt-4 text-2xl" style={{ color: 'var(--store-text)' }}>Hero</h4>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>Mini mockup real para validar contraste y personalidad.</p>
        </div>
        <div className="rounded-[var(--store-card-radius)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
          <div className="aspect-[4/3] rounded-[calc(var(--store-card-radius)*0.72)]" style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))' }} />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="store-heading text-lg" style={{ color: 'var(--store-text)' }}>Card</p>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>Precio legible y CTA claro.</p>
            </div>
            <p className="text-lg font-semibold" style={{ color: 'var(--store-primary)' }}>$42.000</p>
          </div>
        </div>
        <div className="rounded-[calc(var(--store-card-radius)*0.82)] border-t pt-4" style={{ borderColor: 'var(--store-card-border)' }}>
          <div className="flex items-center justify-between rounded-[calc(var(--store-card-radius)*0.72)] px-4 py-3" style={{ backgroundColor: withAlpha('#000000', 0.08) }}>
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
}: {
  previewThemeVars: React.CSSProperties
  columns: number
  imageRatio: string
}) {
  const previewCount = columns === 4 ? 4 : columns === 3 ? 3 : 2
  const imageClass = imageRatio === '1:1' ? 'aspect-square' : imageRatio === '16:9' ? 'aspect-video' : imageRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/5]'

  return (
    <div className="admin-surface-elevated overflow-hidden rounded-[28px]" style={previewThemeVars}>
      <div className="border-b border-white/8 px-5 py-4">
        <p className="admin-label" style={{ color: 'var(--store-muted-text)' }}>Preview de layout</p>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--store-card-radius)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
            <div className="space-y-[var(--store-space-cluster)]">
              <div className="h-4 w-24 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.08) }} />
              <div className="h-11 rounded-[calc(var(--store-card-radius)*0.7)]" style={{ backgroundColor: withAlpha('#ffffff', 0.06) }} />
              <div className="h-11 rounded-[calc(var(--store-card-radius)*0.7)]" style={{ backgroundColor: withAlpha('#ffffff', 0.06) }} />
            </div>
          </div>
          <div className="rounded-[var(--store-card-radius)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold" style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))', color: 'var(--store-primary-contrast)' }}>Principal</button>
              <button type="button" className="rounded-[var(--store-button-radius)] border px-4 py-2 text-sm" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)' }}>Secundario</button>
            </div>
          </div>
        </div>
        <div className={`grid gap-3 ${previewCount === 4 ? 'grid-cols-4' : previewCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {Array.from({ length: previewCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className={`${imageClass} rounded-[calc(var(--store-card-radius)*0.72)]`} style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))' }} />
              <div className="h-3 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.08) }} />
              <div className="h-2.5 w-2/3 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.05) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CardStylePreview({ variant }: { variant: string }) {
  return (
    <div className={cn('rounded-[18px] border p-3', variant === 'glass' ? 'bg-white/10 backdrop-blur-md' : variant === 'sharp' ? 'bg-white/[0.02]' : 'bg-white/[0.05]')} style={{ borderColor: variant === 'sharp' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', boxShadow: variant === 'soft' ? '0 14px 28px rgba(2,6,23,0.16)' : variant === 'glass' ? '0 18px 34px rgba(2,6,23,0.22)' : 'none' }}>
      <div className="h-16 rounded-[14px] bg-white/10" />
      <div className="mt-3 h-3 rounded-full bg-white/12" />
      <div className="mt-2 h-3 w-2/3 rounded-full bg-white/8" />
    </div>
  )
}

function ButtonStylePreview({ variant }: { variant: string }) {
  const radius = variant === 'pill' ? '9999px' : variant === 'square' ? '10px' : '18px'
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">
      <div className="inline-flex px-4 py-2 text-sm font-semibold" style={{ borderRadius: radius, background: 'linear-gradient(145deg,#2ee6a6,#6ff3df)', color: '#03110c' }}>
        Comprar
      </div>
    </div>
  )
}

function DensityPreview({ variant }: { variant: string }) {
  const gap = variant === 'spacious' ? '0.9rem' : variant === 'comfortable' ? '0.65rem' : '0.4rem'
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">
      <div className="flex flex-col" style={{ gap }}>
        <div className="h-3 rounded-full bg-white/14" />
        <div className="h-8 rounded-[12px] bg-white/10" />
        <div className="h-8 rounded-[12px] bg-white/10" />
      </div>
    </div>
  )
}

function SpacingPreview({ variant }: { variant: string }) {
  const padding = variant === 'airy' ? '1rem' : variant === 'balanced' ? '0.75rem' : '0.5rem'
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/10" style={{ padding }}>
      <div className="h-3 rounded-full bg-white/14" />
      <div className="mt-3 h-10 rounded-[12px] bg-white/10" />
    </div>
  )
}

function WidthPreview({ variant }: { variant: string }) {
  const width = variant === 'full' ? '100%' : variant === 'xl' ? '90%' : variant === 'lg' ? '78%' : variant === 'md' ? '66%' : '52%'
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">
      <div className="mx-auto h-16 rounded-[14px] bg-white/10" style={{ width }} />
    </div>
  )
}

function GridPreview({ columns }: { columns: number }) {
  return (
    <div className={`grid gap-2 rounded-[18px] border border-white/8 bg-black/10 p-4 ${columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="h-12 rounded-[12px] bg-white/10" />
      ))}
    </div>
  )
}

function ImageRatioPreview({ ratio }: { ratio: string }) {
  const cls = ratio === '1:1' ? 'aspect-square' : ratio === '16:9' ? 'aspect-video' : ratio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/5]'
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">
      <div className={`${cls} rounded-[14px] bg-white/10`} />
    </div>
  )
}

function RadiusPreview({ radius }: { radius: string }) {
  const value = radius === 'full' ? '9999px' : radius === 'lg' ? '22px' : radius === 'md' ? '14px' : radius === 'sm' ? '8px' : '0px'
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">
      <div className="h-16 bg-white/10" style={{ borderRadius: value }} />
      <div className="mt-3 inline-flex bg-white/12 px-4 py-2 text-xs" style={{ borderRadius: value }}>
        CTA
      </div>
    </div>
  )
}
