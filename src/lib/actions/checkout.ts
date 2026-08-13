'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

const checkoutSettingsSchema = z.object({
  checkout_ask_name: z.boolean(),
  checkout_ask_fulfillment: z.boolean(),
  checkout_allow_notes: z.boolean(),
})

export type CheckoutSettingsInput = z.infer<typeof checkoutSettingsSchema>

export async function updateCheckoutSettings(input: CheckoutSettingsInput) {
  const validated = checkoutSettingsSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const { error } = await supabase
    .from('stores')
    .update(validated.data)
    .eq('id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin')
  revalidatePath('/admin/negocio')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}
