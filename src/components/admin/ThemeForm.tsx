'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldErrors } from 'react-hook-form'
import { ChevronDown, ChevronUp, Contrast, Layers3, Palette, Type } from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FONT_FAMILY_MAP,
  BORDER_RADIUS_OPTIONS,
  FONT_OPTIONS,
  FONT_PRESETS,
  GRID_COLUMNS_OPTIONS,
  HEADING_WEIGHT_OPTIONS,
  IMAGE_RATIO_OPTIONS,
  VISUAL_MODE_OPTIONS,
} from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import { updateStoreTheme } from '@/lib/actions/store'
import { getAccessibleTextColor, getContrastRatio, mixHexColors, withAlpha } from '@/lib/utils/color'
import { buildThemeVars } from '@/lib/utils/theme'
import { cn } from '@/lib/utils'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { StoreTheme } from '@/types/store'

export type ThemeSection = 'fuentes' | 'colores' | 'layout'

type ThemeFormProps = {
  theme: StoreTheme
  activeSection: ThemeSection
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SV = (name: any, val: any) => void
type Get = <K extends keyof StoreThemeInput>(name: K) => StoreThemeInput[K]

const COLOR_FIELDS: Array<{
  name: keyof Pick<
    StoreThemeInput,
    | 'primary_color'
    | 'secondary_color'
    | 'accent_color'
    | 'background_color'
    | 'surface_color'
    | 'text_color'
  >
  label: string
  hint: string
}> = [
  { name: 'primary_color', label: 'Principal', hint: 'Botones y foco visual' },
  { name: 'secondary_color', label: 'Secundario', hint: 'Badges y señalización' },
  { name: 'accent_color', label: 'Acento', hint: 'Highlights y detalles' },
  { name: 'background_color', label: 'Fondo', hint: 'Base de la tienda' },
  { name: 'surface_color', label: 'Superficie', hint: 'Cards y paneles' },
  { name: 'text_color', label: 'Texto', hint: 'Lectura principal' },
]

const CARD_STYLES = [
  { value: 'soft', label: 'Suaves', hint: 'Profundidad sutil' },
  { value: 'sharp', label: 'Firmes', hint: 'Borde limpio' },
  { value: 'glass', label: 'Cristal', hint: 'Brillo y transparencia' },
] as const

const BUTTON_STYLES = [
  { value: 'rounded', label: 'Redondeados', hint: 'Suaves y amigables' },
  { value: 'pill', label: 'Cápsula', hint: 'Más expresivos' },
  { value: 'square', label: 'Rectos', hint: 'Más sobrios' },
] as const

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compacto', hint: 'Más info por pantalla' },
  { value: 'comfortable', label: 'Balanceado', hint: 'Equilibrado' },
  { value: 'spacious', label: 'Con aire', hint: 'Más espacio' },
] as const

export function ThemeForm({ theme, activeSection }: ThemeFormProps) {
  const [showFontAdvanced, setShowFontAdvanced] = useState(false)
  const [showLayoutAdvanced, setShowLayoutAdvanced] = useState(false)
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

  function applyTypographyPreset(presetValue: StoreThemeInput['font_preset']) {
    const preset = FONT_PRESETS.find((item) => item.value === presetValue)
    if (!preset) return
    setValue('font_preset', presetValue, { shouldDirty: true })
    setValue('heading_font', preset.heading_font, { shouldDirty: true })
    setValue('body_font', preset.body_font, { shouldDirty: true })
    setValue('font_family', preset.body_font, { shouldDirty: true })
    setValue('heading_weight', preset.heading_weight, { shouldDirty: true })
  }

  async function onSubmit(data: StoreThemeInput) {
    setSubmitError(null)
    const result = await updateStoreTheme({ ...data, font_family: data.body_font })
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

  const bg = values?.background_color ?? theme.background_color
  const surface = values?.surface_color ?? theme.surface_color
  const text = values?.text_color ?? theme.text_color
  const primary = values?.primary_color ?? theme.primary_color
  const contrastBg = getContrastRatio(text, bg).toFixed(1)
  const contrastSurface = getContrastRatio(text, surface).toFixed(1)
  const contrastPrimary = getContrastRatio(getAccessibleTextColor(primary), primary).toFixed(1)

  const sv: SV = (name, val) => setValue(name, val, { shouldDirty: true })

  function get<K extends keyof StoreThemeInput>(name: K): StoreThemeInput[K] {
    return (values?.[name] ?? theme[name]) as StoreThemeInput[K]
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {activeSection === 'fuentes' && (
        <FontsSection
          get={get}
          sv={sv}
          applyPreset={applyTypographyPreset}
          showAdvanced={showFontAdvanced}
          onToggleAdvanced={() => setShowFontAdvanced((v) => !v)}
          previewThemeVars={previewThemeVars}
        />
      )}

      {activeSection === 'colores' && (
        <ColorsSection
          get={get}
          sv={sv}
          register={register}
          errors={errors}
          previewThemeVars={previewThemeVars}
          contrasts={{ bg: contrastBg, surface: contrastSurface, primary: contrastPrimary }}
        />
      )}

      {activeSection === 'layout' && (
        <LayoutSection
          get={get}
          sv={sv}
          showAdvanced={showLayoutAdvanced}
          onToggleAdvanced={() => setShowLayoutAdvanced((v) => !v)}
        />
      )}

      {submitError ? (
        <FormFeedback kind="error" title="No pudimos guardar" message={submitError} />
      ) : null}
      {!submitError && saved ? (
        <FormFeedback
          kind="success"
          title="Apariencia guardada"
          message="La tienda ya refleja los cambios."
        />
      ) : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar apariencia" />
      </div>
    </form>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function FontsSection({
  get,
  sv,
  applyPreset,
  showAdvanced,
  onToggleAdvanced,
  previewThemeVars,
}: {
  get: Get
  sv: SV
  applyPreset: (preset: StoreThemeInput['font_preset']) => void
  showAdvanced: boolean
  onToggleAdvanced: () => void
  previewThemeVars: React.CSSProperties
}) {
  return (
    <div className="surface-panel premium-ring space-y-6 rounded-[30px] px-5 py-6 sm:px-6">
      <SectionHeader icon={Type} title="Tipografía" hint="Elige un estilo de letra para tu tienda." />

      {/* Presets */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-200">Estilo general</p>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {FONT_PRESETS.map((preset) => {
            const active = get('font_preset') === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyPreset(preset.value)}
                className={cn(
                  'rounded-[22px] border p-4 text-left transition',
                  active
                    ? 'border-emerald-300/30 bg-emerald-400/10'
                    : 'border-white/8 bg-white/4 hover:bg-white/6',
                )}
              >
                <p className="text-sm font-semibold text-white">{preset.label}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">{preset.description}</p>
                <p className="mt-3 text-[11px] text-neutral-500">
                  {FONT_OPTIONS.find((f) => f.value === preset.heading_font)?.label} +{' '}
                  {FONT_OPTIONS.find((f) => f.value === preset.body_font)?.label}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Font selects */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Fuente de títulos" hint="Para el hero y secciones clave.">
          <Select
            value={get('heading_font')}
            onValueChange={(val) => sv('heading_font', val)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-neutral-950 text-white">
              {FONT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="py-1">
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p
                      className="mt-0.5 text-[12px] text-neutral-400"
                      style={{ fontFamily: FONT_FAMILY_MAP[opt.value] }}
                    >
                      Tu tienda vende mejor cuando se ve premium
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Fuente de texto" hint="Para descripciones y fichas de producto.">
          <Select
            value={get('body_font')}
            onValueChange={(val) => {
              sv('body_font', val)
              sv('font_family', val)
            }}
          >
            <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-neutral-950 text-white">
              {FONT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="py-1">
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p
                      className="mt-0.5 text-[12px] text-neutral-400"
                      style={{ fontFamily: FONT_FAMILY_MAP[opt.value] }}
                    >
                      La lectura fluida convierte visitas en pedidos
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={onToggleAdvanced}
        className="flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
      >
        {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        {showAdvanced ? 'Ocultar ajustes finos' : 'Ajustes finos de escala y peso'}
      </button>

      {showAdvanced && (
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Escala de títulos" hint="Cuánta presencia tiene el titular.">
            <Select
              value={get('heading_scale')}
              onValueChange={(val) => sv('heading_scale', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                <SelectItem value="compact">Compacta</SelectItem>
                <SelectItem value="default">Balanceada</SelectItem>
                <SelectItem value="large">Expansiva</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Peso de los títulos" hint="Más delicado o más firme.">
            <Select
              value={get('heading_weight')}
              onValueChange={(val) => sv('heading_weight', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {HEADING_WEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Escala de texto" hint="Qué tan descansada se siente la lectura.">
            <Select
              value={get('body_scale')}
              onValueChange={(val) => sv('body_scale', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                <SelectItem value="sm">Compacta</SelectItem>
                <SelectItem value="base">Balanceada</SelectItem>
                <SelectItem value="lg">Amplia</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}

      <TypographyPreviewPanel previewThemeVars={previewThemeVars} />
    </div>
  )
}

function ColorsSection({
  get,
  sv,
  register,
  errors,
  previewThemeVars,
  contrasts,
}: {
  get: Get
  sv: SV
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  errors: FieldErrors<StoreThemeInput>
  previewThemeVars: React.CSSProperties
  contrasts: { bg: string; surface: string; primary: string }
}) {
  return (
    <div className="surface-panel premium-ring space-y-6 rounded-[30px] px-5 py-6 sm:px-6">
      <SectionHeader icon={Palette} title="Colores" hint="Define la paleta visual de tu tienda." />

      {/* 6 color pickers */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COLOR_FIELDS.map((field) => {
          const value = get(field.name) as string
          return (
            <div
              key={field.name}
              className="rounded-[22px] border border-white/8 bg-white/4 p-4"
            >
              <Label className="text-sm font-medium text-white">{field.label}</Label>
              <p className="mt-0.5 text-xs text-neutral-500">{field.hint}</p>
              <div className="mt-3 flex items-center gap-3">
                <label
                  className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-white/10"
                  style={{ backgroundColor: value }}
                >
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => sv(field.name, e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
                <input
                  {...register(field.name)}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-black/10 px-3 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>
              {errors[field.name] ? (
                <p className="mt-1.5 text-xs text-red-300">{errors[field.name]?.message}</p>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Visual mode */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-200">Modo visual</p>
        <div className="grid grid-cols-3 gap-2">
          {VISUAL_MODE_OPTIONS.map((opt) => {
            const active = get('visual_mode') === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => sv('visual_mode', opt.value)}
                className={cn(
                  'rounded-[20px] border p-3 text-left transition',
                  active
                    ? 'border-emerald-300/30 bg-emerald-400/10'
                    : 'border-white/8 bg-black/10 hover:bg-white/6',
                )}
              >
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{opt.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contrast */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-200">Contraste</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <ContrastCard
            label="Texto sobre fondo"
            value={`${contrasts.bg}:1`}
            description="Legibilidad general de la tienda."
            tone={Number(contrasts.bg) >= 4.5 ? 'good' : 'warning'}
          />
          <ContrastCard
            label="Texto sobre card"
            value={`${contrasts.surface}:1`}
            description="Cards, paneles y overlays."
            tone={Number(contrasts.surface) >= 4.5 ? 'good' : 'warning'}
          />
          <ContrastCard
            label="Texto del botón CTA"
            value={`${contrasts.primary}:1`}
            description="Botones de acción principal."
            tone={Number(contrasts.primary) >= 4.5 ? 'good' : 'warning'}
          />
        </div>
      </div>

      <LandingColorPreview previewThemeVars={previewThemeVars} />
    </div>
  )
}

function LayoutSection({
  get,
  sv,
  showAdvanced,
  onToggleAdvanced,
}: {
  get: Get
  sv: SV
  showAdvanced: boolean
  onToggleAdvanced: () => void
}) {
  return (
    <div className="surface-panel premium-ring space-y-6 rounded-[30px] px-5 py-6 sm:px-6">
      <SectionHeader
        icon={Layers3}
        title="Diseño"
        hint="Personaliza cómo se ven las tarjetas, botones y el espacio entre elementos."
      />

      <OptionGroup label="Tarjetas" hint="El estilo visual de cada producto.">
        {CARD_STYLES.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            hint={opt.hint}
            active={get('card_style') === opt.value}
            onClick={() => sv('card_style', opt.value)}
          />
        ))}
      </OptionGroup>

      <OptionGroup label="Botones" hint="La forma del botón de acción principal.">
        {BUTTON_STYLES.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            hint={opt.hint}
            active={get('button_style') === opt.value}
            onClick={() => sv('button_style', opt.value)}
          />
        ))}
      </OptionGroup>

      <OptionGroup label="Espacio entre elementos" hint="Cuánto aire hay en la tienda.">
        {DENSITY_OPTIONS.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            hint={opt.hint}
            active={get('ui_density') === opt.value}
            onClick={() => sv('ui_density', opt.value)}
          />
        ))}
      </OptionGroup>

      {/* Catalog */}
      <div>
        <p className="mb-1 text-sm font-medium text-neutral-200">Catálogo</p>
        <p className="mb-4 text-xs text-neutral-500">
          Cómo se presenta la grilla de productos.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Columnas">
            <Select
              value={String(get('grid_columns'))}
              onValueChange={(val) => sv('grid_columns', Number(val))}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {GRID_COLUMNS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Ancho del contenido">
            <Select
              value={get('container_width')}
              onValueChange={(val) => sv('container_width', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                <SelectItem value="sm">Contenido</SelectItem>
                <SelectItem value="md">Medio</SelectItem>
                <SelectItem value="lg">Amplio</SelectItem>
                <SelectItem value="xl">Grande</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Forma de la imagen">
            <Select
              value={get('image_ratio')}
              onValueChange={(val) => sv('image_ratio', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {IMAGE_RATIO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Advanced */}
      <button
        type="button"
        onClick={onToggleAdvanced}
        className="flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
      >
        {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        {showAdvanced ? 'Ocultar ajustes avanzados' : 'Ver ajustes avanzados'}
      </button>

      {showAdvanced && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Espaciado entre bloques" hint="Cuánto respiro hay entre secciones.">
            <Select
              value={get('spacing_scale')}
              onValueChange={(val) => sv('spacing_scale', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                <SelectItem value="tight">Aire contenido</SelectItem>
                <SelectItem value="balanced">Aire balanceado</SelectItem>
                <SelectItem value="airy">Aire amplio</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Redondeo de esquinas" hint="Qué tan suave se siente la interfaz.">
            <Select
              value={get('border_radius')}
              onValueChange={(val) => sv('border_radius', val)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {BORDER_RADIUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ElementType
  title: string
  hint: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-white/6">
        <Icon className="size-4 text-emerald-300" />
      </div>
      <div>
        <h3 className="font-heading text-xl font-semibold tracking-[-0.04em] text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-neutral-400">{hint}</p>
      </div>
    </div>
  )
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium text-neutral-200">{label}</Label>
      {hint ? <p className="mb-2 text-xs text-neutral-500">{hint}</p> : null}
      {children}
    </div>
  )
}

function OptionGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-neutral-200">{label}</p>
      {hint ? <p className="mb-3 text-xs text-neutral-500">{hint}</p> : null}
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </div>
  )
}

function OptionButton({
  label,
  hint,
  active,
  onClick,
}: {
  label: string
  hint?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-[20px] border px-4 py-3 text-left transition',
        active
          ? 'border-emerald-300/30 bg-emerald-400/10'
          : 'border-white/8 bg-white/4 hover:bg-white/6',
      )}
    >
      <p className="text-sm font-medium text-white">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-neutral-500">{hint}</p> : null}
    </button>
  )
}

function ContrastCard({
  label,
  value,
  description,
  tone,
}: {
  label: string
  value: string
  description: string
  tone: 'good' | 'warning'
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-neutral-300">{label}</p>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
            tone === 'good'
              ? 'border border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
              : 'border border-amber-300/20 bg-amber-400/10 text-amber-200',
          )}
        >
          {tone === 'good' ? 'OK' : 'Revisar'}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Contrast className="size-4 shrink-0 text-emerald-300" />
        <p className="text-lg font-semibold tracking-tight text-white">{value}</p>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{description}</p>
    </div>
  )
}

// ─── Previews ─────────────────────────────────────────────────────────────────

function TypographyPreviewPanel({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div
      className="overflow-hidden rounded-[26px] border border-white/8"
      style={{
        ...previewThemeVars,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 94%, white 6%), var(--store-surface))',
      }}
    >
      <div className="border-b border-white/8 px-5 py-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'var(--store-muted-text)' }}
        >
          Vista previa tipográfica
        </p>
      </div>
      <div className="space-y-5 px-5 py-5">
        <div>
          <p
            className="store-heading text-3xl leading-tight"
            style={{
              color: 'var(--store-text)',
              transform: 'scale(var(--store-heading-scale))',
              transformOrigin: 'left top',
            }}
          >
            Tu tienda vende mejor cuando se ve premium
          </p>
          <p
            className="mt-3 text-sm leading-6"
            style={{
              color: 'var(--store-soft-text)',
              fontSize: 'calc(0.95rem * var(--store-body-scale))',
            }}
          >
            Cada decisión tipográfica se ve aquí antes de guardar.
          </p>
          <button
            type="button"
            className="mt-4 rounded-[var(--store-button-radius)] px-5 py-2.5 text-sm font-semibold"
            style={{
              background:
                'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
              color: 'var(--store-primary-contrast)',
            }}
          >
            Comprar ahora
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className="rounded-[calc(var(--store-card-radius)*0.88)] border p-4"
            style={{
              borderColor: 'var(--store-card-border)',
              background: 'var(--store-card-background)',
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Fuente de títulos
            </p>
            <p className="store-heading mt-2 text-lg" style={{ color: 'var(--store-text)' }}>
              Título con claridad
            </p>
          </div>
          <div
            className="rounded-[calc(var(--store-card-radius)*0.88)] border p-4"
            style={{
              borderColor: 'var(--store-card-border)',
              background: 'var(--store-card-background)',
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Fuente de texto
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
              Texto más claro y más fácil de leer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingColorPreview({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div
      className="overflow-hidden rounded-[26px] border border-white/8"
      style={{ ...previewThemeVars, backgroundColor: 'var(--store-bg)' }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-5 py-3"
        style={{
          borderColor: 'var(--store-card-border)',
          backgroundColor: withAlpha('#ffffff', 0.03),
        }}
      >
        <div>
          <p className="store-heading text-sm" style={{ color: 'var(--store-text)' }}>
            Navbar
          </p>
          <p className="text-xs" style={{ color: 'var(--store-muted-text)' }}>
            Marca, CTA y contraste
          </p>
        </div>
        <button
          type="button"
          className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold"
          style={{
            background:
              'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
            color: 'var(--store-primary-contrast)',
          }}
        >
          CTA
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div
          className="rounded-[calc(var(--store-card-radius)*1.05)] p-5"
          style={{
            background:
              'linear-gradient(145deg, color-mix(in srgb, var(--store-surface) 88%, transparent), color-mix(in srgb, var(--store-bg) 88%, var(--store-text) 12%))',
            border: '1px solid var(--store-card-border)',
          }}
        >
          <span
            className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{
              backgroundColor: withAlpha(mixHexColors('#ffffff', '#000000', 0.1), 0.05),
              color: 'var(--store-secondary)',
              border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)',
            }}
          >
            Badge
          </span>
          <h3
            className="store-heading mt-4 text-2xl leading-tight"
            style={{ color: 'var(--store-text)' }}
          >
            Hero
          </h3>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
            Así se ve la paleta en acción antes de guardar.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold"
              style={{
                background:
                  'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                color: 'var(--store-primary-contrast)',
              }}
            >
              Comprar
            </button>
            <button
              type="button"
              className="rounded-[var(--store-button-radius)] border px-4 py-2 text-sm"
              style={{
                borderColor: 'var(--store-card-border)',
                backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
                color: 'var(--store-text)',
              }}
            >
              Ver catálogo
            </button>
          </div>
        </div>

        <div
          className="rounded-[var(--store-card-radius)] border p-4"
          style={{
            borderColor: 'var(--store-card-border)',
            background: 'var(--store-card-background)',
            boxShadow: 'var(--store-card-shadow)',
          }}
        >
          <div
            className="aspect-[4/3] rounded-[calc(var(--store-card-radius)*0.75)]"
            style={{
              background:
                'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))',
            }}
          />
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="store-heading text-base" style={{ color: 'var(--store-text)' }}>
              Producto
            </p>
            <p className="text-base font-semibold" style={{ color: 'var(--store-primary)' }}>
              $42.000
            </p>
          </div>
        </div>

        <div
          className="rounded-[calc(var(--store-card-radius)*0.86)] border-t px-1 pt-4"
          style={{ borderColor: 'var(--store-card-border)' }}
        >
          <div
            className="flex items-center justify-between rounded-[calc(var(--store-card-radius)*0.8)] px-4 py-3"
            style={{ backgroundColor: withAlpha('#000000', 0.08) }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Footer
            </p>
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: 'var(--store-accent)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
