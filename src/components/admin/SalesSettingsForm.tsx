'use client'

import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Banknote, CreditCard, MapPin, Package, Store as StoreIcon, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { updateSalesSettings, type SalesSettingsInput } from '@/lib/actions/sales'
import { FULFILLMENT_METHOD_OPTIONS, normalizeSalesSettings, PAYMENT_METHOD_OPTIONS } from '@/lib/sales/settings'
import { cn } from '@/lib/utils'
import type { FulfillmentMethod, PaymentMethod, Store } from '@/types/store'

const PAYMENT_ICONS: Record<PaymentMethod, React.ElementType> = {
  transfer: Banknote,
  cash: Banknote,
  mercado_pago: CreditCard,
  arrange: CreditCard,
}

const FULFILLMENT_ICONS: Record<FulfillmentMethod, React.ElementType> = {
  pickup: StoreIcon,
  delivery: Truck,
}

export function SalesSettingsForm({ store }: { store: Store }) {
  const defaults = normalizeSalesSettings(store)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { control, register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<SalesSettingsInput>({
    defaultValues: {
      payment_methods: defaults.paymentMethods,
      fulfillment_methods: defaults.fulfillmentMethods,
      delivery_area: defaults.deliveryArea,
      minimum_order_amount: defaults.minimumOrderAmount,
      delivery_notes: defaults.deliveryNotes,
    },
  })

  const paymentMethods = useWatch({ control, name: 'payment_methods' }) ?? []
  const fulfillmentMethods = useWatch({ control, name: 'fulfillment_methods' }) ?? []
  const offersDelivery = fulfillmentMethods.includes('delivery')

  function togglePayment(method: PaymentMethod) {
    const exists = paymentMethods.includes(method)
    if (exists && paymentMethods.length === 1) {
      toast.message('Dejá al menos una forma de pago activa.')
      return
    }
    setValue('payment_methods', exists ? paymentMethods.filter((item) => item !== method) : [...paymentMethods, method], { shouldDirty: true })
  }

  function toggleFulfillment(method: FulfillmentMethod) {
    const exists = fulfillmentMethods.includes(method)
    if (exists && fulfillmentMethods.length === 1) {
      toast.message('Dejá al menos una forma de entrega activa.')
      return
    }
    setValue('fulfillment_methods', exists ? fulfillmentMethods.filter((item) => item !== method) : [...fulfillmentMethods, method], { shouldDirty: true })
  }

  async function onSubmit(data: SalesSettingsInput) {
    setSubmitError(null)
    const result = await updateSalesSettings(data)
    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? 'No pudimos guardar cómo vendés.'
      setSubmitError(message)
      toast.error(message)
      return
    }
    setSaved(true)
    toast.success('Cómo vendés quedó actualizado.')
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
        <div>
          <p className="admin-label">Cómo vendés</p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">Pago y entrega, sin vueltas</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Marcá lo que ofrecés. El cliente lo ve antes de mandar el pedido por WhatsApp.</p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground">Cómo te pueden pagar</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_METHOD_OPTIONS.map((option) => {
              const Icon = PAYMENT_ICONS[option.value]
              const active = paymentMethods.includes(option.value)
              return (
                <button key={option.value} type="button" onClick={() => togglePayment(option.value)} aria-pressed={active} className={cn('min-h-[74px] rounded-[11px] border p-3 text-left transition active:scale-[0.99]', active ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}>
                  <Icon className={cn('size-4', active ? 'text-emerald-600 dark:text-emerald-300' : 'text-muted-foreground')} />
                  <span className="mt-2 block text-xs font-semibold text-foreground">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 border-t border-black/7 pt-4 dark:border-white/8">
          <p className="text-sm font-semibold text-foreground">Cómo entregás</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {FULFILLMENT_METHOD_OPTIONS.map((option) => {
              const Icon = FULFILLMENT_ICONS[option.value]
              const active = fulfillmentMethods.includes(option.value)
              return (
                <button key={option.value} type="button" onClick={() => toggleFulfillment(option.value)} aria-pressed={active} className={cn('flex min-h-12 items-center gap-2.5 rounded-[11px] border px-3 text-left transition active:scale-[0.99]', active ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}>
                  <Icon className={cn('size-4', active ? 'text-emerald-600 dark:text-emerald-300' : 'text-muted-foreground')} />
                  <span className="text-sm font-semibold text-foreground">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {offersDelivery ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-foreground"><MapPin className="size-3.5" />Zona de entrega</span>
              <input {...register('delivery_area')} maxLength={100} placeholder="Ej: Envíos a todo el país" className="h-11 w-full rounded-[10px] border border-black/10 bg-white px-3 text-sm text-foreground outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5" />
              <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">Podés poner una ciudad, una zona o “Envíos a todo el país”.</span>
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-foreground"><Truck className="size-3.5" />Aclaración de entrega <span className="font-normal text-muted-foreground">(opcional)</span></span>
              <input {...register('delivery_notes')} maxLength={160} placeholder="Ej: El costo se confirma por WhatsApp" className="h-11 w-full rounded-[10px] border border-black/10 bg-white px-3 text-sm text-foreground outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5" />
            </label>
          </div>
        ) : null}

        <div className="mt-5 border-t border-black/7 pt-4 dark:border-white/8">
          <label className="block max-w-sm">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-foreground"><Package className="size-3.5" />Pedido mínimo <span className="font-normal text-muted-foreground">(opcional)</span></span>
            <Controller
              control={control}
              name="minimum_order_amount"
              render={({ field }) => (
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input type="number" min={0} step={1} inputMode="numeric" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value === '' ? null : Number(event.target.value))} placeholder="Sin mínimo" className="h-11 w-full rounded-[10px] border border-black/10 bg-white pl-7 pr-3 text-sm text-foreground outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5" />
                </div>
              )}
            />
            <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">Dejalo vacío si aceptás pedidos de cualquier monto.</span>
          </label>
        </div>
      </section>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Listo" message="El cliente ya va a ver esta información." /> : null}
      <div className="flex justify-end"><SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar" /></div>
    </form>
  )
}
