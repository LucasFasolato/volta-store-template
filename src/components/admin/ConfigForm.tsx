'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Copy, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { FormFeedback } from '@/components/common/FormFeedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COPY } from '@/data/system-copy'
import { checkStoreSlugAvailability, updateStoreConfig } from '@/lib/actions/store'
import { sanitizeInstagramHandle, slugify } from '@/lib/utils/format'
import { storeConfigSchema, type StoreConfigInput } from '@/lib/validations/store'
import type { Store } from '@/types/store'

type SlugStatus =
  | { tone: 'idle' | 'checking' | 'available' | 'current' | 'error'; message: string }

export function ConfigForm({ store }: { store: Store }) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentSlug, setCurrentSlug] = useState(store.slug)
  const [copied, setCopied] = useState(false)
  const [slugAvailability, setSlugAvailability] = useState<{ slug: string; available: boolean; message: string } | null>(null)
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://tu-app.com').replace(/\/+$/, '')

  const { handleSubmit, register, setValue, setError, control, formState: { errors, isSubmitting } } = useForm<StoreConfigInput>({
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
      setSlugAvailability({ slug: candidate, available: result.available, message: result.message })
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [watchedSlug, currentSlug])

  const slugStatus: SlugStatus =
    !normalizedSlug
      ? { tone: 'error', message: 'El enlace necesita al menos 3 caracteres.' }
      : normalizedSlug === currentSlug
        ? { tone: 'current', message: 'Este es tu enlace actual.' }
        : slugAvailability?.slug === normalizedSlug
          ? { tone: slugAvailability.available ? 'available' : 'error', message: slugAvailability.message }
          : { tone: 'checking', message: 'Validando disponibilidad…' }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  async function onSubmit(data: StoreConfigInput) {
    setSubmitError(null)
    const nextSlug = slugify(data.slug).slice(0, 48)
    const result = await updateStoreConfig({ ...data, slug: nextSlug, instagram: sanitizeInstagramHandle(data.instagram ?? '') })

    if (result?.error) {
      const slugError = result.error.fieldErrors?.slug?.[0]
      if (slugError) {
        setError('slug', { type: 'server', message: slugError })
        setSlugAvailability({ slug: nextSlug, available: false, message: slugError })
      }
      const message = slugError ?? result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      return
    }

    setCurrentSlug(nextSlug)
    setValue('slug', nextSlug, { shouldDirty: false })
    setSlugAvailability(null)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ConfigSection title="Tienda" description="Lo que identifica a tu negocio.">
        <Field label="Nombre del negocio" error={errors.name?.message}>
          <Input {...register('name')} placeholder="Casa Olivia" className="h-11 rounded-[9px] bg-white dark:bg-white/5" />
        </Field>

        <Field label="Enlace público" hint="Evitá cambiarlo seguido si ya compartiste tu tienda." error={errors.slug?.message}>
          <Input {...register('slug', { onBlur: (event) => setValue('slug', slugify(event.target.value).slice(0, 48), { shouldDirty: true }) })} placeholder="casa-olivia" className="h-11 rounded-[9px] bg-white font-mono text-sm dark:bg-white/5" />
        </Field>

        <div className="rounded-[11px] border border-black/7 bg-[#fbfcfd] p-3 dark:border-white/8 dark:bg-white/[0.025]">
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{publicUrl}</p>
            <button type="button" onClick={copyUrl} className="flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border border-black/8 bg-white px-2.5 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5"><Copy className="size-3.5" />{copied ? 'Copiado' : 'Copiar'}</button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {slugStatus.tone === 'checking' ? <Loader2 className="size-3.5 animate-spin" /> : slugStatus.tone === 'error' ? <TriangleAlert className="size-3.5 text-amber-500" /> : <CheckCircle2 className="size-3.5 text-emerald-500" />}
            <span>{slugStatus.message}</span>
          </div>
          {slugChanged ? <p className="mt-2 text-xs leading-5 text-amber-600 dark:text-amber-300">Los enlaces anteriores podrían dejar de funcionar cuando guardes.</p> : null}
        </div>
      </ConfigSection>

      <ConfigSection title="Pedidos" description="El canal que recibe los pedidos de tus clientes.">
        <Field label="WhatsApp" hint="Incluí código de país. Ejemplo: +5493511234567" error={errors.whatsapp?.message}>
          <Input {...register('whatsapp')} placeholder="+54 9 351 123 4567" className="h-11 rounded-[9px] bg-white font-mono dark:bg-white/5" />
        </Field>
      </ConfigSection>

      <ConfigSection title="Información del negocio" description="Datos opcionales que ayudan a resolver dudas antes del mensaje.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram">
            <Input {...register('instagram', { onBlur: (event) => setValue('instagram', sanitizeInstagramHandle(event.target.value)) })} placeholder="casaolivia" className="h-11 rounded-[9px] bg-white dark:bg-white/5" />
          </Field>
          <Field label="Horarios">
            <Input {...register('hours')} placeholder="Lun a Vie · 9 a 18 hs" className="h-11 rounded-[9px] bg-white dark:bg-white/5" />
          </Field>
        </div>
        <Field label="Dirección / punto de retiro">
          <Input {...register('address')} placeholder="Av. Colón 123, Córdoba" className="h-11 rounded-[9px] bg-white dark:bg-white/5" />
        </Field>
      </ConfigSection>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar los cambios" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Cambios guardados" message="Tu tienda ya refleja la configuración actualizada." /> : null}

      <div className="sticky bottom-[76px] z-20 flex justify-end rounded-[12px] border border-black/8 bg-white/95 p-2.5 shadow-[0_12px_36px_rgba(15,23,42,.08)] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:border-white/10 dark:bg-[#111820]/95 md:dark:bg-transparent">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar cambios" />
      </div>
    </form>
  )
}

function ConfigSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="mb-5 border-b border-black/7 pb-4 dark:border-white/8">
        <h2 className="text-base font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium text-foreground">{label}</Label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-500">{error}</p> : hint ? <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  )
}