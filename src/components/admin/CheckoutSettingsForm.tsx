'use client'

import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { MessageSquareText, Plus, TextCursorInput, Trash2, Truck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { Switch } from '@/components/ui/switch'
import { updateCheckoutSettings, type CheckoutSettingsInput } from '@/lib/actions/checkout'
import type { Store } from '@/types/store'

const SETTINGS = [
  {
    name: 'checkout_ask_name' as const,
    title: 'Nombre del cliente',
    description: 'Para saber quién está haciendo el pedido.',
    icon: UserRound,
  },
  {
    name: 'checkout_ask_fulfillment' as const,
    title: 'Retiro o envío',
    description: 'El cliente elige una opción antes de continuar.',
    icon: Truck,
  },
  {
    name: 'checkout_allow_notes' as const,
    title: 'Aclaración opcional',
    description: 'Deja un espacio libre para que el cliente agregue algo importante.',
    icon: MessageSquareText,
  },
]

export function CheckoutSettingsForm({ store }: { store: Store }) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutSettingsInput>({
    defaultValues: {
      checkout_ask_name: store.checkout_ask_name ?? true,
      checkout_ask_fulfillment: store.checkout_ask_fulfillment ?? true,
      checkout_allow_notes: store.checkout_allow_notes ?? true,
      checkout_custom_fields: Array.isArray(store.checkout_custom_fields) ? store.checkout_custom_fields : [],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'checkout_custom_fields', keyName: 'formKey' })

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

  function addCustomField() {
    if (fields.length >= 6) return
    append({
      id: crypto.randomUUID(),
      label: '',
      field_type: 'short',
      placeholder: '',
      is_required: false,
      is_enabled: true,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
        <div className="mb-4">
          <p className="admin-label">Antes de abrir WhatsApp</p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">Qué datos querés pedir</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Activá lo necesario. Si tu negocio necesita algo especial, agregalo abajo.</p>
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
                  <label className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-black/7 bg-[#fbfcfd] p-3.5 transition hover:border-black/12 dark:border-white/8 dark:bg-white/[0.025] dark:hover:border-white/14">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/55">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{setting.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{setting.description}</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="shrink-0 data-[state=checked]:bg-[#12e89a]" />
                  </label>
                )}
              />
            )
          })}
        </div>

        <div className="mt-5 border-t border-black/7 pt-4 dark:border-white/8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Campos personalizados</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Ej: Barrio, horario preferido o nombre de empresa. Máximo 6.</p>
            </div>
            <button
              type="button"
              onClick={addCustomField}
              disabled={fields.length >= 6}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[9px] border border-black/8 bg-white px-3 text-xs font-semibold text-foreground transition hover:border-black/15 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Plus className="size-3.5" />
              Agregar campo
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-dashed border-black/10 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/[0.025]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/55"><TextCursorInput className="size-4" /></span>
              <p className="text-xs leading-5 text-muted-foreground">No agregaste campos extra. Los tres de arriba alcanzan para la mayoría de los negocios.</p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {fields.map((field, index) => (
                <div key={field.formKey} className="rounded-[12px] border border-black/8 bg-[#fbfcfd] p-3.5 dark:border-white/8 dark:bg-white/[0.025]">
                  <input type="hidden" {...register(`checkout_custom_fields.${index}.id` as const)} />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Campo {index + 1}</p>
                    <button type="button" onClick={() => remove(index)} className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10 dark:hover:text-red-300" aria-label={`Eliminar campo ${index + 1}`}><Trash2 className="size-3.5" /></button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-1.5 block text-xs font-medium text-foreground">Nombre del campo</span>
                      <input
                        {...register(`checkout_custom_fields.${index}.label` as const, { required: true })}
                        placeholder="Ej: Barrio"
                        maxLength={40}
                        className="h-10 w-full rounded-[9px] border border-black/10 bg-white px-3 text-sm text-foreground outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-medium text-foreground">Cómo responde</span>
                      <select {...register(`checkout_custom_fields.${index}.field_type` as const)} className="h-10 w-full rounded-[9px] border border-black/10 bg-white px-3 text-sm text-foreground outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-[#111820]">
                        <option value="short">Texto corto</option>
                        <option value="long">Texto largo</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-xs font-medium text-foreground">Ejemplo dentro del campo <span className="font-normal text-muted-foreground">(opcional)</span></span>
                    <input
                      {...register(`checkout_custom_fields.${index}.placeholder` as const)}
                      placeholder="Ej: Echesortu"
                      maxLength={80}
                      className="h-10 w-full rounded-[9px] border border-black/10 bg-white px-3 text-sm text-foreground outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                    />
                  </label>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Controller
                      control={control}
                      name={`checkout_custom_fields.${index}.is_required` as const}
                      render={({ field: controllerField }) => (
                        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-[9px] border border-black/7 bg-white px-3 dark:border-white/8 dark:bg-white/[0.03]">
                          <span className="text-xs font-medium text-foreground">Obligatorio</span>
                          <Switch checked={controllerField.value} onCheckedChange={controllerField.onChange} className="data-[state=checked]:bg-[#12e89a]" />
                        </label>
                      )}
                    />
                    <Controller
                      control={control}
                      name={`checkout_custom_fields.${index}.is_enabled` as const}
                      render={({ field: controllerField }) => (
                        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-[9px] border border-black/7 bg-white px-3 dark:border-white/8 dark:bg-white/[0.03]">
                          <span className="text-xs font-medium text-foreground">Mostrar al cliente</span>
                          <Switch checked={controllerField.value} onCheckedChange={controllerField.onChange} className="data-[state=checked]:bg-[#12e89a]" />
                        </label>
                      )}
                    />
                  </div>
                  {errors.checkout_custom_fields?.[index]?.label ? <p className="mt-2 text-xs text-red-500">Escribí un nombre para este campo.</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Opciones guardadas" message="El próximo pedido ya va a usar esta configuración." /> : null}

      <div className="flex justify-end">
        <SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar" />
      </div>
    </form>
  )
}
