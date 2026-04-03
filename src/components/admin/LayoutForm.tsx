'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { COPY } from '@/data/system-copy'
import { updateStoreLayout } from '@/lib/actions/store'
import { storeLayoutSchema, type StoreLayoutInput } from '@/lib/validations/store'
import type { StoreLayout } from '@/types/store'

type LayoutFormProps = {
  layout: StoreLayout
}

const SECTIONS = [
  {
    name: 'show_hero' as const,
    label: 'Hero principal',
    description: 'Seccion de bienvenida con titulo, imagen y CTA.',
  },
  {
    name: 'show_featured' as const,
    label: 'Destacados',
    description: 'Muestra una seleccion curada al inicio de la tienda.',
  },
  {
    name: 'show_categories' as const,
    label: 'Categorias',
    description: 'Filtros visibles para navegar mas rapido.',
  },
  {
    name: 'show_catalog' as const,
    label: 'Catalogo completo',
    description: 'Grilla principal con todos los productos activos.',
  },
  {
    name: 'show_footer' as const,
    label: 'Footer',
    description: 'Contacto, horarios y accesos directos al cierre de la pagina.',
  },
]

export function LayoutForm({ layout }: LayoutFormProps) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<StoreLayoutInput>({
    resolver: zodResolver(storeLayoutSchema),
    defaultValues: {
      show_hero: layout.show_hero,
      show_featured: layout.show_featured,
      show_categories: layout.show_categories,
      show_catalog: layout.show_catalog,
      show_footer: layout.show_footer,
    },
  })

  async function onSubmit(data: StoreLayoutInput) {
    setSubmitError(null)
    const result = await updateStoreLayout(data)

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }

    setSaved(true)
    toast.success('Layout actualizado.')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <div
              key={section.name}
              className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-4 transition hover:bg-white/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={section.name} className="cursor-pointer text-sm font-medium text-white">
                    {section.label}
                  </Label>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">{section.description}</p>
                </div>

                <Controller
                  control={control}
                  name={section.name}
                  render={({ field }) => (
                    <Switch
                      id={section.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-400"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {submitError ? <FormFeedback kind="error" message={submitError} /> : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} />
      </div>
    </form>
  )
}
