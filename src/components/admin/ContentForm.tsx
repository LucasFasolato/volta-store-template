'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { CharCounter } from '@/components/common/CharCounter'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CONTENT_LIMITS } from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import { updateHeroContent } from '@/lib/actions/hero-content'
import { uploadHeroImage } from '@/lib/actions/store'
import { storeContentSchema, type StoreContentInput } from '@/lib/validations/store'
import { cn } from '@/lib/utils'
import type { BannerMode, BannerSpeed, HeroImageLayout, Store, StoreContent } from '@/types/store'

type ContentFormProps = {
  content: StoreContent
  store: Store
}

const BANNER_MODE_OPTIONS: Array<{ value: BannerMode; title: string }> = [
  { value: 'static', title: 'Fijo' },
  { value: 'animated', title: 'En movimiento' },
]

const BANNER_SPEED_OPTIONS: Array<{ value: BannerSpeed; label: string; duration: string }> = [
  { value: 'slow', label: 'Lento', duration: '28s' },
  { value: 'normal', label: 'Normal', duration: '20s' },
  { value: 'fast', label: 'Rápido', duration: '14s' },
]

const HERO_LAYOUT_OPTIONS: Array<{
  value: HeroImageLayout
  title: string
  description: string
}> = [
  {
    value: 'side',
    title: 'A un costado',
    description: 'Texto e imagen separados. La opción más limpia y directa.',
  },
  {
    value: 'background',
    title: 'De fondo',
    description: 'La imagen ocupa toda la portada y el texto queda por encima.',
  },
]

export function ContentForm({ content, store }: ContentFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StoreContentInput>({
    resolver: zodResolver(storeContentSchema),
    defaultValues: {
      banner_mode: content.banner_mode === 'animated' ? 'animated' : 'static',
      banner_speed:
        content.banner_speed === 'slow' || content.banner_speed === 'fast'
          ? content.banner_speed
          : 'normal',
      hero_image_layout: content.hero_image_layout === 'background' ? 'background' : 'side',
      hero_overlay_opacity:
        typeof content.hero_overlay_opacity === 'number' ? content.hero_overlay_opacity : 55,
      hero_title: content.hero_title,
      hero_subtitle: content.hero_subtitle,
      support_text: content.support_text,
    },
  })

  const heroTitle = useWatch({ control, name: 'hero_title' }) ?? ''
  const heroSubtitle = useWatch({ control, name: 'hero_subtitle' }) ?? ''
  const supportText = useWatch({ control, name: 'support_text' }) ?? ''
  const bannerMode = (useWatch({ control, name: 'banner_mode' }) ?? 'static') as BannerMode
  const bannerSpeed = (useWatch({ control, name: 'banner_speed' }) ?? 'normal') as BannerSpeed
  const heroImageLayout = (useWatch({ control, name: 'hero_image_layout' }) ?? 'side') as HeroImageLayout
  const heroOverlayOpacity = useWatch({ control, name: 'hero_overlay_opacity' }) ?? 55

  const bannerPreviewItems = useMemo(() => buildBannerPreviewItems(store), [store])
  const activeSpeed = BANNER_SPEED_OPTIONS.find((option) => option.value === bannerSpeed) ?? BANNER_SPEED_OPTIONS[1]

  async function onSubmit(data: StoreContentInput) {
    setSubmitError(null)
    const result = await updateHeroContent(data)
    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }
    setSaved(true)
    toast.success('Portada actualizada.')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] xl:items-start">
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="admin-surface rounded-xl p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">Imagen principal</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Subí una sola imagen y elegí abajo cómo querés usarla.</p>
            <div className="mt-3">
              <ImageUpload
                currentUrl={content.hero_image_url}
                onUpload={uploadHeroImage}
                fieldName="hero"
                aspectHint="16:9"
                label="Elegir imagen"
                className="max-w-none"
              />
            </div>
          </section>

          <section className="admin-surface rounded-xl p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">Cómo usar la imagen</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Dos opciones claras. Podés cambiar entre ellas cuando quieras.</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {HERO_LAYOUT_OPTIONS.map((option) => {
                const active = heroImageLayout === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('hero_image_layout', option.value, { shouldDirty: true })}
                    className={cn(
                      'rounded-[11px] border p-3 text-left transition',
                      active
                        ? 'border-[#12e89a]/60 bg-emerald-50 dark:bg-emerald-400/10'
                        : 'border-black/8 bg-slate-50 hover:border-black/15 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20',
                    )}
                    aria-pressed={active}
                  >
                    <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                    <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">{option.description}</span>
                  </button>
                )
              })}
            </div>

            {heroImageLayout === 'background' ? (
              <div className="mt-4 rounded-[11px] border border-black/7 bg-slate-50 p-3 dark:border-white/8 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Legibilidad del texto</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">Subilo si la foto compite demasiado con el título.</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm dark:bg-white/8">{heroOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  step={5}
                  value={heroOverlayOpacity}
                  onChange={(event) => setValue('hero_overlay_opacity', Number(event.target.value), { shouldDirty: true })}
                  className="mt-3 w-full accent-[#12e89a]"
                  aria-label="Legibilidad de la imagen de fondo"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>Más foto</span><span>Más contraste</span></div>
              </div>
            ) : null}
          </section>
        </div>

        <section className="admin-surface rounded-xl p-4 sm:p-5 lg:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold text-foreground">Texto de la portada</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Mantenelo corto: el objetivo es que se entienda qué vendés en segundos.</p>
          </div>
          <div className="space-y-5">
            <FieldBlock label="Qué vendés" current={heroTitle.length} max={CONTENT_LIMITS.hero_title}>
              <Input
                {...register('hero_title')}
                placeholder="Ej: Tortas y cosas ricas"
                aria-invalid={!!errors.hero_title}
                className="h-11 rounded-md bg-white dark:bg-white/5"
                maxLength={CONTENT_LIMITS.hero_title}
              />
              {errors.hero_title ? <FieldError>{errors.hero_title.message}</FieldError> : null}
            </FieldBlock>

            <FieldBlock label="Una frase corta" current={heroSubtitle.length} max={CONTENT_LIMITS.hero_subtitle}>
              <Textarea
                {...register('hero_subtitle')}
                placeholder="Ej: Pedidos con 48 hs de anticipación"
                aria-invalid={!!errors.hero_subtitle}
                className="min-h-20 rounded-md bg-white dark:bg-white/5"
                maxLength={CONTENT_LIMITS.hero_subtitle}
              />
              {errors.hero_subtitle ? <FieldError>{errors.hero_subtitle.message}</FieldError> : null}
            </FieldBlock>

            <FieldBlock
              label="Texto extra (opcional)"
              hint="Un dato propio que quieras destacar arriba del título."
              current={supportText.length}
              max={CONTENT_LIMITS.support_text}
            >
              <Input
                {...register('support_text')}
                placeholder="Ej: Hecho por encargo · Envíos a todo el país"
                aria-invalid={!!errors.support_text}
                className="h-11 rounded-md bg-white dark:bg-white/5"
                maxLength={CONTENT_LIMITS.support_text}
              />
              {errors.support_text ? <FieldError>{errors.support_text.message}</FieldError> : null}
            </FieldBlock>
          </div>
        </section>
      </section>

      <details className="group rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-foreground sm:px-5">
          Más opciones de portada
          <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-black/7 p-4 dark:border-white/8 sm:p-5">
          <p className="text-sm font-semibold text-foreground">Mensajes debajo de la portada</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">VOLTA los arma con los datos de tu negocio. Solo elegí cómo querés mostrarlos.</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {BANNER_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('banner_mode', option.value, { shouldDirty: true })}
                className={cn(
                  'min-h-11 rounded-[10px] border px-3 text-sm font-medium text-foreground',
                  bannerMode === option.value
                    ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10'
                    : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]',
                )}
              >
                {option.title}
              </button>
            ))}
          </div>

          {bannerMode === 'animated' ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Velocidad</p>
              <div className="grid grid-cols-3 gap-2">
                {BANNER_SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('banner_speed', option.value, { shouldDirty: true })}
                    className={cn(
                      'min-h-10 rounded-[9px] border px-2 text-xs font-medium text-foreground',
                      bannerSpeed === option.value
                        ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10'
                        : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-[10px] border border-black/8 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            {bannerMode === 'animated' ? (
              <div className="store-marquee-track" style={{ ['--marquee-duration' as string]: activeSpeed.duration }}>
                <BannerPreviewGroup items={bannerPreviewItems} />
                <BannerPreviewGroup items={bannerPreviewItems} ariaHidden />
              </div>
            ) : (
              <BannerPreviewGroup items={bannerPreviewItems} staticLayout />
            )}
          </div>
        </div>
      </details>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar la portada" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Portada guardada" message="Tu tienda ya refleja los cambios." /> : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar portada" />
      </div>
    </form>
  )
}

function FieldBlock({
  label,
  hint,
  current,
  max,
  children,
}: {
  label: string
  hint?: string
  current: number
  max: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          {hint ? <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
        </div>
        <CharCounter current={current} max={max} />
      </div>
      {children}
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-red-500">{children}</p>
}

function BannerPreviewGroup({
  items,
  ariaHidden = false,
  staticLayout = false,
}: {
  items: string[]
  ariaHidden?: boolean
  staticLayout?: boolean
}) {
  return (
    <div aria-hidden={ariaHidden} className={cn('flex shrink-0 items-center gap-2', staticLayout ? 'flex-wrap justify-start' : 'pr-2')}>
      {items.map((item, index) => (
        <span
          key={`${item}-${index}-${ariaHidden ? 'ghost' : 'main'}`}
          className="inline-flex whitespace-nowrap rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function buildBannerPreviewItems(store: Store) {
  const items = [
    store.whatsapp ? 'Atención por WhatsApp' : 'Respuesta rápida',
    store.hours || null,
    store.address || null,
  ].filter(Boolean) as string[]

  return items.filter((item, index, collection) => collection.indexOf(item) === index)
}
