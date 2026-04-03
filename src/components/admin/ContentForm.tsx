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
import { Separator } from '@/components/ui/separator'
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

  const heroTitle = useWatch({ control, name: 'hero_title' }) ?? ''
  const heroSubtitle = useWatch({ control, name: 'hero_subtitle' }) ?? ''
  const supportText = useWatch({ control, name: 'support_text' }) ?? ''

  return (
    <div className="space-y-8">
      <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Visual principal</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
              Esta imagen define el tono de la tienda. Conviene que respire bien y deje leer el titulo sin esfuerzo.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Slug {store.slug}</p>
        </div>

        <div className="mt-5">
          <ImageUpload
            currentUrl={content.hero_image_url}
            onUpload={uploadHeroImage}
            fieldName="hero"
            aspectHint="16:9"
            label="Subir imagen de hero"
          />
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="surface-panel premium-ring space-y-6 rounded-[28px] px-5 py-6 sm:px-6">
        <FieldBlock
          label="Titulo del hero"
          hint="Mensaje principal que abre la tienda. Tiene que sonar claro, directo y deseable."
          current={heroTitle.length}
          max={CONTENT_LIMITS.hero_title}
        >
          <Input
            {...register('hero_title')}
            placeholder="Ej: Nueva coleccion disponible"
            aria-invalid={!!errors.hero_title}
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            maxLength={CONTENT_LIMITS.hero_title}
          />
          {errors.hero_title ? <p className="mt-1.5 text-xs text-red-300">{errors.hero_title.message}</p> : null}
        </FieldBlock>

        <Separator className="bg-white/8" />

        <FieldBlock
          label="Subtitulo"
          hint="Complementa el titular con beneficio, tono de marca o propuesta de valor."
          current={heroSubtitle.length}
          max={CONTENT_LIMITS.hero_subtitle}
        >
          <Textarea
            {...register('hero_subtitle')}
            placeholder="Ej: Descubri piezas seleccionadas para comprar facil, rapido y con atencion personal."
            aria-invalid={!!errors.hero_subtitle}
            className="min-h-28 rounded-[24px] border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            maxLength={CONTENT_LIMITS.hero_subtitle}
          />
          {errors.hero_subtitle ? (
            <p className="mt-1.5 text-xs text-red-300">{errors.hero_subtitle.message}</p>
          ) : null}
        </FieldBlock>

        <Separator className="bg-white/8" />

        <FieldBlock
          label="Texto de soporte"
          hint="Ideal para entrega, tiempos, envio o una prueba social corta."
          current={supportText.length}
          max={CONTENT_LIMITS.support_text}
        >
          <Input
            {...register('support_text')}
            placeholder="Ej: Pedidos por WhatsApp · Envio o retiro"
            aria-invalid={!!errors.support_text}
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            maxLength={CONTENT_LIMITS.support_text}
          />
          {errors.support_text ? (
            <p className="mt-1.5 text-xs text-red-300">{errors.support_text.message}</p>
          ) : null}
        </FieldBlock>

        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
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

        {submitError ? <FormFeedback kind="error" message={submitError} /> : null}

        <div className="flex justify-end">
          <SaveButton isLoading={isSubmitting} isSaved={saved} />
        </div>
      </form>
    </div>
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
  hint: string
  current: number
  max: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label className="text-sm font-medium text-neutral-200">{label}</Label>
        <CharCounter current={current} max={max} />
      </div>
      <p className="mb-3 text-xs text-neutral-500">{hint}</p>
      {children}
    </div>
  )
}
