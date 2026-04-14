'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown, ChevronUp, Contrast, Maximize2, Minimize2, Monitor, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { Input } from '@/components/ui/input'
import {
  BORDER_RADIUS_OPTIONS,
  FONT_FAMILY_MAP,
  FONT_OPTIONS,
  FONT_PRESETS,
  HEADING_WEIGHT_OPTIONS,
  IMAGE_RATIO_OPTIONS,
} from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import { updateStoreTheme } from '@/lib/actions/store'
import { normalizeCardLayout } from '@/lib/utils/card-layout'
import { getAccessibleTextColor, getContrastRatio, withAlpha } from '@/lib/utils/color'
import { buildThemeVars } from '@/lib/utils/theme'
import { cn } from '@/lib/utils'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { StoreTheme } from '@/types/store'

export type ThemeSection = 'fuentes' | 'colores' | 'layout' | 'productos'

type ThemeFormProps = {
  theme: StoreTheme
  activeSection: ThemeSection
  storeSlug: string
  onNavigate?: (section: ThemeSection) => void
}

type VisualOption = {
  value: string
  label: string
}


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

const CARD_LAYOUT_OPTIONS = [
  { value: 'classic', label: 'Clásica',  hint: 'Imagen arriba, nombre y precio abajo' },
  { value: 'visual',  label: 'Visual',   hint: 'Imagen dominante con texto superpuesto' },
  { value: 'compact', label: 'Compacta', hint: 'Imagen lateral, lista densa' },
] as const

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
  { value: 'tight', label: 'Compacta' },
  { value: 'balanced', label: 'Balanceada' },
  { value: 'airy', label: 'Amplia' },
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

export function ThemeForm({ theme, activeSection, storeSlug, onNavigate }: ThemeFormProps) {
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
      background_color_2: theme.background_color_2 ?? null,
      background_direction: (theme.background_direction ?? 'diagonal') as StoreThemeInput['background_direction'],
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

  const storePublicPath = `/tienda/${storeSlug}`

  const visualModeHeader = (
    <div className="admin-surface rounded-[18px] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400/80" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Preview en vivo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-0.5">
            {[
              { value: 'light', label: 'Claro' },
              { value: 'auto',  label: 'Auto' },
              { value: 'dark',  label: 'Oscuro' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setThemeValue('visual_mode', option.value as StoreThemeInput['visual_mode'])}
                className={cn(
                  'rounded-[8px] px-2.5 py-1 text-[11px] font-medium transition duration-150',
                  previewTheme.visual_mode === option.value
                    ? 'admin-surface-selected text-white'
                    : 'text-neutral-500 hover:text-neutral-300',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <a
            href={storePublicPath}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-neutral-300 transition hover:border-white/20 hover:text-white"
          >
            Ver tienda
            <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10L10 2M10 2H4.5M10 2V7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )

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
          previewHeader={visualModeHeader}
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
          preview={<ColorStoreMockup previewThemeVars={previewThemeVars} theme={previewTheme} onNavigate={onNavigate} />}
          previewHeader={visualModeHeader}
        />
      ) : null}

      {activeSection === 'productos' ? (
        <EditorShell
          controls={
            <ProductsControls
              theme={previewTheme}
              setThemeValue={setThemeValue}
            />
          }
          preview={<ProductCatalogPreview previewThemeVars={previewThemeVars} columns={previewTheme.grid_columns} imageRatio={previewTheme.image_ratio} cardLayout={previewTheme.card_layout} onNavigate={onNavigate} />}
          previewHeader={visualModeHeader}
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
          preview={<DesignLivePreview previewThemeVars={previewThemeVars} columns={previewTheme.grid_columns} imageRatio={previewTheme.image_ratio} containerWidth={previewTheme.container_width} spacingScale={previewTheme.spacing_scale} cardLayout={previewTheme.card_layout} onNavigate={onNavigate} />}
          previewHeader={visualModeHeader}
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

type PreviewDevice = 'desktop' | 'mobile'

function EditorShell({
  controls,
  preview,
  previewHeader,
}: {
  controls: React.ReactNode
  preview: React.ReactNode
  previewHeader?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const [device,  setDevice]  = useState<PreviewDevice>('desktop')

  return (
    <section
      className={cn(
        'grid gap-4',
        focused ? '' : 'xl:grid-cols-[340px_minmax(0,1fr)]',
      )}
    >
      {/* Controls sidebar — hidden in focus mode */}
      {!focused && (
        <div className="admin-surface rounded-[24px] p-5">{controls}</div>
      )}

      {/* Preview — sticky, dominant right column */}
      <div className="space-y-3 xl:sticky xl:top-6 xl:self-start">
        {previewHeader}

        {/* Preview device/focus controls */}
        <div className="flex items-center justify-between px-0.5">
          {/* Device toggle */}
          <div className="flex rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-0.5">
            {([
              { value: 'desktop' as const, Icon: Monitor,    label: 'Desktop' },
              { value: 'mobile'  as const, Icon: Smartphone, label: 'Mobile'  },
            ] as const).map(({ value, Icon, label }) => (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => setDevice(value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition duration-150 active:scale-[0.96]',
                  device === value
                    ? 'admin-surface-selected text-white'
                    : 'text-neutral-500 hover:text-neutral-300',
                )}
              >
                <Icon className="size-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          {/* Focus toggle */}
          <button
            type="button"
            title={focused ? 'Salir del modo foco' : 'Expandir preview'}
            onClick={() => setFocused((f) => !f)}
            className={cn(
              'flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-medium transition duration-150 active:scale-[0.96]',
              focused
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white',
            )}
          >
            {focused ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
            <span className="hidden sm:inline">{focused ? 'Salir' : 'Expandir'}</span>
          </button>
        </div>

        {/* Preview mockup with optional mobile frame */}
        {device === 'mobile' ? (
          <div className="flex justify-center">
            <div
              className="w-full overflow-hidden rounded-[32px] shadow-[0_0_0_6px_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.5)]"
              style={{ maxWidth: 390 }}
            >
              {preview}
            </div>
          </div>
        ) : (
          preview
        )}
      </div>
    </section>
  )
}

function PreviewZone({
  label,
  target,
  onNavigate,
  children,
}: {
  label: string
  target: ThemeSection
  onNavigate?: (section: ThemeSection) => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  if (!onNavigate) return <>{children}</>

  return (
    <div
      className="relative cursor-pointer"
      style={{
        outline: hovered ? '2px solid rgba(52,211,153,0.5)' : '2px solid transparent',
        outlineOffset: '-1px',
        transition: 'outline-color 0.15s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(target)}
    >
      {hovered ? (
        <div className="pointer-events-none absolute inset-0 z-0 bg-emerald-400/[0.04]" />
      ) : null}
      {children}
      {hovered ? (
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-bold text-black shadow-[0_2px_8px_rgba(52,211,153,0.4)]">
            {label}
          </span>
        </div>
      ) : null}
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[12px] px-2 py-2 text-xs font-medium transition duration-150 active:scale-[0.94]',
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
              'rounded-[12px] px-3 py-1.5 text-xs font-medium transition duration-150 active:scale-[0.94]',
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
  const passes = numeric >= 4.5

  return (
    <div className="admin-surface-muted rounded-[18px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {label}
          </p>
          <p className="mt-2 text-[1.55rem] font-semibold leading-none text-white">{value}:1</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
            passes ? 'bg-emerald-400/12 text-emerald-200' : 'bg-amber-400/12 text-amber-200',
          )}
        >
          {passes ? <Check className="size-3" /> : null}
          {passes ? 'Correcto' : 'Revisar'}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <Contrast className={cn('size-3.5', passes ? 'text-emerald-200' : 'text-amber-200')} />
        <p className="text-xs text-neutral-400">
          {passes ? 'Legibilidad bien resuelta.' : 'Conviene subir el contraste.'}
        </p>
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
        'flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition duration-150 active:scale-[0.98]',
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
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Combinación de fuentes</p>
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
          title="Tamaño de títulos"
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
          title="Tamaño de texto"
          options={BODY_SCALE_OPTIONS}
          selected={theme.body_scale}
          onChange={(value) => setThemeValue('body_scale', value as StoreThemeInput['body_scale'])}
        />
      </div>
    </div>
  )
}

function ColorSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="admin-surface-muted rounded-[20px] px-4 py-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description ? <p className="mt-1 text-sm text-neutral-400">{description}</p> : null}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function ColorRow({
  label,
  hint,
  fieldName,
  value,
  register,
  onColorChange,
  error,
}: {
  label: string
  hint?: string
  fieldName: keyof StoreThemeInput
  value: string
  register: ReturnType<typeof useForm<StoreThemeInput>>['register']
  onColorChange: (v: string) => void
  error?: string
}) {
  const lum = colorLuminance(value ?? '#888888')
  const ring = lum > 0.55 ? 'rgba(0,0,0,0.2)' : lum < 0.28 ? 'rgba(255,255,255,0.18)' : 'rgba(128,128,128,0.2)'
  return (
    <div className="rounded-[16px] border border-white/[0.06] bg-black/10 px-3.5 py-3 transition duration-150 hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_44px_116px]">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          {hint ? <p className="mt-0.5 text-[11px] text-neutral-500">{hint}</p> : null}
        </div>
        <label className="group relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-white/20">
          <input
            type="color"
            value={value ?? '#000000'}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            className="block size-6 rounded-full transition group-focus-within:ring-2 group-focus-within:ring-emerald-300/60"
            style={{ backgroundColor: value, boxShadow: `0 0 0 1.5px ${ring}` }}
          />
        </label>
        <Input
          {...register(fieldName)}
          spellCheck={false}
          className="h-11 rounded-xl border-white/10 bg-black/10 px-3 font-mono text-xs uppercase text-white transition focus-visible:border-emerald-300/60 focus-visible:ring-emerald-300/20"
        />
      </div>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const isGradient = !!theme.background_color_2

  function toggleGradient(on: boolean) {
    if (on) {
      setThemeValue('background_color_2', theme.surface_color as StoreThemeInput['background_color_2'])
    } else {
      setThemeValue('background_color_2', null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Básico: Color principal */}
      <ColorSection
        title="Tu color de marca"
        description="Botones, precios y acciones principales."
      >
        <ColorRow
          label="Botones y acciones"
          hint="Es el color que más se nota en la tienda."
          fieldName="primary_color"
          value={theme.primary_color}
          register={register}
          onColorChange={(v) => setThemeValue('primary_color', v as StoreThemeInput['primary_color'])}
          error={errors.primary_color?.message}
        />
      </ColorSection>

      {/* Básico: Fondo */}
      <ColorSection title="Fondo de la tienda">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Tipo de fondo
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleGradient(false)}
                className={cn(
                  'rounded-[12px] px-3.5 py-2 text-sm font-medium transition duration-150 active:scale-[0.97]',
                  !isGradient
                    ? 'admin-surface-selected text-white'
                    : 'admin-button-soft text-neutral-400 hover:text-white',
                )}
              >
                Sólido
              </button>
              <button
                type="button"
                onClick={() => toggleGradient(true)}
                className={cn(
                  'rounded-[12px] px-3.5 py-2 text-sm font-medium transition duration-150 active:scale-[0.97]',
                  isGradient
                    ? 'admin-surface-selected text-white'
                    : 'admin-button-soft text-neutral-400 hover:text-white',
                )}
              >
                Degradado
              </button>
            </div>
          </div>

          {isGradient ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Dirección
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setThemeValue('background_direction', 'diagonal')}
                  className={cn(
                    'rounded-[12px] px-3.5 py-2 text-sm font-medium transition duration-150 active:scale-[0.97]',
                    (theme.background_direction ?? 'diagonal') === 'diagonal'
                      ? 'admin-surface-selected text-white'
                      : 'admin-button-soft text-neutral-400 hover:text-white',
                  )}
                >
                  Diagonal
                </button>
                <button
                  type="button"
                  onClick={() => setThemeValue('background_direction', 'vertical')}
                  className={cn(
                    'rounded-[12px] px-3.5 py-2 text-sm font-medium transition duration-150 active:scale-[0.97]',
                    theme.background_direction === 'vertical'
                      ? 'admin-surface-selected text-white'
                      : 'admin-button-soft text-neutral-400 hover:text-white',
                  )}
                >
                  Vertical
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <ColorRow
          label={isGradient ? 'Color inicio' : 'Fondo de la tienda'}
          fieldName="background_color"
          value={theme.background_color}
          register={register}
          onColorChange={(v) => setThemeValue('background_color', v as StoreThemeInput['background_color'])}
          error={errors.background_color?.message}
        />
        {isGradient ? (
          <ColorRow
            label="Color final"
            fieldName="background_color_2"
            value={theme.background_color_2 ?? '#000000'}
            register={register}
            onColorChange={(v) => setThemeValue('background_color_2', v)}
            error={errors.background_color_2?.message}
          />
        ) : null}
      </ColorSection>

      <button
        type="button"
        onClick={() => setShowAdvanced((value) => !value)}
        className="admin-surface-muted flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium text-neutral-300 transition duration-150 hover:border-white/[0.1] hover:bg-white/[0.05] active:scale-[0.99]"
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">Más opciones de color</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Texto, tarjetas, acentos y detalles secundarios.
          </p>
        </div>
        {showAdvanced ? (
          <ChevronUp className="size-4 text-neutral-400" />
        ) : (
          <ChevronDown className="size-4 text-neutral-400" />
        )}
      </button>

      {showAdvanced ? (
        <div className="space-y-3">
          <ColorSection title="Texto">
            <ColorRow
              label="Texto principal"
              hint="Títulos y contenido principal."
              fieldName="text_color"
              value={theme.text_color}
              register={register}
              onColorChange={(v) => setThemeValue('text_color', v as StoreThemeInput['text_color'])}
              error={errors.text_color?.message}
            />
          </ColorSection>

          <ColorSection title="Tarjetas">
            <ColorRow
              label="Tarjetas y productos"
              hint="Superficie de cards y zonas elevadas."
              fieldName="surface_color"
              value={theme.surface_color}
              register={register}
              onColorChange={(v) => setThemeValue('surface_color', v as StoreThemeInput['surface_color'])}
              error={errors.surface_color?.message}
            />
          </ColorSection>

          <ColorSection title="Acentos">
            <ColorRow
              label="Precios y acentos"
              hint="Precios, badges y puntos de destaque."
              fieldName="accent_color"
              value={theme.accent_color}
              register={register}
              onColorChange={(v) => setThemeValue('accent_color', v as StoreThemeInput['accent_color'])}
              error={errors.accent_color?.message}
            />
          </ColorSection>

          <ColorSection title="Otros detalles">
            <ColorRow
              label="Secundario"
              hint="Etiquetas, estados y acción alternativa."
              fieldName="secondary_color"
              value={theme.secondary_color}
              register={register}
              onColorChange={(v) => setThemeValue('secondary_color', v as StoreThemeInput['secondary_color'])}
              error={errors.secondary_color?.message}
            />
          </ColorSection>
        </div>
      ) : null}

      <div>
        <p className="text-sm font-semibold text-white">Contraste</p>
        <p className="mt-1 text-sm text-neutral-400">
          Te muestra rápido si la lectura y los botones quedan claros.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <ContrastStat label="Texto / fondo" value={contrastTextOnBg} />
        <ContrastStat label="Texto / tarjetas" value={contrastTextOnSurface} />
        <ContrastStat label="Botones y acciones" value={contrastPrimary} />
      </div>
    </div>
  )
}

const HERO_HEIGHT_BARS: Record<string, number> = { tight: 40, balanced: 62, airy: 84 }

const HERO_LAYOUT_OPTIONS = [
  { value: 'full', label: 'Completo', hint: 'Sin márgenes', contentPercent: '100%' },
  { value: 'xl', label: 'Grande', hint: 'Margen suave', contentPercent: '80%' },
  { value: 'lg', label: 'Centrada', hint: 'Más encuadrado', contentPercent: '58%' },
] as const

function HeroLayoutThumbnail({
  label,
  hint,
  isSelected,
  onClick,
  contentPercent,
}: {
  label: string
  hint: string
  isSelected: boolean
  onClick: () => void
  contentPercent: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2.5 rounded-[14px] p-2.5 text-center transition duration-150',
        isSelected ? 'admin-surface-selected' : 'admin-button-soft',
      )}
    >
      {/* Mini hero sketch */}
      <div
        className="w-full overflow-hidden rounded-[7px]"
        style={{
          height: 58,
          background: isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isSelected ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {/* Nav bar */}
        <div
          className="flex h-[9px] items-center px-1.5"
          style={{ background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
        >
          <div className="h-[3px] w-3 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
        </div>
        {/* Hero content — width changes visually */}
        <div className="flex h-[49px] items-end pb-2 pl-1.5">
          <div style={{ width: contentPercent, transition: 'width 0.25s ease' }}>
            <div
              className="h-[4px] rounded-full"
              style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', width: '85%' }}
            />
            <div
              className="mt-[3px] h-[3px] rounded-full"
              style={{ background: isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', width: '58%' }}
            />
            <div
              className="mt-[4px] h-[5px] w-[38%] rounded-[3px]"
              style={{ background: isSelected ? 'rgba(99,102,241,0.75)' : 'rgba(255,255,255,0.09)' }}
            />
          </div>
        </div>
      </div>
      <div>
        <p className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-neutral-400')}>{label}</p>
        <p className="mt-0.5 text-[10px] text-neutral-600">{hint}</p>
      </div>
    </button>
  )
}

// Full-width card layout option — larger, more visual than old thumbnail approach
function CardLayoutOption({
  option,
  isSelected,
  onClick,
}: {
  option: (typeof CARD_LAYOUT_OPTIONS)[number]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full overflow-hidden rounded-[16px] border text-left transition duration-200 active:scale-[0.99]',
        isSelected
          ? 'border-emerald-400/30 bg-emerald-400/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]',
      )}
    >
      {/* Realistic mini card preview */}
      <div className="px-4 pb-3 pt-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <CardMiniPreview variant={option.value} isSelected={isSelected} />
      </div>
      {/* Label + description */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className={cn('text-sm font-semibold', isSelected ? 'text-white' : 'text-neutral-300')}>
            {option.label}
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500">{option.hint}</p>
        </div>
        {isSelected ? (
          <span className="inline-flex items-center rounded-full bg-emerald-400/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
            Activo
          </span>
        ) : null}
      </div>
    </button>
  )
}

function CardMiniPreview({ variant, isSelected }: { variant: string; isSelected: boolean }) {
  const imgBg = isSelected
    ? 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(255,255,255,0.1))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))'
  const cardBg = isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'
  const border = isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)'
  const textHi = isSelected ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)'
  const textLo = isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.14)'
  const price  = isSelected ? 'rgba(52,211,153,0.7)'   : 'rgba(255,255,255,0.22)'
  const btn    = isSelected ? 'rgba(52,211,153,0.18)'  : 'rgba(255,255,255,0.08)'

  if (variant === 'compact') {
    return (
      <div className="space-y-1.5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 overflow-hidden rounded-lg px-2 py-1.5"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <div className="size-9 shrink-0 rounded-md" style={{ background: imgBg }} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-1.5 rounded-full" style={{ background: textHi, width: '75%' }} />
              <div className="h-1 rounded-full" style={{ background: textLo, width: '45%' }} />
            </div>
            <div className="shrink-0 space-y-1 text-right">
              <div className="h-1.5 w-10 rounded-full" style={{ background: price }} />
              <div className="h-4 w-10 rounded-full" style={{ background: btn }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'visual') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg"
            style={{ border: `1px solid ${border}` }}
          >
            <div className="aspect-[3/4]" style={{ background: imgBg }} />
            <div
              className="absolute inset-x-0 bottom-0 p-2"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
            >
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.65)', width: '80%' }} />
              <div className="mt-1 h-1.5 rounded-full" style={{ background: price, width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // classic — vertical card, image top, info below
  return (
    <div className="grid grid-cols-2 gap-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <div className="aspect-[4/3]" style={{ background: imgBg }} />
          <div className="space-y-1.5 p-2">
            <div className="h-1.5 rounded-full" style={{ background: textHi, width: '85%' }} />
            <div className="flex items-center justify-between gap-1">
              <div className="h-2 rounded-full" style={{ background: price, width: '48%' }} />
              <div className="h-4 w-8 rounded-full" style={{ background: btn }} />
            </div>
          </div>
        </div>
      ))}
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
  const activeLayout = theme.container_width === 'full'
    ? 'full'
    : theme.container_width === 'xl'
      ? 'xl'
      : 'lg'

  return (
    <div className="space-y-5">
      {/* ── Portada ── */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Portada</p>

        <div>
          <p className="mb-2 text-[11px] font-medium text-neutral-600">Composición del layout</p>
          <div className="grid grid-cols-3 gap-2">
            {HERO_LAYOUT_OPTIONS.map((opt) => (
              <HeroLayoutThumbnail
                key={opt.value}
                label={opt.label}
                hint={opt.hint}
                isSelected={activeLayout === opt.value}
                onClick={() => setThemeValue('container_width', opt.value as StoreThemeInput['container_width'])}
                contentPercent={opt.contentPercent}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-neutral-600">Altura del hero</p>
          <div className="grid grid-cols-3 gap-2">
            {SPACING_OPTIONS.map((opt) => {
              const isSelected = theme.spacing_scale === opt.value
              const barH = HERO_HEIGHT_BARS[opt.value] ?? 62
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setThemeValue('spacing_scale', opt.value as StoreThemeInput['spacing_scale'])}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-[14px] py-3 text-center transition duration-150',
                    isSelected ? 'admin-surface-selected' : 'admin-button-soft',
                  )}
                >
                  <div className="flex w-10 items-end justify-center" style={{ height: 44 }}>
                    <div
                      className="w-full rounded-sm transition-all duration-300"
                      style={{
                        height: barH,
                        background: isSelected
                          ? 'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.14))'
                          : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </div>
                  <span className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-neutral-400')}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Componentes ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Detalles de diseño</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <PillGroup
            title="Acabado de tarjetas"
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
    <div className="preview-live admin-surface-elevated overflow-hidden rounded-[24px]" style={previewThemeVars}>
      <div className="border-b px-5 py-3" style={{ borderColor: 'var(--store-card-border)' }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Preview tipografico</p>
      </div>

      {/* Side-by-side font specimens */}
      <div className="grid grid-cols-2 gap-px border-b" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-border)' }}>
        <div className="px-4 py-4" style={{ background: 'var(--store-bg-gradient)' }}>
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>Titulos</p>
          <p className="store-heading text-5xl leading-none" style={{ color: 'var(--store-text)' }}>Aa</p>
          <p className="store-heading mt-1.5 text-sm tracking-normal" style={{ color: 'var(--store-muted-text)' }}>Bb Cc 123</p>
        </div>
        <div className="px-4 py-4" style={{ background: 'var(--store-bg-gradient)' }}>
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

// Maps container_width to visible content width inside the mockup's hero area.
// This makes the layout picker educate the user about composition changes.
const HERO_CONTENT_WIDTH: Record<string, string> = {
  full: '100%',
  xl: '82%',
  lg: '65%',
  md: '52%',
  sm: '40%',
}

function ColorStoreMockup({
  previewThemeVars,
  theme,
  onNavigate,
}: {
  previewThemeVars: React.CSSProperties
  theme: StoreTheme
  onNavigate?: (section: ThemeSection) => void
}) {
  const heroContentWidth = HERO_CONTENT_WIDTH[theme.container_width] ?? '65%'
  const colorSignature = [
    theme.primary_color,
    theme.background_color,
    theme.background_color_2 ?? 'solid',
    theme.background_direction ?? 'diagonal',
    theme.text_color,
    theme.surface_color,
    theme.accent_color,
    theme.secondary_color,
  ].join('|')

  return (
    <div
      key={colorSignature}
      className={cn(
        'preview-live overflow-hidden rounded-[24px] transition-[box-shadow,transform] duration-300',
        'shadow-[0_0_0_1px_rgba(110,231,183,0.22),0_18px_48px_rgba(16,185,129,0.16)]',
      )}
      style={{
        ...previewThemeVars,
        background: 'var(--store-bg-gradient)',
        animation: 'preview-glow-pulse 320ms ease',
      }}
    >
      {/* Nav strip */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5 transition-[background-color,border-color] duration-300"
        style={{
          borderColor: 'var(--store-card-border)',
          background: 'var(--store-nav-bg)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-[6px] transition-[background] duration-300"
            style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-accent) 50%, var(--store-primary) 50%))' }}
          />
          <span className="store-heading text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--store-text)' }}>
            Mi Tienda
          </span>
        </div>
        <button
          type="button"
          className="rounded-[var(--store-button-radius)] px-3 py-1.5 text-[10px] font-semibold transition-[background,color,box-shadow] duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
            color: 'var(--store-primary-contrast)',
          }}
        >
          Carrito
        </button>
      </div>

      {/* Hero area — background always full width; content constrained by container_width */}
      <PreviewZone label="Editar portada" target="layout" onNavigate={onNavigate}>
      <div
        className="pb-7 pt-8 transition-[background] duration-300"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--store-accent) 12%, transparent), transparent 52%), radial-gradient(circle at left 70%, color-mix(in srgb, var(--store-secondary) 13%, transparent), transparent 42%), var(--store-bg-gradient)',
        }}
      >
        {/* Content width responds to container_width — pedagogical layout preview */}
        <div
          className="pl-5 pr-2"
          style={{ width: heroContentWidth, transition: 'width 0.3s ease' }}
        >
          <span
            className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] transition-[background-color,border-color,color] duration-300"
            style={{
              color: 'var(--store-secondary)',
              backgroundColor: 'color-mix(in srgb, var(--store-secondary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)',
            }}
          >
            Coleccion
          </span>
          <h4 className="store-heading mt-2.5 text-2xl leading-tight transition-colors duration-300" style={{ color: 'var(--store-text)' }}>
            Tu tienda, premium.
          </h4>
          <p className="mt-1.5 text-[11px] leading-5 transition-colors duration-300" style={{ color: 'var(--store-soft-text)' }}>
            Contraste, color y personalidad desde el primer scroll.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="rounded-[var(--store-button-radius)] px-4 py-2 text-[11px] font-semibold transition-[background,color,box-shadow] duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                color: 'var(--store-primary-contrast)',
                boxShadow: '0 8px 20px color-mix(in srgb, var(--store-primary) 24%, transparent)',
              }}
            >
              Ver catálogo
            </button>
            <button
              type="button"
              className="rounded-[var(--store-button-radius)] border px-4 py-2 text-[11px] font-medium transition-[background-color,border-color,color] duration-300"
              style={{
                borderColor: 'var(--store-border-strong)',
                color: 'var(--store-text)',
                background: 'color-mix(in srgb, var(--store-surface) 50%, transparent)',
              }}
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
      </PreviewZone>

      {/* Product cards */}
      <PreviewZone label="Estilo de producto" target="productos" onNavigate={onNavigate}>
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 pt-3">
        {[
          { label: 'Producto estrella', price: '$24.900' },
          { label: 'Nuevo ingreso', price: '$18.500' },
        ].map((product) => (
          <div
            key={product.label}
            className="overflow-hidden rounded-[var(--store-card-radius)] border transition-[background-color,border-color,box-shadow] duration-300"
            style={{
              borderColor: 'var(--store-card-border)',
              background: 'var(--store-card-background)',
              boxShadow: 'var(--store-card-shadow)',
            }}
          >
            <div
              className="aspect-[4/5] transition-[background] duration-300"
              style={{
                background:
                  'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))',
              }}
            />
            <div className="p-2.5">
              <p className="store-heading text-xs font-semibold transition-colors duration-300" style={{ color: 'var(--store-text)' }}>
                {product.label}
              </p>
              <p className="mt-1 text-xs font-semibold transition-colors duration-300" style={{ color: 'var(--store-primary)' }}>
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
      </PreviewZone>

      {/* Footer strip */}
      <div
        className="border-t px-5 py-4 transition-[background-color,border-color] duration-300"
        style={{
          borderColor: 'var(--store-card-border)',
          background: 'var(--store-footer-bg-gradient)',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="store-heading text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--store-text)' }}>
            Mi Tienda
          </p>
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full transition-colors duration-300" style={{ backgroundColor: 'var(--store-primary)' }} />
            <div className="size-2 rounded-full transition-colors duration-300" style={{ backgroundColor: 'var(--store-accent)' }} />
            <div className="size-2 rounded-full transition-colors duration-300" style={{ backgroundColor: 'var(--store-secondary)' }} />
          </div>
        </div>
        <p className="mt-1 text-[10px] transition-colors duration-300" style={{ color: 'var(--store-muted-text)' }}>
          Powered by Volta Store
        </p>
      </div>
    </div>
  )
}

// ─── Products section ──────────────────────────────────────────────────────

function ProductsControls({
  theme,
  setThemeValue,
}: {
  theme: StoreTheme
  setThemeValue: <K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) => void
}) {
  const activeCardLayout = normalizeCardLayout(theme.card_layout)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Estilo de producto
        </p>
        <p className="mt-1 text-sm leading-5 text-neutral-500">
          Cómo se ven las cards en tu tienda.
        </p>
      </div>

      {/* Full-width card layout options */}
      <div className="space-y-2">
        {CARD_LAYOUT_OPTIONS.map((option) => (
          <CardLayoutOption
            key={option.value}
            option={option}
            isSelected={activeCardLayout === option.value}
            onClick={() => setThemeValue('card_layout', option.value as StoreThemeInput['card_layout'])}
          />
        ))}
      </div>

      {/* Grid + ratio */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Grilla</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <PillGroup
            title="Columnas"
            options={GRID_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
            selected={String(theme.grid_columns)}
            onChange={(value) => setThemeValue('grid_columns', Number(value) as 2 | 3 | 4)}
          />
          <PillGroup
            title="Ratio de imagen"
            options={IMAGE_RATIO_OPTIONS.map((o) => ({ value: o.value, label: o.value }))}
            selected={theme.image_ratio}
            onChange={(value) => setThemeValue('image_ratio', value as StoreThemeInput['image_ratio'])}
          />
        </div>
      </div>
    </div>
  )
}

function ProductCatalogPreview({
  previewThemeVars,
  columns,
  imageRatio,
  cardLayout,
  onNavigate,
}: {
  previewThemeVars: React.CSSProperties
  columns: number
  imageRatio: string
  cardLayout: string
  onNavigate?: (section: ThemeSection) => void
}) {
  const count = columns === 4 ? 4 : columns === 3 ? 3 : 2
  const imageClass =
    imageRatio === '1:1' ? 'aspect-square'
    : imageRatio === '16:9' ? 'aspect-video'
    : imageRatio === '3:4' ? 'aspect-[3/4]'
    : 'aspect-[4/5]'
  const activeCardLayout = normalizeCardLayout(cardLayout)

  return (
    <div className="preview-live admin-surface-elevated overflow-hidden rounded-[24px]" style={previewThemeVars}>
      {/* Thin nav */}
      <PreviewZone label="Colores" target="colores" onNavigate={onNavigate}>
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'var(--store-nav-bg)', borderBottom: '1px solid var(--store-card-border)' }}
      >
        <div className="h-[5px] w-14 rounded-full" style={{ background: 'var(--store-text)', opacity: 0.4 }} />
        <div className="flex items-center gap-2">
          <div className="h-[4px] w-10 rounded-full" style={{ background: 'var(--store-text)', opacity: 0.2 }} />
          <div className="h-[14px] w-10 rounded-[var(--store-button-radius)]" style={{ background: 'var(--store-primary)' }} />
        </div>
      </div>
      </PreviewZone>

      {/* Category filter strip */}
      <div
        className="flex gap-2 overflow-hidden px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--store-card-border)', background: 'var(--store-bg-gradient)' }}
      >
        {(['Todo', 'Nuevo', 'Sale', 'Destacado'] as const).map((cat, i) => (
          <span
            key={cat}
            className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold"
            style={
              i === 0
                ? { background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }
                : { background: 'var(--store-card-background)', color: 'var(--store-muted-text)', border: '1px solid var(--store-card-border)' }
            }
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Product grid */}
      <div className="p-4" style={{ background: 'var(--store-bg-gradient)' }}>
        <div
          className={`grid gap-2.5 transition-all duration-300 ${count === 4 ? 'grid-cols-4' : count === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
        >
          {Array.from({ length: count }).map((_, index) => {
            const imgGradient = 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 20%, transparent), color-mix(in srgb, var(--store-secondary) 16%, transparent))'

            if (activeCardLayout === 'visual') {
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-[var(--store-card-radius)] border ${imageClass}`}
                  style={{ borderColor: 'var(--store-card-border)', background: imgGradient }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 p-2"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }}
                  >
                    <div className="h-[5px] rounded-full" style={{ background: 'rgba(255,255,255,0.75)', width: '80%' }} />
                    <div className="mt-1 h-[4px] rounded-full" style={{ background: 'var(--store-primary)', width: '50%' }} />
                  </div>
                </div>
              )
            }

            if (activeCardLayout === 'compact') {
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 overflow-hidden rounded-[var(--store-card-radius)] border p-2"
                  style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}
                >
                  <div className="aspect-square w-[36%] shrink-0 rounded-md" style={{ background: imgGradient }} />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-[5px] rounded-full" style={{ background: withAlpha('#ffffff', 0.16) }} />
                    <div className="h-[4px] w-2/3 rounded-full" style={{ background: withAlpha('#ffffff', 0.09) }} />
                    <div className="h-[7px] w-1/2 rounded-full" style={{ background: 'var(--store-primary)', opacity: 0.8 }} />
                  </div>
                </div>
              )
            }

            // classic
            return (
              <div
                key={index}
                className="overflow-hidden rounded-[var(--store-card-radius)] border"
                style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)', boxShadow: 'var(--store-card-shadow)' }}
              >
                <div className={`w-full ${imageClass}`} style={{ background: imgGradient }} />
                <div className="space-y-1.5 p-2.5">
                  <div className="h-[5px] rounded-full" style={{ background: withAlpha('#ffffff', 0.16), width: '85%' }} />
                  <div className="flex items-center justify-between">
                    <div className="h-[5px] w-1/2 rounded-full" style={{ background: 'var(--store-primary)', opacity: 0.8 }} />
                    <div className="h-[12px] w-8 rounded-[var(--store-button-radius)]" style={{ background: withAlpha('#ffffff', 0.09) }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Design section preview ─────────────────────────────────────────────────

const HERO_PREVIEW_HEIGHT: Record<string, number> = { tight: 56, balanced: 76, airy: 96 }

function DesignLivePreview({
  previewThemeVars,
  columns,
  imageRatio,
  containerWidth,
  spacingScale,
  cardLayout,
  onNavigate,
}: {
  previewThemeVars: React.CSSProperties
  columns: number
  imageRatio: string
  containerWidth: string
  spacingScale: string
  cardLayout: string
  onNavigate?: (section: ThemeSection) => void
}) {
  const previewCount = columns === 4 ? 4 : columns === 3 ? 3 : 2
  const imageClass = imageRatio === '1:1' ? 'aspect-square' : imageRatio === '16:9' ? 'aspect-video' : imageRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/5]'
  const widthPercent = WIDTH_VISUAL[containerWidth] ?? '80%'
  const heroH = HERO_PREVIEW_HEIGHT[spacingScale] ?? 76
  const activeCardLayout = normalizeCardLayout(cardLayout)

  return (
    <div className="preview-live admin-surface-elevated overflow-hidden rounded-[24px]" style={previewThemeVars}>
      {/* Hero zone — height from spacing_scale, content width from container_width */}
      <div
        className="relative"
        style={{
          height: heroH,
          background: 'var(--store-bg-gradient)',
          transition: 'height 0.3s ease',
        }}
      >
        {/* Nav bar */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between px-3"
          style={{ height: 20, background: 'var(--store-nav-bg)', borderBottom: '1px solid var(--store-card-border)' }}
        >
          <div className="h-[5px] w-6 rounded-full" style={{ background: 'var(--store-text)', opacity: 0.45 }} />
          <div className="h-[14px] w-8 rounded-[var(--store-button-radius)]" style={{ background: 'var(--store-primary)' }} />
        </div>
        {/* Hero content — width tracks container_width */}
        <div
          className="absolute bottom-3 left-3 transition-all duration-300"
          style={{ width: widthPercent }}
        >
          <div className="h-[6px] rounded-full" style={{ background: 'var(--store-text)', opacity: 0.5, width: '68%' }} />
          <div className="mt-1.5 h-[4px] rounded-full" style={{ background: 'var(--store-soft-text)', opacity: 0.55, width: '46%' }} />
          <div className="mt-2 h-[10px] w-12 rounded-[var(--store-button-radius)]" style={{ background: 'var(--store-primary)' }} />
        </div>
      </div>

      {/* Width indicator bar */}
      <div className="flex items-center gap-3 border-b px-5 py-2" style={{ borderColor: 'var(--store-card-border)' }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Ancho</p>
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

      <div className="space-y-3 px-5 py-4">
        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold" style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))', color: 'var(--store-primary-contrast)' }}>
            Principal
          </button>
          <button type="button" className="rounded-[var(--store-button-radius)] border px-4 py-2 text-sm" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)' }}>
            Secundario
          </button>
        </div>

        {/* Card grid constrained by container width */}
        <PreviewZone label="Estilo de producto" target="productos" onNavigate={onNavigate}>
        <div className="transition-all duration-300" style={{ width: widthPercent }}>
          <div className={`grid gap-2 ${previewCount === 4 ? 'grid-cols-4' : previewCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {Array.from({ length: previewCount }).map((_, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-[var(--store-card-radius)] border ${activeCardLayout === 'compact' ? 'flex items-center gap-2 p-2' : ''}`}
                style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)' }}
              >
                <div
                  className={`${activeCardLayout === 'compact' ? 'w-[38%] shrink-0' : 'w-full'} ${imageClass}`}
                  style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 22%, transparent), color-mix(in srgb, var(--store-secondary) 18%, transparent))' }}
                />
                <div className={`space-y-1.5 ${activeCardLayout === 'compact' ? 'min-w-0 flex-1 py-1 pr-1' : 'p-2'}`}>
                  <div className="h-2 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.12) }} />
                  <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.07) }} />
                  {activeCardLayout === 'classic' ? (
                    <div className="h-4 w-8 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.09) }} />
                  ) : null}
                  {activeCardLayout === 'visual' ? (
                    <div className="h-5 w-10 rounded-full" style={{ backgroundColor: 'var(--store-primary)' }} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        </PreviewZone>
      </div>
    </div>
  )
}
