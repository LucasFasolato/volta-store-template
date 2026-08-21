'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStoreConfig } from '@/lib/actions/store-config'
import { sanitizeInstagramHandle, slugify } from '@/lib/utils/format'
import { storeConfigSchema, type StoreConfigInput } from '@/lib/validations/store'
import type { Store } from '@/types/store'

export function MobileConfigForm({ store }: { store: Store }) {
  const [saved, setSaved] = useState(false)
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<StoreConfigInput>({
    resolver: zodResolver(storeConfigSchema),
    defaultValues: { name: store.name, slug: store.slug, whatsapp: store.whatsapp, instagram: store.instagram ?? '', address: store.address ?? '', hours: store.hours ?? '' },
  })
  async function onSubmit(data: StoreConfigInput) {
    const result = await updateStoreConfig({ ...data, slug: slugify(data.slug).slice(0, 48), instagram: sanitizeInstagramHandle(data.instagram ?? '') })
    if (result?.error) {
      const message = result.error.fieldErrors?.slug?.[0]
        ?? result.error.fieldErrors?.whatsapp?.[0]
        ?? result.error.formErrors?.[0]
        ?? 'No pudimos guardar.'
      toast.error(message)
      return
    }
    setSaved(true); toast.success('Cambios guardados.'); setTimeout(() => setSaved(false), 2200)
  }
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
    <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820]">
      <Field label="Nombre" error={errors.name?.message}><Input {...register('name')} className="h-12 bg-white dark:bg-white/5" /></Field>
      <div className="mt-4"><Field label="WhatsApp" error={errors.whatsapp?.message}><Input {...register('whatsapp')} className="h-12 bg-white dark:bg-white/5" /></Field></div>
    </section>
    <details className="group rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-foreground">Enlace de mi tienda <ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="border-t border-black/7 p-4 dark:border-white/8"><Field label="Enlace" error={errors.slug?.message}><Input {...register('slug')} className="h-12 bg-white font-mono dark:bg-white/5" /></Field><p className="mt-2 text-xs leading-5 text-muted-foreground">Si lo cambiás, los links y QR anteriores seguirán llevando a tu tienda.</p></div></details>
    <details className="group rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-foreground">Información del negocio <ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="space-y-4 border-t border-black/7 p-4 dark:border-white/8"><Field label="Instagram"><Input {...register('instagram')} className="h-12 bg-white dark:bg-white/5" /></Field><Field label="Horarios"><Input {...register('hours')} className="h-12 bg-white dark:bg-white/5" /></Field><Field label="Dirección o retiro"><Input {...register('address')} className="h-12 bg-white dark:bg-white/5" /></Field></div></details>
    <div className="sticky bottom-[126px] z-20 flex justify-end rounded-[12px] border border-black/8 bg-white/95 p-2.5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#111820]/95"><SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar" /></div>
  </form>
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div><Label className="mb-1.5 block text-sm font-medium text-foreground">{label}</Label>{children}{error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}</div> }
