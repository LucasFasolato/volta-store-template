'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { updateStoreContent, uploadHeroImage } from '@/lib/actions/store'
import { storeContentSchema, type StoreContentInput } from '@/lib/validations/store'
import { cn } from '@/lib/utils'
import type { BannerMode, BannerSpeed, Store, StoreContent } from '@/types/store'

type ContentFormProps = {
  content: StoreContent
  store: Store
}

const BANNER_MODE_OPTIONS: Array<{
  value: BannerMode
  title: string
  description: string
}> = [
  {
    value: 'static',
    title: 'Estatico',
    description: 'Muestra los mensajes fijos para lectura inmediata.',
  },
  {
    value: 'animated',
    title: 'Animado',
    description: 'Hace scroll horizontal continuo para sumar dinamismo visual.',
  },
]

const BANNER_SPEED_OPTIONS: Array<{
  value: BannerSpeed
  label: string
  duration: string
}> = [
  { value: 'slow', label: 'Slow', duration: '28s' },
  { value: 'normal', label: 'Normal', duration: '20s' },
  { value: 'fast', label: 'Fast', duration: '14s' },
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

  const bannerPreviewItems = useMemo(() => buildBannerPreviewItems(store), [store])
  const activeSpeed =
    BANNER_SPEED_OPTIONS.find((option) => option.value === bannerSpeed) ?? BANNER_SPEED_OPTIONS[1]

  async function onSubmit(data: StoreContentInput) {
    setSubmitError(null)
    const result = await updateStoreContent(data)

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-6 xl:self-start">
          <section className="admin-surface rounded-xl p-4 sm:p-5">
            <p className="admin-label">Imagen principal</p>
            <div className="mt-3">
              <ImageUpload
                currentUrl={content.hero_image_url}
                onUpload={uploadHeroImage}
                fieldName="hero"
                aspectHint="16:9"
                label="Subir imagen"
                className="max-w-none"
              />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="admin-surface rounded-xl p-4 sm:p-5">
            <div className="mb-4">
              <p className="admin-label">Contenido</p>
            </div>

            <div className="space-y-4">
              <FieldBlock
                label="Etiqueta (opcional)"
                current={supportText.length}
                max={CONTENT_LIMITS.support_text}
              >
                <Input
                  {...register('support_text')}
                  placeholder="Pedidos por WhatsApp / Envio o retiro"
                  aria-invalid={!!errors.support_text}
                  className="h-11 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                  maxLength={CONTENT_LIMITS.support_text}
                />
                {errors.support_text ? (
                  <p className="mt-1.5 text-xs text-red-300">{errors.support_text.message}</p>
                ) : null}
              </FieldBlock>

              <FieldBlock
                label="Titulo principal"
                current={heroTitle.length}
                max={CONTENT_LIMITS.hero_title}
              >
                <Input
                  {...register('hero_title')}
                  placeholder="Nueva coleccion disponible"
                  aria-invalid={!!errors.hero_title}
                  className="h-11 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                  maxLength={CONTENT_LIMITS.hero_title}
                />
                {errors.hero_title ? (
                  <p className="mt-1.5 text-xs text-red-300">{errors.hero_title.message}</p>
                ) : null}
              </FieldBlock>

              <FieldBlock
                label="Subtitulo"
                current={heroSubtitle.length}
                max={CONTENT_LIMITS.hero_subtitle}
              >
                <Textarea
                  {...register('hero_subtitle')}
                  placeholder="Explica rapido que vendes y por que es facil comprarte."
                  aria-invalid={!!errors.hero_subtitle}
                  className="min-h-24 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                  maxLength={CONTENT_LIMITS.hero_subtitle}
                />
                {errors.hero_subtitle ? (
                  <p className="mt-1.5 text-xs text-red-300">{errors.hero_subtitle.message}</p>
                ) : null}
              </FieldBlock>
            </div>
          </section>

          <section className="admin-surface rounded-xl p-6">
            <div className="mb-6">
              <p className="admin-label">Banner inferior</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Mensajes de confianza con opcion estatica o animada
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                El banner usa datos del negocio y frases de compra para reforzar claridad y
                credibilidad.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {BANNER_MODE_OPTIONS.map((option) => {
                const active = bannerMode === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('banner_mode', option.value, { shouldDirty: true })}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition duration-150',
                      active
                        ? 'border-emerald-400/30 bg-emerald-400/10'
                        : 'border-white/8 bg-white/4 hover:border-white/14 hover:bg-white/6',
                    )}
                  >
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        active ? 'text-emerald-200' : 'text-white',
                      )}
                    >
                      {option.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      {option.description}
                    </p>
                  </button>
                )
              })}
            </div>

            {bannerMode === 'animated' ? (
              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-neutral-200">Velocidad</p>
                <div className="flex flex-wrap gap-2">
                  {BANNER_SPEED_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('banner_speed', option.value, { shouldDirty: true })}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        bannerSpeed === option.value
                          ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                          : 'border-white/8 bg-white/4 text-neutral-400 hover:border-white/14 hover:text-white',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-white/8 bg-black/12 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Preview del banner
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {bannerMode === 'animated'
                      ? `Loop continuo de derecha a izquierda en ${activeSpeed.label.toLowerCase()}.`
                      : 'Mensajes fijos, legibles de un vistazo.'}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/8 bg-white/4 px-3 py-3">
                {bannerMode === 'animated' ? (
                  <div
                    className="store-marquee-track"
                    style={{ ['--marquee-duration' as string]: activeSpeed.duration }}
                  >
                    <BannerPreviewGroup items={bannerPreviewItems} />
                    <BannerPreviewGroup items={bannerPreviewItems} ariaHidden />
                  </div>
                ) : (
                  <BannerPreviewGroup items={bannerPreviewItems} staticLayout />
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm font-medium text-white">Que mensajes aparecen ahi</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                WhatsApp, horarios y direccion salen de Configuracion. Los textos de confianza se
                completan solos para mantener la tienda clara.
              </p>
            </div>
          </section>
        </div>
      </section>

      {submitError ? (
        <FormFeedback
          kind="error"
          title="No pudimos guardar la portada"
          message={submitError}
        />
      ) : null}
      {!submitError && saved ? (
        <FormFeedback
          kind="success"
          title="Portada guardada"
          message="La tienda publica ya refleja el nuevo mensaje y el comportamiento del banner."
        />
      ) : null}

      <div className="flex justify-end">
        <SaveButton
          isLoading={isSubmitting}
          isSaved={saved}
          label="Guardar apariencia de portada"
        />
      </div>
    </form>
  )
}

function FieldBlock({
  label,
  current,
  max,
  children,
}: {
  label: string
  current: number
  max: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <Label className="text-sm font-medium text-neutral-200">{label}</Label>
        <CharCounter current={current} max={max} />
      </div>
      {children}
    </div>
  )
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
    <div
      aria-hidden={ariaHidden}
      className={cn(
        'flex shrink-0 items-center gap-2',
        staticLayout ? 'flex-wrap justify-start' : 'pr-2',
      )}
    >
      {items.map((item, index) => (
        <span
          key={`${item}-${index}-${ariaHidden ? 'ghost' : 'main'}`}
          className="inline-flex whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-neutral-100"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function buildBannerPreviewItems(store: Store) {
  const items = [
    store.whatsapp ? 'Atencion por WhatsApp' : 'Respuesta rapida',
    store.hours || 'Horarios a confirmar',
    store.address || 'Retiro o entrega a coordinar',
    'Pedido directo al vendedor',
    'Consultas por envio y retiro',
  ]

  return items.filter((item, index, collection) => collection.indexOf(item) === index)
}
