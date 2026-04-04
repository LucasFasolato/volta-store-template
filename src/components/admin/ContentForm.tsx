'use client'

import { useState } from 'react'
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
import type { Store, StoreContent } from '@/types/store'

type ContentFormProps = {
  content: StoreContent
  store: Store
}

export function ContentForm({ content, store }: ContentFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreContentInput>({
    resolver: zodResolver(storeContentSchema),
    defaultValues: {
      hero_title: content.hero_title,
      hero_subtitle: content.hero_subtitle,
      support_text: content.support_text,
    },
  })

  const heroTitle = useWatch({ control, name: 'hero_title' }) ?? ''
  const heroSubtitle = useWatch({ control, name: 'hero_subtitle' }) ?? ''
  const supportText = useWatch({ control, name: 'support_text' }) ?? ''

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
    toast.success('Contenido actualizado.')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="admin-surface rounded-[30px] p-5">
            <p className="admin-label">Visual principal</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">Hero image</h3>
              <span className="rounded-full border border-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {store.slug}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Imagen contenida, con altura controlada y sin ocupar toda la pantalla.
            </p>
            <div className="mt-5">
              <ImageUpload
                currentUrl={content.hero_image_url}
                onUpload={uploadHeroImage}
                fieldName="hero"
                aspectHint="16:9"
                label="Subir imagen de hero"
                className="max-w-none"
              />
            </div>
          </div>
        </div>

        <div className="admin-surface rounded-[30px] p-6">
          <div className="mb-6">
            <p className="admin-label">Copy comercial</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Editor de contenido</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Inputs claros y un layout mas parecido a un editor que a un formulario largo.
            </p>
          </div>

          <div className="space-y-6">
            <FieldBlock label="Titulo del hero" current={heroTitle.length} max={CONTENT_LIMITS.hero_title}>
              <Input
                {...register('hero_title')}
                placeholder="Nueva coleccion disponible"
                aria-invalid={!!errors.hero_title}
                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                maxLength={CONTENT_LIMITS.hero_title}
              />
              {errors.hero_title ? <p className="mt-1.5 text-xs text-red-300">{errors.hero_title.message}</p> : null}
            </FieldBlock>

            <FieldBlock label="Subtitulo" current={heroSubtitle.length} max={CONTENT_LIMITS.hero_subtitle}>
              <Textarea
                {...register('hero_subtitle')}
                placeholder="Descubri piezas seleccionadas para comprar facil, rapido y con atencion personal."
                aria-invalid={!!errors.hero_subtitle}
                className="min-h-32 rounded-[24px] border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                maxLength={CONTENT_LIMITS.hero_subtitle}
              />
              {errors.hero_subtitle ? <p className="mt-1.5 text-xs text-red-300">{errors.hero_subtitle.message}</p> : null}
            </FieldBlock>

            <FieldBlock label="Texto de soporte" current={supportText.length} max={CONTENT_LIMITS.support_text}>
              <Input
                {...register('support_text')}
                placeholder="Pedidos por WhatsApp · Envio o retiro"
                aria-invalid={!!errors.support_text}
                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                maxLength={CONTENT_LIMITS.support_text}
              />
              {errors.support_text ? <p className="mt-1.5 text-xs text-red-300">{errors.support_text.message}</p> : null}
            </FieldBlock>

            <div className="admin-surface-muted rounded-[24px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Copy del sistema</p>
              <div className="mt-3 grid gap-2 text-sm text-neutral-300 sm:grid-cols-2">
                {[
                  COPY.cart.addToCart,
                  COPY.cart.checkout,
                  COPY.cart.continueShopping,
                  COPY.product.featured,
                  COPY.cart.title,
                  COPY.product.viewProduct,
                ].map((text) => (
                  <p key={text}>· {text}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar el contenido" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Contenido guardado" message="La tienda publica ya puede reflejar este nuevo mensaje." /> : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar contenido" />
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="text-sm font-medium text-neutral-200">{label}</Label>
        <CharCounter current={current} max={max} />
      </div>
      {children}
    </div>
  )
}
