'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Copy, Link2, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { FormFeedback } from '@/components/common/FormFeedback'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COPY } from '@/data/system-copy'
import {
  checkStoreSlugAvailability,
  updateStoreConfig,
  uploadLogo,
} from '@/lib/actions/store'
import { sanitizeInstagramHandle, slugify } from '@/lib/utils/format'
import { storeConfigSchema, type StoreConfigInput } from '@/lib/validations/store'
import type { Store } from '@/types/store'

type ConfigFormProps = {
  store: Store
}

type SlugStatus =
  | { tone: 'idle'; message: string }
  | { tone: 'checking'; message: string }
  | { tone: 'available'; message: string }
  | { tone: 'current'; message: string }
  | { tone: 'error'; message: string }

export function ConfigForm({ store }: ConfigFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentSlug, setCurrentSlug] = useState(store.slug)
  const [copied, setCopied] = useState(false)
  const [slugAvailability, setSlugAvailability] = useState<{
    slug: string
    available: boolean
    message: string
  } | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tu-app.com'

  const {
    handleSubmit,
    register,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreConfigInput>({
    resolver: zodResolver(storeConfigSchema),
    defaultValues: {
      name: store.name,
      slug: store.slug,
      whatsapp: store.whatsapp,
      instagram: store.instagram ?? '',
      address: store.address ?? '',
      hours: store.hours ?? '',
    },
  })

  const watchedSlug = useWatch({ control, name: 'slug' }) ?? currentSlug
  const normalizedSlug = slugify(watchedSlug).slice(0, 48)
  const publicUrl = `${baseUrl}/tienda/${normalizedSlug || currentSlug}`
  const slugChanged = normalizedSlug !== currentSlug

  useEffect(() => {
    const candidate = slugify(watchedSlug).slice(0, 48)

    if (!candidate || candidate === currentSlug) return

    const timeoutId = window.setTimeout(async () => {
      const result = await checkStoreSlugAvailability(candidate)
      setSlugAvailability({
        slug: candidate,
        available: result.available,
        message: result.message,
      })
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [watchedSlug, currentSlug])

  const slugStatus: SlugStatus =
    !normalizedSlug
      ? { tone: 'error', message: 'El enlace publico necesita al menos 3 caracteres.' }
      : normalizedSlug === currentSlug
        ? { tone: 'current', message: 'Estas usando el enlace actual de tu tienda.' }
        : slugAvailability?.slug === normalizedSlug
          ? {
              tone: slugAvailability.available ? 'available' : 'error',
              message: slugAvailability.message,
            }
          : { tone: 'checking', message: 'Validando disponibilidad del enlace...' }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('URL copiada.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('No pudimos copiar la URL.')
    }
  }

  async function onSubmit(data: StoreConfigInput) {
    setSubmitError(null)

    const nextSlug = slugify(data.slug).slice(0, 48)

    const result = await updateStoreConfig({
      ...data,
      slug: nextSlug,
      instagram: sanitizeInstagramHandle(data.instagram ?? ''),
    })

    if (result?.error) {
      const slugError = result.error.fieldErrors?.slug?.[0]
      if (slugError) {
        setError('slug', { type: 'server', message: slugError })
        setSlugAvailability({ slug: nextSlug, available: false, message: slugError })
      }

      const message =
        slugError ??
        result.error.formErrors?.[0] ??
        COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }

    setCurrentSlug(nextSlug)
    setValue('slug', nextSlug, { shouldDirty: false })
    setSlugAvailability(null)
    setSaved(true)
    toast.success('Configuracion actualizada.')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="admin-surface rounded-xl p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard label="URL publica" value={`${baseUrl}/tienda/${currentSlug}`} />
          <InfoCard label="WhatsApp" value={store.whatsapp || 'Pendiente'} />
          <InfoCard label="Instagram" value={store.instagram ? `@${store.instagram}` : 'Opcional'} />
        </div>
      </section>

      <section className="admin-surface rounded-xl p-6">
        <SectionIntro
          eyebrow="Seccion 1"
          title="Lo esencial para que tu tienda funcione"
          description="Nombre, logo y URL en un solo lugar para que tu marca sea clara desde el primer vistazo."
        />

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="admin-surface-muted rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white">Logo</h4>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Recomendado: fondo transparente, buen contraste y formato cuadrado.
            </p>
            <div className="mt-5 max-w-[220px]">
              <ImageUpload
                currentUrl={store.logo_url}
                onUpload={uploadLogo}
                fieldName="logo"
                aspectHint="1:1"
                label="Subir logo"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="mb-2 block text-sm font-medium text-neutral-200">Nombre del negocio *</Label>
              <Input
                {...register('name')}
                placeholder="Ej: Atelier Norte"
                aria-invalid={!!errors.name}
                className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
              />
              {errors.name ? <p className="mt-1.5 text-xs text-red-300">{errors.name.message}</p> : null}
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-neutral-200">URL publica *</Label>
              <p className="mb-2 text-xs leading-5 text-neutral-500">
                Usa minusculas, numeros y guiones. Si ya la compartiste, mejor no cambiarla seguido.
              </p>
              <Input
                {...register('slug', {
                  onBlur: (event) =>
                    setValue('slug', slugify(event.target.value).slice(0, 48), { shouldDirty: true }),
                })}
                placeholder="atelier-norte"
                aria-invalid={!!errors.slug || slugStatus.tone === 'error'}
                className="h-12 rounded-md border-white/10 bg-white/5 font-mono text-white placeholder:text-neutral-500"
              />
              {errors.slug ? <p className="mt-1.5 text-xs text-red-300">{errors.slug.message}</p> : null}
            </div>

            <div className="rounded-xl border border-white/8 bg-black/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Asi se ve tu enlace
                  </p>
                  <p className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-emerald-300 sm:whitespace-normal sm:[word-break:break-word]">
                    {publicUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="admin-button-soft inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm text-white"
                >
                  <Copy className="size-4" />
                  {copied ? 'Copiada' : 'Copiar'}
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-white/8 bg-white/4 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Link2 className="size-4 text-emerald-300" />
                  {slugStatus.message}
                  <span className="ml-auto">
                    {slugStatus.tone === 'checking' ? (
                      <Loader2 className="size-4 animate-spin text-emerald-200" />
                    ) : slugStatus.tone === 'error' ? (
                      <TriangleAlert className="size-4 text-amber-200" />
                    ) : (
                      <CheckCircle2 className="size-4 text-emerald-200" />
                    )}
                  </span>
                </div>
                {slugChanged ? (
                  <p className="mt-2 text-xs leading-5 text-amber-100/80">
                    Si guardas este cambio, los links compartidos con el slug anterior pueden dejar de funcionar.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-surface rounded-xl p-6">
        <SectionIntro
          eyebrow="Seccion 2"
          title="Como te encuentran y te escriben"
          description="Estos canales aparecen en la tienda y ayudan a que el pedido llegue mas rapido."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">WhatsApp *</Label>
            <p className="mb-2 text-xs text-neutral-500">
              Este numero recibe los pedidos. Incluye codigo de pais y evita caracteres extra.
            </p>
            <Input
              {...register('whatsapp')}
              placeholder="+5491112345678"
              aria-invalid={!!errors.whatsapp}
              className="h-12 rounded-md border-white/10 bg-white/5 font-mono text-white placeholder:text-neutral-500"
            />
            {errors.whatsapp ? (
              <p className="mt-1.5 text-xs text-red-300">{errors.whatsapp.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-neutral-500">Ejemplo correcto: +5491112345678</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Instagram</Label>
            <p className="mb-2 text-xs text-neutral-500">Opcional, pero suma marca y confianza social.</p>
            <Input
              {...register('instagram', {
                onBlur: (event) => setValue('instagram', sanitizeInstagramHandle(event.target.value)),
              })}
              placeholder="ateliernorte"
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>
        </div>
      </section>

      <section className="admin-surface rounded-xl p-6">
        <SectionIntro
          eyebrow="Seccion 3"
          title="Informacion que ayuda a comprar"
          description="Horarios, punto de retiro y una base preparada para sumar envios cuando quieras."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.9fr]">
          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Horarios</Label>
            <Input
              {...register('hours')}
              placeholder="Lun a Vie 9 a 18 hs"
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Punto de retiro / direccion</Label>
            <Input
              {...register('address')}
              placeholder="Av. Corrientes 1234, CABA"
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>

          <div className="rounded-xl border border-dashed border-white/10 bg-white/4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Preparado para envios
            </p>
            <p className="mt-3 text-sm font-medium text-white">Proximo paso</p>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Dejamos este bloque listo para sumar zonas, costos o tiempos de entrega mas adelante.
            </p>
          </div>
        </div>
      </section>

      {submitError ? (
        <FormFeedback kind="error" title="No pudimos guardar la configuracion" message={submitError} />
      ) : null}
      {!submitError && saved ? (
        <FormFeedback
          kind="success"
          title="Configuracion guardada"
          message="La tienda publica ya puede reflejar estos datos actualizados."
        />
      ) : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar configuracion" />
      </div>
    </form>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-6">
      <p className="admin-label">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-surface-muted rounded-xl px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-100">{value}</p>
    </div>
  )
}
