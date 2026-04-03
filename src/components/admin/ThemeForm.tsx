'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { COPY } from '@/data/system-copy'
import {
  BORDER_RADIUS_OPTIONS,
  CONTAINER_WIDTH_OPTIONS,
  FONT_OPTIONS,
  GRID_COLUMNS_OPTIONS,
  IMAGE_RATIO_OPTIONS,
} from '@/data/defaults'
import { updateStoreTheme } from '@/lib/actions/store'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { StoreTheme } from '@/types/store'

type ThemeFormProps = {
  theme: StoreTheme
}

const COLOR_FIELDS = [
  { name: 'primary_color' as const, label: 'Color primario', description: 'Botones y acentos principales' },
  { name: 'secondary_color' as const, label: 'Color secundario', description: 'Badges y detalles de apoyo' },
  { name: 'background_color' as const, label: 'Fondo', description: 'Base general de la tienda' },
  { name: 'text_color' as const, label: 'Texto principal', description: 'Titulos y cuerpo de texto' },
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
      background_color: theme.background_color,
      text_color: theme.text_color,
      border_radius: theme.border_radius as StoreThemeInput['border_radius'],
      container_width: theme.container_width as StoreThemeInput['container_width'],
      font_family: theme.font_family as StoreThemeInput['font_family'],
      heading_scale: theme.heading_scale as StoreThemeInput['heading_scale'],
      body_scale: theme.body_scale as StoreThemeInput['body_scale'],
      card_layout: theme.card_layout as StoreThemeInput['card_layout'],
      grid_columns: theme.grid_columns,
      image_ratio: theme.image_ratio as StoreThemeInput['image_ratio'],
    },
  })

  async function onSubmit(data: StoreThemeInput) {
    setSubmitError(null)
    const result = await updateStoreTheme(data)

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }

    setSaved(true)
    toast.success('Tema actualizado.')
    setTimeout(() => setSaved(false), 2500)
  }

  const values = useWatch({ control })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section title="Colores" description="Una base sobria hace que la tienda se vea mas premium.">
        <div className="grid gap-5 sm:grid-cols-2">
          {COLOR_FIELDS.map((field) => {
            const value = values?.[field.name] ?? '#000000'
            return (
              <div key={field.name} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <Label className="text-sm font-medium text-white">{field.label}</Label>
                <p className="mt-1 text-xs text-neutral-500">{field.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <label
                    className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-white/10"
                    style={{ backgroundColor: value }}
                  >
                    <input
                      type="color"
                      value={value}
                      onChange={(event) => setValue(field.name, event.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  <input
                    {...register(field.name)}
                    className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/10 px-3 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                    placeholder="#000000"
                  />
                </div>
                {errors[field.name] ? (
                  <p className="mt-2 text-xs text-red-300">{errors[field.name]?.message}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Tipografia" description="Ajusta voz visual, jerarquia y ritmo de lectura.">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Fuente">
            <Select
              value={values?.font_family ?? theme.font_family}
              onValueChange={(value) => setValue('font_family', value as StoreThemeInput['font_family'])}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
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
              onValueChange={(value) => setValue('heading_scale', value as StoreThemeInput['heading_scale'])}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
                <SelectItem value="compact">Compacta</SelectItem>
                <SelectItem value="default">Normal</SelectItem>
                <SelectItem value="large">Amplia</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Escala de texto">
            <Select
              value={values?.body_scale ?? theme.body_scale}
              onValueChange={(value) => setValue('body_scale', value as StoreThemeInput['body_scale'])}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
                <SelectItem value="sm">Pequena</SelectItem>
                <SelectItem value="base">Normal</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Layout" description="Define estructura y respiracion del catalogo.">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <FormField label="Ancho del contenedor">
            <Select
              value={values?.container_width ?? theme.container_width}
              onValueChange={(value) => setValue('container_width', value as StoreThemeInput['container_width'])}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
                {CONTAINER_WIDTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Redondeo">
            <Select
              value={values?.border_radius ?? theme.border_radius}
              onValueChange={(value) => setValue('border_radius', value as StoreThemeInput['border_radius'])}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
                {BORDER_RADIUS_OPTIONS.map((option) => (
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
              onValueChange={(value) => setValue('grid_columns', Number(value) as 2 | 3 | 4)}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
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
              onValueChange={(value) => setValue('image_ratio', value as StoreThemeInput['image_ratio'])}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900 text-white">
                {IMAGE_RATIO_OPTIONS.map((option) => (
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
        <SaveButton isLoading={isSubmitting} isSaved={saved} />
      </div>
    </form>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-neutral-400">{description}</p>
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
