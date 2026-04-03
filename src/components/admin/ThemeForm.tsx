'use client'

import { useState } from 'react'
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
  BORDER_RADIUS_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  CARD_STYLE_OPTIONS,
  CONTAINER_WIDTH_OPTIONS,
  FONT_OPTIONS,
  FONT_PRESETS,
  GRID_COLUMNS_OPTIONS,
  HEADING_WEIGHT_OPTIONS,
  IMAGE_RATIO_OPTIONS,
  SPACING_SCALE_OPTIONS,
  UI_DENSITY_OPTIONS,
  VISUAL_MODE_OPTIONS,
} from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import { updateStoreTheme } from '@/lib/actions/store'
import { getContrastRatio } from '@/lib/utils/color'
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

export function ThemeForm({ theme }: ThemeFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    toast.success('Sistema visual actualizado.')
    setTimeout(() => setSaved(false), 2500)
  }

  const background = values?.background_color ?? theme.background_color
  const surface = values?.surface_color ?? theme.surface_color
  const text = values?.text_color ?? theme.text_color
  const contrastOnBackground = getContrastRatio(text, background).toFixed(1)
  const contrastOnSurface = getContrastRatio(text, surface).toFixed(1)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section
        icon={Type}
        title="Tipografia"
        description="Combina una voz visual con caracter y una lectura rapida. El preset fija una direccion; los controles refinan el resultado."
      >
        <div className="grid gap-3 xl:grid-cols-4">
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
                <p className="text-sm font-semibold text-white">{preset.label}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">{preset.description}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
          <FormField label="Fuente principal">
            <Select
              value={values?.heading_font ?? theme.heading_font}
              onValueChange={(value) =>
                setValue('heading_font', value as StoreThemeInput['heading_font'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Fuente secundaria">
            <Select
              value={values?.body_font ?? theme.body_font}
              onValueChange={(value) => {
                setValue('body_font', value as StoreThemeInput['body_font'], { shouldDirty: true })
                setValue('font_family', value as StoreThemeInput['font_family'], { shouldDirty: true })
              }}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Escala de titulos">
            <Select
              value={values?.heading_scale ?? theme.heading_scale}
              onValueChange={(value) =>
                setValue('heading_scale', value as StoreThemeInput['heading_scale'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                <SelectItem value="compact">Compacta</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="large">Expansiva</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Cuerpo">
            <Select
              value={values?.body_scale ?? theme.body_scale}
              onValueChange={(value) =>
                setValue('body_scale', value as StoreThemeInput['body_scale'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                <SelectItem value="sm">Compacto</SelectItem>
                <SelectItem value="base">Balanceado</SelectItem>
                <SelectItem value="lg">Amplio</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Peso tipografico">
            <Select
              value={values?.heading_weight ?? theme.heading_weight}
              onValueChange={(value) =>
                setValue('heading_weight', value as StoreThemeInput['heading_weight'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
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
      </Section>

      <Section
        icon={Palette}
        title="Color y contraste"
        description="Una paleta mas rica, con capas reales de superficie. El sistema valida contraste para evitar combinaciones flojas."
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

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
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

          <div
            className="rounded-[28px] border border-white/8 p-5"
            style={{ background: `linear-gradient(180deg, ${surface}, ${background})` }}
          >
            <p className="admin-label" style={{ color: text }}>
              Preview
            </p>
            <h3 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em]" style={{ color: text }}>
              Premium catalog that feels expensive at first glance
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-7" style={{ color: `${text}cc` }}>
              Tipografia con intencion, superficies profundas y una jerarquia visual mucho mas controlada.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="rounded-[16px] px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: values?.primary_color ?? theme.primary_color, color: background }}
              >
                Primary
              </button>
              <button
                type="button"
                className="rounded-[16px] px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `${values?.accent_color ?? theme.accent_color}20`,
                  color: values?.accent_color ?? theme.accent_color,
                  border: `1px solid ${(values?.accent_color ?? theme.accent_color)}33`,
                }}
              >
                Accent
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/8 bg-black/10 p-4 text-sm text-neutral-300">
          <div className="flex items-center gap-2">
            <Contrast className="size-4 text-emerald-300" />
            Contraste actual: fondo {contrastOnBackground}:1 / superficie {contrastOnSurface}:1
          </div>
        </div>
      </Section>

      <Section
        icon={Sparkles}
        title="Ritmo y componentes"
        description="Define densidad, spacing y personalidad de cards y botones sin permitir combinaciones rotas."
      >
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <FormField label="Densidad">
            <Select
              value={values?.ui_density ?? theme.ui_density}
              onValueChange={(value) =>
                setValue('ui_density', value as StoreThemeInput['ui_density'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {UI_DENSITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Spacing">
            <Select
              value={values?.spacing_scale ?? theme.spacing_scale}
              onValueChange={(value) =>
                setValue('spacing_scale', value as StoreThemeInput['spacing_scale'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {SPACING_SCALE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Cards">
            <Select
              value={values?.card_style ?? theme.card_style}
              onValueChange={(value) =>
                setValue('card_style', value as StoreThemeInput['card_style'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {CARD_STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Botones">
            <Select
              value={values?.button_style ?? theme.button_style}
              onValueChange={(value) =>
                setValue('button_style', value as StoreThemeInput['button_style'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {BUTTON_STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </Section>

      <Section
        icon={Layers3}
        title="Layout avanzado"
        description="Controla el ancho, el ritmo del grid y la forma general del catalogo sin convertirlo en un builder libre."
      >
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <FormField label="Ancho">
            <Select
              value={values?.container_width ?? theme.container_width}
              onValueChange={(value) =>
                setValue('container_width', value as StoreThemeInput['container_width'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-950 text-white">
                {CONTAINER_WIDTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Columnas">
            <Select
              value={String(values?.grid_columns ?? theme.grid_columns)}
              onValueChange={(value) => setValue('grid_columns', Number(value) as 2 | 3 | 4, { shouldDirty: true })}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
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

          <FormField label="Ratio de imagen">
            <Select
              value={values?.image_ratio ?? theme.image_ratio}
              onValueChange={(value) =>
                setValue('image_ratio', value as StoreThemeInput['image_ratio'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
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

          <FormField label="Redondeo global">
            <Select
              value={values?.border_radius ?? theme.border_radius}
              onValueChange={(value) =>
                setValue('border_radius', value as StoreThemeInput['border_radius'], { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
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
      </Section>

      {submitError ? <FormFeedback kind="error" message={submitError} /> : null}

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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium text-neutral-200">{label}</Label>
      {children}
    </div>
  )
}
