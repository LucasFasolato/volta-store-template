'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { FormFeedback } from '@/components/common/FormFeedback'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { COPY } from '@/data/system-copy'
import { updateStoreConfig, uploadLogo } from '@/lib/actions/store'
import { sanitizeInstagramHandle } from '@/lib/utils/format'
import { storeConfigSchema, type StoreConfigInput } from '@/lib/validations/store'
import type { Store } from '@/types/store'

type ConfigFormProps = {
  store: Store
}

export function ConfigForm({ store }: ConfigFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StoreConfigInput>({
    resolver: zodResolver(storeConfigSchema),
    defaultValues: {
      name: store.name,
      whatsapp: store.whatsapp,
      instagram: store.instagram ?? '',
      address: store.address ?? '',
      hours: store.hours ?? '',
    },
  })

  async function onSubmit(data: StoreConfigInput) {
    setSubmitError(null)

    const result = await updateStoreConfig({
      ...data,
      instagram: sanitizeInstagramHandle(data.instagram ?? ''),
    })

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }

    setSaved(true)
    toast.success('Configuracion actualizada.')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
        <h3 className="text-base font-semibold text-white">Logo del negocio</h3>
        <p className="mt-1 text-sm leading-6 text-neutral-400">
          Se muestra en la navegacion de la tienda. Recomendado: fondo transparente y formato cuadrado.
        </p>
        <div className="mt-5">
          <ImageUpload
            currentUrl={store.logo_url}
            onUpload={uploadLogo}
            fieldName="logo"
            aspectHint="1:1"
            label="Subir logo"
            className="max-w-[220px]"
          />
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="surface-panel premium-ring space-y-6 rounded-[28px] px-5 py-6 sm:px-6">
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Nombre del negocio *</Label>
            <Input
              {...register('name')}
              placeholder="Ej: Atelier Norte"
              aria-invalid={!!errors.name}
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
            {errors.name ? <p className="mt-1.5 text-xs text-red-300">{errors.name.message}</p> : null}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Numero de WhatsApp *</Label>
            <p className="mb-2 text-xs text-neutral-500">
              Este numero recibe los pedidos. Incluye codigo de pais y sin caracteres especiales extra.
            </p>
            <Input
              {...register('whatsapp')}
              placeholder="+5491112345678"
              aria-invalid={!!errors.whatsapp}
              className="h-11 rounded-2xl border-white/10 bg-white/5 font-mono text-white placeholder:text-neutral-500"
            />
            {errors.whatsapp ? (
              <p className="mt-1.5 text-xs text-red-300">{errors.whatsapp.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-neutral-500">Ejemplo correcto: +5491112345678</p>
            )}
          </div>
        </div>

        <Separator className="bg-white/8" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Instagram</Label>
            <Input
              {...register('instagram', {
                onBlur: (event) => setValue('instagram', sanitizeInstagramHandle(event.target.value)),
              })}
              placeholder="ateliernorte"
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Horarios</Label>
            <Input
              {...register('hours')}
              placeholder="Lun a Vie 9 a 18 hs"
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-sm font-medium text-neutral-200">Direccion</Label>
          <Input
            {...register('address')}
            placeholder="Av. Corrientes 1234, CABA"
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">URL publica</p>
          <p className="mt-2 break-all text-sm font-medium text-emerald-300">
            {process.env.NEXT_PUBLIC_APP_URL ?? 'https://tu-app.com'}/tienda/{store.slug}
          </p>
          <p className="mt-2 text-xs text-neutral-500">El slug es fijo para mantener los enlaces estables.</p>
        </div>

        {submitError ? <FormFeedback kind="error" message={submitError} /> : null}

        <div className="flex justify-end pt-1">
          <SaveButton isLoading={isSubmitting} isSaved={saved} />
        </div>
      </form>
    </div>
  )
}
