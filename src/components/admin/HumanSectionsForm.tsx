'use client'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { SaveButton } from '@/components/common/SaveButton'
import { Switch } from '@/components/ui/switch'
import { updateStoreLayout } from '@/lib/actions/store'
import { storeLayoutSchema, type StoreLayoutInput } from '@/lib/validations/store'
import type { StoreLayout } from '@/types/store'

const ITEMS = [
  { name: 'show_hero' as const, label: 'Portada', hint: 'La primera parte de tu tienda.' },
  { name: 'show_catalog' as const, label: 'Todos los productos', hint: 'Tu catálogo principal.' },
  { name: 'show_categories' as const, label: 'Categorías', hint: 'Ayudan a encontrar productos.' },
  { name: 'show_footer' as const, label: 'Información del negocio', hint: 'Contacto, horarios y dirección.' },
  { name: 'show_featured' as const, label: 'Productos destacados', hint: 'Una selección para mostrar primero.' },
]

export function HumanSectionsForm({ layout }: { layout: StoreLayout }) {
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<StoreLayoutInput>({ resolver: zodResolver(storeLayoutSchema), defaultValues: { show_hero: layout.show_hero, show_featured: layout.show_featured, show_categories: layout.show_categories, show_catalog: layout.show_catalog, show_footer: layout.show_footer } })
  async function onSubmit(data: StoreLayoutInput) {
    const result = await updateStoreLayout(data)
    if (result?.error) toast.error('No pudimos guardar.'); else toast.success('Cambios guardados.')
  }
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-3"><section className="space-y-2 rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820]">{ITEMS.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 rounded-[11px] border border-black/7 bg-slate-50 px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.03]"><div><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p></div><Controller control={control} name={item.name} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} className="shrink-0 data-[state=checked]:bg-[#12e89a]" />} /></div>)}</section><div className="flex justify-end"><SaveButton isLoading={isSubmitting} label="Guardar" /></div></form>
}
