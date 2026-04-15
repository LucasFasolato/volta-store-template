'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import {
  CheckCircle2,
  Eye,
  Monitor,
  Rows3,
  Smartphone,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { FONT_PRESETS, normalizeThemeFontSelection } from '@/data/defaults'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { updateStoreTheme, uploadLogo } from '@/lib/actions/store'
import { normalizeCardLayout } from '@/lib/utils/card-layout'
import { buildThemeVars } from '@/lib/utils/theme'
import { cn } from '@/lib/utils'
import { storeThemeSchema, type StoreThemeInput } from '@/lib/validations/store'
import type { Store, StoreTheme } from '@/types/store'

type AdvancedTab = 'fuentes' | 'colores' | 'productos' | 'layout' | 'avanzado'
type PreviewDevice = 'desktop' | 'mobile'

const DENSITY_OPTIONS: Array<{ value: StoreThemeInput['ui_density']; label: string; hint: string }> = [
  { value: 'compact', label: 'Compacto', hint: 'Mas informacion por pantalla.' },
  { value: 'comfortable', label: 'Balanceado', hint: 'Un buen punto medio.' },
  { value: 'spacious', label: 'Con aire', hint: 'Mas presencia y respiro.' },
]

const CARD_LAYOUT_OPTIONS: Array<{
  value: StoreThemeInput['card_layout']
  label: string
  hint: string
}> = [
  { value: 'classic', label: 'Clasicas', hint: 'La foto arriba y la info debajo.' },
  { value: 'visual', label: 'Visuales', hint: 'La imagen manda mas fuerte.' },
  { value: 'compact', label: 'Compactas', hint: 'Mas densas y directas.' },
]

type QuickAppearanceFormProps = {
  theme: StoreTheme
  store: Store
  onOpenAdvanced: (tab: AdvancedTab) => void
}

export function QuickAppearanceForm({
  theme,
  store,
  onOpenAdvanced,
}: QuickAppearanceFormProps) {
  const normalizedTheme = useMemo(() => normalizeThemeFontSelection(theme), [theme])
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => matchPreset(normalizedTheme))

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<StoreThemeInput>({
    resolver: zodResolver(storeThemeSchema),
    defaultValues: {
      primary_color: normalizedTheme.primary_color,
      secondary_color: normalizedTheme.secondary_color,
      accent_color: normalizedTheme.accent_color,
      background_color: normalizedTheme.background_color,
      surface_color: normalizedTheme.surface_color,
      text_color: normalizedTheme.text_color,
      visual_mode: normalizedTheme.visual_mode as StoreThemeInput['visual_mode'],
      border_radius: normalizedTheme.border_radius as StoreThemeInput['border_radius'],
      container_width: normalizedTheme.container_width as StoreThemeInput['container_width'],
      font_preset: normalizedTheme.font_preset as StoreThemeInput['font_preset'],
      heading_font: normalizedTheme.heading_font as StoreThemeInput['heading_font'],
      body_font: normalizedTheme.body_font as StoreThemeInput['body_font'],
      font_family: normalizedTheme.font_family as StoreThemeInput['font_family'],
      heading_scale: normalizedTheme.heading_scale as StoreThemeInput['heading_scale'],
      heading_weight: normalizedTheme.heading_weight as StoreThemeInput['heading_weight'],
      body_scale: normalizedTheme.body_scale as StoreThemeInput['body_scale'],
      ui_density: normalizedTheme.ui_density as StoreThemeInput['ui_density'],
      spacing_scale: normalizedTheme.spacing_scale as StoreThemeInput['spacing_scale'],
      card_style: normalizedTheme.card_style as StoreThemeInput['card_style'],
      card_layout: normalizedTheme.card_layout as StoreThemeInput['card_layout'],
      button_style: normalizedTheme.button_style as StoreThemeInput['button_style'],
      grid_columns: normalizedTheme.grid_columns,
      image_ratio: normalizedTheme.image_ratio as StoreThemeInput['image_ratio'],
      background_color_2: normalizedTheme.background_color_2 ?? null,
      background_direction: (normalizedTheme.background_direction ?? 'diagonal') as StoreThemeInput['background_direction'],
    },
  })

  const values = useWatch({ control })

  const previewTheme = useMemo(
    () =>
      ({
        ...normalizedTheme,
        ...values,
        font_family: values?.body_font ?? normalizedTheme.body_font,
        grid_columns: values?.grid_columns ?? normalizedTheme.grid_columns,
      }) as StoreTheme,
    [normalizedTheme, values],
  )

  const previewVars = useMemo(
    () => buildThemeVars(previewTheme, previewTheme.visual_mode === 'dark' ? 'dark' : 'light'),
    [previewTheme],
  )

  const activePreset = selectedPresetId
    ? THEME_PRESETS.find((preset) => preset.id === selectedPresetId) ?? null
    : null

  function setThemeValue<K extends keyof StoreThemeInput>(name: K, value: StoreThemeInput[K]) {
    setValue(name as never, value as never, { shouldDirty: true })
    setSaved(false)
  }

  function applyFontPreset(value: StoreThemeInput['font_preset']) {
    const preset = FONT_PRESETS.find((item) => item.value === value)
    if (!preset) return

    setThemeValue('font_preset', value)
    setThemeValue('heading_font', preset.heading_font as StoreThemeInput['heading_font'])
    setThemeValue('body_font', preset.body_font as StoreThemeInput['body_font'])
    setThemeValue('font_family', preset.body_font as StoreThemeInput['font_family'])
    setThemeValue('heading_weight', preset.heading_weight as StoreThemeInput['heading_weight'])
  }

  function applyVisualPreset(preset: ThemePreset) {
    setSelectedPresetId(preset.id)
    setSaved(false)

    Object.entries(preset.theme).forEach(([rawKey, rawValue]) => {
      if (typeof rawValue === 'undefined') return
      const key = rawKey as keyof StoreThemeInput
      setValue(key as never, rawValue as never, { shouldDirty: true })
    })

    if (preset.theme.body_font) {
      setValue('font_family', preset.theme.body_font as never, { shouldDirty: true })
    }
  }

  async function onSubmit(data: StoreThemeInput) {
    setSubmitError(null)

    const result = await updateStoreTheme({
      ...data,
      font_family: data.body_font,
    })

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? 'No se pudo guardar la apariencia.'
      setSubmitError(message)
      toast.error(message)
      return
    }

    setSaved(true)
    toast.success('Apariencia guardada.')
  }

  const summaryItems = [
    activePreset?.name ?? 'Estilo actual',
    FONT_PRESETS.find((preset) => preset.value === previewTheme.font_preset)?.label ?? 'Tipografia personalizada',
    DENSITY_OPTIONS.find((option) => option.value === previewTheme.ui_density)?.label ?? 'Balanceado',
    CARD_LAYOUT_OPTIONS.find((option) => option.value === normalizeCardLayout(previewTheme.card_layout))?.label ?? 'Clasicas',
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
      <div className="space-y-4">
        <section className="admin-surface rounded-[24px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Inicio rapido
              </p>
              <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-foreground">
                Empieza por una direccion visual fuerte
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Elige una base que ya se vea bien y luego afina color, tipografia y ritmo. Si
                despues quieres mas control, el modo avanzado sigue ahi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenAdvanced('colores')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-black/[0.04] px-4 py-2 text-sm font-medium text-foreground transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
            >
              Abrir avanzado
              <CheckCircle2 className="size-4" />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {THEME_PRESETS.map((preset) => {
              const selected = selectedPresetId === preset.id

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyVisualPreset(preset)}
                  className={cn(
                    'rounded-[22px] border p-4 text-left transition duration-150 hover:-translate-y-0.5',
                    selected
                      ? 'border-emerald-300/24 bg-emerald-400/8'
                      : 'border-border bg-black/[0.04] hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {preset.previewColors.map((color) => (
                      <span
                        key={`${preset.id}-${color}`}
                        className="size-3 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                    {selected ? (
                      <span className="rounded-full bg-emerald-400/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                        Activo
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{preset.description}</p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {preset.tags[0]}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="admin-surface rounded-[24px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Tipografia
                </p>
                <h4 className="mt-2 text-lg font-semibold text-foreground">Define el tono visual</h4>
              </div>
              <button
                type="button"
                onClick={() => onOpenAdvanced('fuentes')}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Mas opciones
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {FONT_PRESETS.map((preset) => {
                const active = previewTheme.font_preset === preset.value

                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => applyFontPreset(preset.value)}
                    className={cn(
                      'flex items-center justify-between rounded-[18px] border px-4 py-3 text-left transition',
                      active
                        ? 'border-emerald-300/24 bg-emerald-400/8'
                        : 'border-border bg-black/[0.04] hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]',
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {preset.heading_font === 'playfair'
                          ? 'Mas editorial'
                          : preset.heading_weight === 'bold'
                            ? 'Mas enfatico'
                            : 'Mas limpio y versatil'}
                      </p>
                    </div>
                    <Type className={cn('size-4', active ? 'text-emerald-300' : 'text-muted-foreground')} />
                  </button>
                )
              })}
            </div>
          </section>

          <section className="admin-surface rounded-[24px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Colores clave
                </p>
                <h4 className="mt-2 text-lg font-semibold text-foreground">Toca solo lo que mas se ve</h4>
              </div>
              <button
                type="button"
                onClick={() => onOpenAdvanced('colores')}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Mas opciones
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ColorSwatchControl
                label="Color principal"
                value={previewTheme.primary_color}
                onChange={(value) => setThemeValue('primary_color', value)}
              />
              <ColorSwatchControl
                label="Acento"
                value={previewTheme.accent_color}
                onChange={(value) => setThemeValue('accent_color', value)}
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Si quieres tocar fondo, superficies, contraste o modo visual, dejalo para avanzado.
            </p>
          </section>

          <section className="admin-surface rounded-[24px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Ritmo visual
                </p>
                <h4 className="mt-2 text-lg font-semibold text-foreground">Ajusta la sensacion general</h4>
              </div>
              <button
                type="button"
                onClick={() => onOpenAdvanced('layout')}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Mas opciones
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Densidad</p>
                <div className="grid gap-2">
                  {DENSITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setThemeValue('ui_density', option.value)}
                      className={cn(
                        'rounded-[18px] border px-4 py-3 text-left transition',
                        previewTheme.ui_density === option.value
                          ? 'border-emerald-300/24 bg-emerald-400/8'
                          : 'border-border bg-black/[0.04] hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]',
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Tarjetas de producto</p>
                <div className="grid gap-2">
                  {CARD_LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setThemeValue('card_layout', option.value)}
                      className={cn(
                        'rounded-[18px] border px-4 py-3 text-left transition',
                        normalizeCardLayout(previewTheme.card_layout) === option.value
                          ? 'border-emerald-300/24 bg-emerald-400/8'
                          : 'border-border bg-black/[0.04] hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]',
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="branding" className="admin-surface rounded-[24px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Branding esencial
            </p>
            <h4 className="mt-2 text-lg font-semibold text-foreground">Logo y presencia basica</h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              El logo completa la identidad visual sin obligarte a abrir configuraciones tecnicas.
            </p>

            <div className="mt-4 max-w-[240px]">
              <ImageUpload
                currentUrl={store.logo_url}
                onUpload={uploadLogo}
                fieldName="logo"
                aspectHint="1:1"
                label="Subir logo"
              />
            </div>

            <button
              type="button"
              onClick={() => onOpenAdvanced('avanzado')}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-emerald-300"
            >
              Ajustar secciones de la tienda
              <Rows3 className="size-4" />
            </button>
          </section>
        </div>

        {submitError ? (
          <FormFeedback kind="error" title="No pudimos guardar la apariencia" message={submitError} />
        ) : null}
        {!submitError && saved ? (
          <FormFeedback
            kind="success"
            title="Apariencia guardada"
            message="La tienda ya tiene una base visual clara y lista para seguir afinando si hace falta."
          />
        ) : null}

        <section className="admin-surface rounded-[24px] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Ya deberias estar cerca de una tienda presentable</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Si con esto ya te gusta como se ve, guarda y sigue. Si no, entra a avanzado para
                tocar colores, fuentes, productos o secciones con mas detalle.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onOpenAdvanced('colores')}
                className="rounded-xl border border-border bg-black/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
              >
                Ir a avanzado
              </button>
              <SaveButton
                isLoading={isSubmitting}
                isSaved={saved}
                label="Guardar estilo rapido"
                loadingLabel="Guardando estilo..."
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-3 xl:sticky xl:top-6 xl:self-start">
        <section className="admin-surface rounded-[24px] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Preview principal
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ve el cambio antes de entrar al detalle fino.
              </p>
            </div>

            <a
              href="/admin/vista-previa"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-black/[0.04] px-4 py-2 text-sm font-medium text-foreground transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
            >
              Ver tienda
              <Eye className="size-4" />
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {summaryItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between px-0.5">
          <div className="flex rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-0.5">
            {([
              { value: 'desktop' as const, label: 'Desktop', icon: Monitor },
              { value: 'mobile' as const, label: 'Mobile', icon: Smartphone },
            ] as const).map((option) => {
              const Icon = option.icon

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDevice(option.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition',
                    device === option.value
                      ? 'admin-surface-selected text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onOpenAdvanced('productos')}
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            Ajustar productos
          </button>
        </section>

        {device === 'mobile' ? (
          <div className="flex justify-center">
            <div
              className="w-full overflow-hidden rounded-[32px] shadow-[0_0_0_6px_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.5)]"
              style={{ maxWidth: 390 }}
            >
              <QuickStoreMockup previewTheme={previewTheme} previewVars={previewVars} store={store} />
            </div>
          </div>
        ) : (
          <QuickStoreMockup previewTheme={previewTheme} previewVars={previewVars} store={store} />
        )}
      </div>
    </form>
  )
}

function ColorSwatchControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="rounded-[18px] border border-border bg-black/[0.04] p-3 transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="mt-3 flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-11 cursor-pointer rounded-full border border-white/10 bg-transparent p-0"
        />
        <span className="text-sm text-muted-foreground">{value}</span>
      </span>
    </label>
  )
}

function QuickStoreMockup({
  previewTheme,
  previewVars,
  store,
}: {
  previewTheme: StoreTheme
  previewVars: React.CSSProperties
  store: Store
}) {
  const activeCardLayout = normalizeCardLayout(previewTheme.card_layout)
  const spacing = previewTheme.ui_density === 'compact' ? '14px' : previewTheme.ui_density === 'spacious' ? '24px' : '18px'
  const heroPadding = previewTheme.ui_density === 'compact' ? '20px' : previewTheme.ui_density === 'spacious' ? '32px' : '26px'
  const storeName = store.name?.trim() || 'Tu tienda'
  const previewProducts =
    activeCardLayout === 'compact'
      ? ['Producto estrella', 'Nuevo ingreso']
      : ['Producto estrella', 'Nuevo ingreso', 'Favorito de hoy']

  return (
    <div
      className="preview-live overflow-hidden rounded-[24px] border border-white/8"
      style={{ ...previewVars, background: 'var(--store-bg-gradient)' }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-nav-bg)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-8 items-center justify-center rounded-[10px] text-xs font-black"
            style={{
              background: 'linear-gradient(145deg, var(--store-primary), var(--store-accent))',
              color: 'var(--store-primary-contrast)',
            }}
          >
            {storeName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="store-heading text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
              {storeName}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--store-muted-text)' }}>
              Venta por WhatsApp
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-[var(--store-button-radius)] px-3 py-1.5 text-[11px] font-semibold"
          style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}
        >
          Comprar
        </button>
      </div>

      <div
        className="border-b"
        style={{
          padding: heroPadding,
          borderColor: 'var(--store-card-border)',
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--store-accent) 13%, transparent), transparent 48%), radial-gradient(circle at left 72%, color-mix(in srgb, var(--store-secondary) 12%, transparent), transparent 42%), var(--store-bg-gradient)',
        }}
      >
        <span
          className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: 'var(--store-secondary)',
            backgroundColor: 'color-mix(in srgb, var(--store-secondary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)',
          }}
        >
          Catalogo listo
        </span>
        <h4 className="store-heading mt-3 text-[1.9rem] leading-tight" style={{ color: 'var(--store-text)' }}>
          Una tienda clara se siente mejor desde el primer vistazo.
        </h4>
        <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
          Elige una base premium, afina algunos detalles y queda lista para compartir sin perderte
          en controles innecesarios.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-[var(--store-button-radius)] px-4 py-2 text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 76%, black 24%))',
              color: 'var(--store-primary-contrast)',
            }}
          >
            Ver catalogo
          </button>
          <button
            type="button"
            className="rounded-[var(--store-button-radius)] border px-4 py-2 text-sm font-medium"
            style={{ borderColor: 'var(--store-border-strong)', color: 'var(--store-text)' }}
          >
            WhatsApp
          </button>
        </div>
      </div>

      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--store-card-border)' }}>
        <div className="flex flex-wrap gap-2">
          {[
            `Tipografia: ${FONT_PRESETS.find((preset) => preset.value === previewTheme.font_preset)?.label ?? 'Actual'}`,
            `Densidad: ${DENSITY_OPTIONS.find((option) => option.value === previewTheme.ui_density)?.label ?? 'Balanceado'}`,
            `Tarjetas: ${CARD_LAYOUT_OPTIONS.find((option) => option.value === activeCardLayout)?.label ?? 'Clasicas'}`,
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{
                borderColor: 'var(--store-card-border)',
                background: 'color-mix(in srgb, var(--store-surface) 76%, transparent)',
                color: 'var(--store-muted-text)',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 py-4" style={{ background: 'var(--store-bg-gradient)' }}>
        {activeCardLayout === 'compact' ? (
          <div className="space-y-3">
            {previewProducts.map((product) => (
              <CompactPreviewCard key={product} label={product} spacing={spacing} />
            ))}
          </div>
        ) : (
          <div className={cn('grid gap-3', activeCardLayout === 'visual' ? 'grid-cols-2' : 'grid-cols-3')}>
            {previewProducts.map((product) => (
              <GridPreviewCard
                key={product}
                label={product}
                layout={activeCardLayout}
                spacing={spacing}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className="border-t px-4 py-3.5"
        style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-footer-bg-gradient)' }}
      >
        <div className="flex items-center justify-between">
          <p className="store-heading text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
            {storeName}
          </p>
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full" style={{ backgroundColor: 'var(--store-primary)' }} />
            <div className="size-2 rounded-full" style={{ backgroundColor: 'var(--store-accent)' }} />
            <div className="size-2 rounded-full" style={{ backgroundColor: 'var(--store-secondary)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompactPreviewCard({
  label,
  spacing,
}: {
  label: string
  spacing: string
}) {
  return (
    <div
      className="flex items-center gap-3 overflow-hidden rounded-[var(--store-card-radius)] border"
      style={{
        padding: spacing,
        borderColor: 'var(--store-card-border)',
        background: 'var(--store-card-background)',
        boxShadow: 'var(--store-card-shadow)',
      }}
    >
      <div
        className="aspect-square w-[36%] shrink-0 rounded-[14px]"
        style={{
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 22%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))',
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="store-heading truncate text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
          {label}
        </p>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>
          Mas directo, mas corto y con mas productos por pantalla.
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--store-primary)' }}>
          $24.900
        </p>
      </div>
    </div>
  )
}

function GridPreviewCard({
  label,
  layout,
  spacing,
}: {
  label: string
  layout: string
  spacing: string
}) {
  if (layout === 'visual') {
    return (
      <div
        className="relative overflow-hidden rounded-[var(--store-card-radius)] border"
        style={{
          borderColor: 'var(--store-card-border)',
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 22%, transparent), color-mix(in srgb, var(--store-secondary) 18%, transparent))',
          minHeight: 210,
          boxShadow: 'var(--store-card-shadow)',
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 p-4"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
        >
          <p className="store-heading text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs text-white/70">$24.900</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-[var(--store-card-radius)] border"
      style={{
        borderColor: 'var(--store-card-border)',
        background: 'var(--store-card-background)',
        boxShadow: 'var(--store-card-shadow)',
      }}
    >
      <div
        className="aspect-[4/5] w-full"
        style={{
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 22%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))',
        }}
      />
      <div style={{ padding: spacing }}>
        <p className="store-heading text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
          {label}
        </p>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>
          Una tarjeta facil de recorrer y lista para vender.
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--store-primary)' }}>
          $24.900
        </p>
      </div>
    </div>
  )
}

function matchPreset(theme: StoreTheme) {
  return (
    THEME_PRESETS.find((preset) =>
      Object.entries(preset.theme).every(([rawKey, rawValue]) => {
        const key = rawKey as keyof ThemePreset['theme']
        return theme[key as keyof StoreTheme] === rawValue
      }),
    )?.id ?? null
  )
}
