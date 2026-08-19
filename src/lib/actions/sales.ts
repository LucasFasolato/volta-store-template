'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

const salesSettingsSchema = z.object({
  payment_methods: z.array(z.enum(['transfer', 'cash', 'mercado_pago', 'arrange'])).min(1).max(4),
  fulfillment_methods: z.array(z.enum(['pickup', 'delivery'])).min(1).max(2),
  delivery_area: z.string().trim().max(100, 'Usá hasta 100 caracteres.').nullable(),
  minimum_order_amount: z.number().min(0).max(999999999).nullable(),
  delivery_notes: z.string().trim().max(160, 'Usá hasta 160 caracteres.').nullable(),
})

export type SalesSettingsInput = z.infer<typeof salesSettingsSchema>

export async function updateSalesSettings(input: SalesSettingsInput) {
  const normalized = {
    ...input,
    payment_methods: Array.from(new Set(input.payment_methods)),
    fulfillment_methods: Array.from(new Set(input.fulfillment_methods)),
    delivery_area: input.delivery_area?.trim() || null,
    minimum_order_amount: input.minimum_order_amount && input.minimum_order_amount > 0 ? input.minimum_order_amount : null,
    delivery_notes: input.delivery_notes?.trim() || null,
  }
  const validated = salesSettingsSchema.safeParse(normalized)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const { error } = await db
    .from('stores')
    .update(validated.data)
    .eq('id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin')
  revalidatePath('/admin/negocio')
  revalidatePath('/admin/vista-previa')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}
