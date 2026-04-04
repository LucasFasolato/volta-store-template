'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Contrast, Layers3, Palette, Sparkles, Type } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
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
import {
  getAccessibleTextColor,
  getContrastRatio,
  mixHexColors,
  withAlpha,
} from '@/lib/utils/color'
import { buildThemeVars } from '@/lib/utils/theme'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { StoreTheme } from '@/types/store'

type ThemeFormProps = {
  theme: StoreTheme
}

const COLOR_FIELDS = [
  { name: 'primary_color' as const, label: 'Primary', description: 'Botones principales y foco visual' },
  { name: 'secondary_color' as const, label: 'Secondary', description: 'Apoyo, badges y senalizacion suave' },
  { name: 'accent_color' as const, label: 'Accent', description: 'Destellos de alto valor o highlights' },
  { name: 'background_color' as const, label: 'Background', description: 'Base general de la tienda' },
  { name: 'surface_color' as const, label: 'Surface', description: 'Cards, paneles y overlays' },
  { name: 'text_color' as const, label: 'Text', description: 'Jerarquia principal de lectura' },
]

const TYPOGRAPHY_TITLE = 'Tu tienda vende mejor cuando se ve premium'
const TYPOGRAPHY_BODY = 'Vista previa de jerarquia, lectura y personalidad visual'

export function ThemeForm({ theme }: ThemeFormProps) {
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
    toast.success('La apariencia se actualizo y el preview ya refleja el cambio.')
    setTimeout(() => setSaved(false), 2500)
  }

  const background = values?.background_color ?? theme.background_color
  const surface = values?.surface_color ?? theme.surface_color
  const text = values?.text_color ?? theme.text_color
  const primary = values?.primary_color ?? theme.primary_color
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
  const previewThemeVars = useMemo(() => buildThemeVars(previewTheme, resolvedMode), [previewTheme, resolvedMode])
  const contrastOnBackground = getContrastRatio(text, background).toFixed(1)
  const contrastOnSurface = getContrastRatio(text, surface).toFixed(1)
  const contrastOnPrimary = getContrastRatio(getAccessibleTextColor(primary), primary).toFixed(1)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section
        icon={Type}
        title="Tipografia"
        description="Cada decision tipografica ahora se entiende antes de guardar: preset, fuente principal, fuente secundaria, peso y escalas muestran su efecto en una vista real."
      >
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-5">
            <div className="grid gap-3 xl:grid-cols-2">
              {FONT_PRESETS.map((preset) => {
                const active = (values?.font_preset ?? theme.font_preset) === preset.value
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => applyTypographyPreset(preset.value)}
                    className={
                      active
                        ? 'rounded-[24px] border border-emerald-300/30 bg-emerald-400/10 p-4 text-left'
                        : 'rounded-[24px] border border-white/8 bg-white/4 p-4 text-left transition hover:bg-white/6'
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{preset.label}</p>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        preset
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">{preset.description}</p>
                    <p className="mt-3 text-xs text-neutral-500">
                      Principal {FONT_OPTIONS.find((item) => item.value === preset.heading_font)?.label} + secundaria{' '}
                      {FONT_OPTIONS.find((item) => item.value === preset.body_font)?.label}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
              <FormField
                label="Fuente principal"
                hint="Titulos y mensajes de mayor impacto."
              >
                <Select
                  value={values?.heading_font ?? theme.heading_font}
                  onValueChange={(value) =>
                    setValue('heading_font', value as StoreThemeInput['heading_font'], { shouldDirty: true })
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-neutral-950 text-white">
                    {FONT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="py-1">
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className="mt-1 text-[13px]" style={{ fontFamily: FONT_FAMILY_MAP[option.value] }}>
                            {TYPOGRAPHY_TITLE}
                          </p>
                          <p className="text-xs text-neutral-500" style={{ fontFamily: FONT_FAMILY_MAP[option.value] }}>
                            {TYPOGRAPHY_BODY}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Fuente secundaria"
                hint="Textos, fichas y detalles de producto."
              >
                <Select
                  value={values?.body_font ?? theme.body_font}
                  onValueChange={(value) => {
                    setValue('body_font', value as StoreThemeInput['body_font'], { shouldDirty: true })
                    setValue('font_family', value as StoreThemeInput['font_family'], { shouldDirty: true })
                  }}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-neutral-950 text-white">
                    {FONT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="py-1">
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className="mt-1 text-[13px]" style={{ fontFamily: FONT_FAMILY_MAP[option.value] }}>
                            La lectura correcta hace que comprar sea mas facil.
                          </p>
                          <p className="text-xs text-neutral-500" style={{ fontFamily: FONT_FAMILY_MAP[option.value] }}>
                            Vista previa de claridad, ritmo y personalidad visual.
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Escala de titulos" hint="Cuanta presencia tiene el titular.">
                <Select
                  value={values?.heading_scale ?? theme.heading_scale}
                  onValueChange={(value) =>
                    setValue('heading_scale', value as StoreThemeInput['heading_scale'], { shouldDirty: true })
                  }
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

              <FormField label="Escala de texto" hint="Que tan descansada se siente la lectura.">
                <Select
                  value={values?.body_scale ?? theme.body_scale}
                  onValueChange={(value) =>
                    setValue('body_scale', value as StoreThemeInput['body_scale'], { shouldDirty: true })
                  }
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

              <FormField label="Peso tipografico" hint="Mas delicado o mas firme.">
                <Select
                  value={values?.heading_weight ?? theme.heading_weight}
                  onValueChange={(value) =>
                    setValue('heading_weight', value as StoreThemeInput['heading_weight'], { shouldDirty: true })
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-neutral-950 text-white">
                    {HEADING_WEIGHT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>

          <TypographyPreviewPanel previewThemeVars={previewThemeVars} />
        </div>
      </Section>

      <Section
        icon={Palette}
        title="Color y contraste"
        description="No ves solo swatches: ves una mini landing con navbar, hero, card, badge, CTA y footer para entender el resultado antes de guardar."
      >
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {COLOR_FIELDS.map((field) => {
            const value = values?.[field.name] ?? theme[field.name]
            return (
              <div key={field.name} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <Label className="text-sm font-medium text-white">{field.label}</Label>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{field.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <label
                    className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-white/10"
                    style={{ backgroundColor: value }}
                  >
                    <input
                      type="color"
                      value={value}
                      onChange={(event) =>
                        setValue(field.name, event.target.value as StoreThemeInput[typeof field.name], {
                          shouldDirty: true,
                        })
                      }
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  <input
                    {...register(field.name)}
                    className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/10 px-3 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                </div>
                {errors[field.name] ? <p className="mt-2 text-xs text-red-300">{errors[field.name]?.message}</p> : null}
              </div>
            )
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
            <p className="admin-label">Modo visual</p>
            <div className="mt-3 grid gap-2">
              {VISUAL_MODE_OPTIONS.map((option) => {
                const active = (values?.visual_mode ?? theme.visual_mode) === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue('visual_mode', option.value as StoreThemeInput['visual_mode'], { shouldDirty: true })
                    }
                    className={
                      active
                        ? 'rounded-[20px] border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-left'
                        : 'rounded-[20px] border border-white/8 bg-black/10 px-4 py-3 text-left transition hover:bg-white/6'
                    }
                  >
                    <p className="text-sm font-medium text-white">{option.label}</p>
                    <p className="mt-1 text-xs text-neutral-500">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <LandingColorPreview previewThemeVars={previewThemeVars} />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <ContrastCard
            label="Texto sobre fondo"
            value={`${contrastOnBackground}:1`}
            description="Ayuda a que toda la tienda se lea sin esfuerzo."
            tone={Number(contrastOnBackground) >= 4.5 ? 'good' : 'warning'}
          />
          <ContrastCard
            label="Texto sobre superficie"
            value={`${contrastOnSurface}:1`}
            description="Clave para cards, paneles y overlays."
            tone={Number(contrastOnSurface) >= 4.5 ? 'good' : 'warning'}
          />
          <ContrastCard
            label="CTA principal"
            value={`${contrastOnPrimary}:1`}
            description="Sirve para detectar botones ilegibles antes de guardar."
            tone={Number(contrastOnPrimary) >= 4.5 ? 'good' : 'warning'}
          />
        </div>
      </Section>

      <Section
        icon={Sparkles}
        title="Apariencia avanzada"
        description="Mas aire entre bloques, tarjetas mas suaves o mas firmes y botones con mejor gesto visual. Todo con un preview simple para entender el cambio."
      >
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <ExplainerCard title="Mas aire entre bloques" description="Cambia la velocidad de lectura y la sensacion premium." />
          <ExplainerCard title="Tarjetas mas suaves o mas firmes" description="Define personalidad sin volver tecnico el control." />
          <ExplainerCard title="Botones mas claros" description="El preview muestra si el gesto se siente elegante o agresivo." />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField label="Densidad" hint="Mas informacion por pantalla o una vista mas relajada.">
              <Select
                value={values?.ui_density ?? theme.ui_density}
                onValueChange={(value) =>
                  setValue('ui_density', value as StoreThemeInput['ui_density'], { shouldDirty: true })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white">
                  <SelectItem value="compact">Mas compacto</SelectItem>
                  <SelectItem value="comfortable">Balanceado</SelectItem>
                  <SelectItem value="spacious">Mas aire</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Spacing" hint="Cuanto respiro hay entre bloques.">
              <Select
                value={values?.spacing_scale ?? theme.spacing_scale}
                onValueChange={(value) =>
                  setValue('spacing_scale', value as StoreThemeInput['spacing_scale'], { shouldDirty: true })
                }
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

            <FormField label="Tarjetas" hint="Mas suaves, mas firmes o mas expresivas.">
              <Select
                value={values?.card_style ?? theme.card_style}
                onValueChange={(value) =>
                  setValue('card_style', value as StoreThemeInput['card_style'], { shouldDirty: true })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white">
                  <SelectItem value="soft">Suaves</SelectItem>
                  <SelectItem value="sharp">Firmes</SelectItem>
                  <SelectItem value="glass">Cristal</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Botones" hint="El gesto visual de la accion principal.">
              <Select
                value={values?.button_style ?? theme.button_style}
                onValueChange={(value) =>
                  setValue('button_style', value as StoreThemeInput['button_style'], { shouldDirty: true })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white">
                  <SelectItem value="rounded">Redondeados</SelectItem>
                  <SelectItem value="square">Firmes</SelectItem>
                  <SelectItem value="pill">Capsula</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <AdvancedRhythmPreviewPanel previewThemeVars={previewThemeVars} />
        </div>
      </Section>

      <Section
        icon={Layers3}
        title="Catalogo y layout"
        description="Controla si la tienda se siente mas boutique o mas compacta. El preview te ayuda a entender ancho, grilla, imagen y redondeo."
      >
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField label="Ancho" hint="Mas contenido dentro del viewport o una experiencia mas enfocada.">
              <Select
                value={values?.container_width ?? theme.container_width}
                onValueChange={(value) =>
                  setValue('container_width', value as StoreThemeInput['container_width'], { shouldDirty: true })
                }
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

            <FormField label="Columnas" hint="Mas visual o mas compacto.">
              <Select
                value={String(values?.grid_columns ?? theme.grid_columns)}
                onValueChange={(value) => setValue('grid_columns', Number(value) as 2 | 3 | 4, { shouldDirty: true })}
              >
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white">
                  {GRID_COLUMNS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Ratio de imagen" hint="La forma con la que el producto se presenta.">
              <Select
                value={values?.image_ratio ?? theme.image_ratio}
                onValueChange={(value) =>
                  setValue('image_ratio', value as StoreThemeInput['image_ratio'], { shouldDirty: true })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white">
                  {IMAGE_RATIO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Redondeo global" hint="Que tan suave se siente la interfaz.">
              <Select
                value={values?.border_radius ?? theme.border_radius}
                onValueChange={(value) =>
                  setValue('border_radius', value as StoreThemeInput['border_radius'], { shouldDirty: true })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white">
                  {BORDER_RADIUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <CatalogLayoutPreviewPanel previewThemeVars={previewThemeVars} columns={values?.grid_columns ?? theme.grid_columns} />
        </div>
      </Section>

      {submitError ? (
        <FormFeedback kind="error" title="No pudimos guardar la apariencia" message={submitError} />
      ) : null}
      {!submitError && saved ? (
        <FormFeedback
          kind="success"
          title="Apariencia guardada"
          message="La tienda publica ya puede reflejar esta nueva version visual."
        />
      ) : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar sistema visual" />
      </div>
    </form>
  )
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="surface-panel premium-ring rounded-[30px] px-5 py-6 sm:px-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-white/6">
          <Icon className="size-4 text-emerald-300" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold tracking-[-0.04em] text-white">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">{description}</p>
        </div>
      </div>
      <Separator className="mb-5 bg-white/8" />
      {children}
    </section>
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
      {hint ? <p className="mb-2 text-xs leading-5 text-neutral-500">{hint}</p> : null}
      {children}
    </div>
  )
}

function ExplainerCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
    </div>
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
    <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span
          className={
            tone === 'good'
              ? 'rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200'
              : 'rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200'
          }
        >
          {tone === 'good' ? 'OK' : 'Revisar'}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/6">
          <Contrast className="size-4 text-emerald-300" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">{value}</p>
          <p className="text-xs text-neutral-500">{description}</p>
        </div>
      </div>
    </div>
  )
}

function TypographyPreviewPanel({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div
      className="overflow-hidden rounded-[30px] border border-white/8"
      style={{
        ...previewThemeVars,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 94%, white 6%), color-mix(in srgb, var(--store-surface) 92%, transparent))',
      }}
    >
      <div className="border-b border-white/8 px-5 py-4">
        <p className="admin-label" style={{ color: 'var(--store-muted-text)' }}>
          Preview tipografico
        </p>
      </div>
      <div className="space-y-5 px-5 py-5">
        <div>
          <p
            className="store-heading text-[2rem] leading-[0.95]"
            style={{
              color: 'var(--store-text)',
              transform: 'scale(var(--store-heading-scale))',
              transformOrigin: 'left top',
            }}
          >
            {TYPOGRAPHY_TITLE}
          </p>
          <p
            className="mt-3 max-w-xl leading-7"
            style={{
              color: 'var(--store-soft-text)',
              fontSize: 'calc(0.98rem * var(--store-body-scale))',
            }}
          >
            {TYPOGRAPHY_BODY}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className="rounded-[calc(var(--store-card-radius)*0.88)] border p-4"
            style={{
              borderColor: 'var(--store-card-border)',
              background: 'var(--store-card-background)',
              boxShadow: 'var(--store-card-shadow)',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
              Fuente principal
            </p>
            <p className="store-heading mt-3 text-xl" style={{ color: 'var(--store-text)' }}>
              Titulos con claridad y autoridad
            </p>
          </div>
          <div
            className="rounded-[calc(var(--store-card-radius)*0.88)] border p-4"
            style={{
              borderColor: 'var(--store-card-border)',
              background: 'var(--store-card-background)',
              boxShadow: 'var(--store-card-shadow)',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
              Fuente secundaria
            </p>
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
              Textos mas claros, fichas mas faciles de leer y menos sensacion tecnica.
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
      className="overflow-hidden rounded-[30px] border border-white/8"
      style={{
        ...previewThemeVars,
        backgroundColor: 'var(--store-bg)',
      }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-5 py-4"
        style={{
          borderColor: 'var(--store-card-border)',
          backgroundColor: withAlpha('#ffffff', 0.03),
        }}
      >
        <div>
          <p className="store-heading text-base" style={{ color: 'var(--store-text)' }}>
            Navbar
          </p>
          <p className="text-xs" style={{ color: 'var(--store-muted-text)' }}>
            Marca, CTA y contraste general
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

      <div className="space-y-5 px-5 py-5">
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
          <h3 className="store-heading mt-4 text-[1.6rem] leading-tight" style={{ color: 'var(--store-text)' }}>
            Hero
          </h3>
          <p className="mt-3 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
            Mini mockup util para entender como cambian capas, foco visual y legibilidad.
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
              Comprar ahora
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
              Ver catalogo
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
            className="aspect-[4/3] rounded-[calc(var(--store-card-radius)*0.8)]"
            style={{
              background:
                'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))',
            }}
          />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="store-heading text-lg" style={{ color: 'var(--store-text)' }}>
                Product card
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                Precio legible, fondo claro y CTA visible.
              </p>
            </div>
            <p className="text-lg font-semibold" style={{ color: 'var(--store-primary)' }}>
              $42.000
            </p>
          </div>
        </div>

        <div
          className="rounded-[calc(var(--store-card-radius)*0.86)] border-t px-1 pt-4"
          style={{ borderColor: 'var(--store-card-border)' }}
        >
          <div className="flex items-center justify-between gap-3 rounded-[calc(var(--store-card-radius)*0.8)] px-4 py-3" style={{ backgroundColor: withAlpha('#000000', 0.08) }}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
                Footer
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--store-soft-text)' }}>
                Cierre visual mas firme y con mas marca.
              </p>
            </div>
            <span className="size-2.5 rounded-full" style={{ backgroundColor: 'var(--store-accent)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function AdvancedRhythmPreviewPanel({ previewThemeVars }: { previewThemeVars: React.CSSProperties }) {
  return (
    <div
      className="overflow-hidden rounded-[30px] border border-white/8"
      style={{
        ...previewThemeVars,
        backgroundColor: 'var(--store-bg)',
      }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--store-card-border)' }}>
        <p className="admin-label" style={{ color: 'var(--store-muted-text)' }}>
          Preview de ritmo y componentes
        </p>
      </div>
      <div className="grid gap-4 px-5 py-5 lg:grid-cols-2">
        <div
          className="rounded-[var(--store-card-radius)] border p-4"
          style={{
            borderColor: 'var(--store-card-border)',
            background: 'var(--store-card-background)',
            boxShadow: 'var(--store-card-shadow)',
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
            Ritmo
          </p>
          <div className="mt-4 space-y-[var(--store-space-cluster)]">
            <div className="h-4 w-24 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.08) }} />
            <div className="h-12 rounded-[calc(var(--store-card-radius)*0.7)]" style={{ backgroundColor: withAlpha('#ffffff', 0.06) }} />
            <div className="h-12 rounded-[calc(var(--store-card-radius)*0.7)]" style={{ backgroundColor: withAlpha('#ffffff', 0.06) }} />
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
            Componentes
          </p>
          <div className="mt-4 space-y-3">
            <div className="h-20 rounded-[calc(var(--store-card-radius)*0.78)]" style={{ backgroundColor: withAlpha('#ffffff', 0.06) }} />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold"
                style={{
                  background:
                    'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                  color: 'var(--store-primary-contrast)',
                }}
              >
                Principal
              </button>
              <button
                type="button"
                className="rounded-[var(--store-button-radius)] border px-4 py-2 text-sm"
                style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)' }}
              >
                Secundario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CatalogLayoutPreviewPanel({
  previewThemeVars,
  columns,
}: {
  previewThemeVars: React.CSSProperties
  columns: number
}) {
  const previewCount = columns >= 4 ? 4 : columns === 3 ? 3 : 2
  const imageRatio = String(previewThemeVars['--store-image-ratio' as keyof React.CSSProperties] ?? '4 / 5')
  const imageClass =
    imageRatio === '1 / 1' ? 'aspect-square' : imageRatio === '16 / 9' ? 'aspect-video' : imageRatio === '3 / 4' ? 'aspect-[3/4]' : 'aspect-[4/5]'

  return (
    <div
      className="overflow-hidden rounded-[30px] border border-white/8"
      style={{
        ...previewThemeVars,
        backgroundColor: 'var(--store-bg)',
      }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--store-card-border)' }}>
        <p className="admin-label" style={{ color: 'var(--store-muted-text)' }}>
          Preview de layout
        </p>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="store-heading text-lg" style={{ color: 'var(--store-text)' }}>
              Catalogo
            </p>
            <p className="text-sm" style={{ color: 'var(--store-soft-text)' }}>
              Ancho, grilla e imagen cambian la lectura del producto.
            </p>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-muted-text)' }}
          >
            {columns} cols
          </span>
        </div>
        <div className={`grid gap-3 ${previewCount === 4 ? 'grid-cols-4' : previewCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {Array.from({ length: previewCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`${imageClass} rounded-[calc(var(--store-card-radius)*0.75)]`}
                style={{
                  background:
                    'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))',
                }}
              />
              <div className="h-3 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.08) }} />
              <div className="h-2.5 w-2/3 rounded-full" style={{ backgroundColor: withAlpha('#ffffff', 0.05) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
