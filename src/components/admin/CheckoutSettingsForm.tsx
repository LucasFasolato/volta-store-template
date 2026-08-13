'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MessageSquareText, Truck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { Switch } from '@/components/ui/switch'
import { updateCheckoutSettings, type CheckoutSettingsInput } from '@/lib/actions/checkout'
import type { Store } from '@/types/store'

const SETTINGS = [
  {
    name: 'checkout_ask_name' as const,
    title: 'Pedir nombre',
    description: 'Ayuda al negocio a identificar rápido quién está haciendo el pedido.',
    icon: UserRound,
  },
  {
    name: 'checkout_ask_fulfillment' as const,
    title: 'Preguntar retiro o envío',
    description: 'El cliente elige una opción antes de abrir WhatsApp.',
    icon: Truck,
  },
  {
    name: 'checkout_allow_notes' as const,
    title: 'Permitir observaciones',
    description: 'Sirve para aclaraciones simples, sin convertir el pedido en un formulario largo.',
    icon: MessageSquareText,
  },
]

export function CheckoutSettingsForm({ store }: { store: Store }) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CheckoutSettingsInput>({
    defaultValues: {
      checkout_ask_name: store.checkout_ask_name ?? true,
      checkout_ask_fulfillment: store.checkout_ask_fulfillment ?? true,
      checkout_allow_notes: store.checkout_allow_notes ?? true,
    },
  })

  async function onSubmit(data: CheckoutSettingsInput) {
    setSubmitError(null)
    const result = await updateCheckoutSettings(data)

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? 'No pudimos guardar estas opciones.'
      setSubmitError(message)
      toast.error(message)
      return
    }

    setSaved(true)
    toast.success('Forma de pedido actualizada.')
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
        <div className="mb-5 border-b border-black/7 pb-4 dark:border-white/8">
          <p className="admin-label">Pedido por WhatsApp</p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">Pedí solo los datos que realmente necesitás</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Máximo tres decisiones simples antes de abrir WhatsApp.</p>
        </div>

        <div className="space-y-2.5">
          {SETTINGS.map((setting) => {
            const Icon = setting.icon
            return (
              <Controller
                key={setting.name}
                control={control}
                name={setting.name}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-black/7 bg-[#fbfcfd] p-3.5 transition hover:border-black/12 dark:border-white/8 dark:bg-white/[0.025] dark:hover:border-white/14">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/55">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{setting.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{setting.description}</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-1 shrink-0 data-[state=checked]:bg-[#12e89a]" />
                  </label>
                )}
              />
            )
          })}
        </div>
      </section>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Opciones guardadas" message="El próximo pedido ya va a usar esta configuración." /> : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar forma de pedido" />
      </div>
    </form>
  )
}
