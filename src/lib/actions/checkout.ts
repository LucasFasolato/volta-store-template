'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

const customFieldSchema = z.object({
  id: z.string().min(8).max(80),
  label: z.string().trim().min(1, 'Escribí un nombre para el campo.').max(40, 'Usá hasta 40 caracteres.'),
  field_type: z.enum(['short', 'long']),
  placeholder: z.string().trim().max(80, 'Usá hasta 80 caracteres.').nullable(),
  is_required: z.boolean(),
  is_enabled: z.boolean(),
})

const checkoutSettingsSchema = z.object({
  checkout_ask_name: z.boolean(),
  checkout_ask_fulfillment: z.boolean(),
  checkout_allow_notes: z.boolean(),
  checkout_custom_fields: z.array(customFieldSchema).max(6, 'Podés agregar hasta 6 campos personalizados.'),
})

export type CheckoutSettingsInput = z.infer<typeof checkoutSettingsSchema>

export async function updateCheckoutSettings(input: CheckoutSettingsInput) {
  const validated = checkoutSettingsSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const { error } = await db
    .from('stores')
    .update({
      checkout_ask_name: validated.data.checkout_ask_name,
      checkout_ask_fulfillment: validated.data.checkout_ask_fulfillment,
      checkout_allow_notes: validated.data.checkout_allow_notes,
      checkout_custom_fields: validated.data.checkout_custom_fields.map((field) => ({
        ...field,
        placeholder: field.placeholder || null,
      })),
    })
    .eq('id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin')
  revalidatePath('/admin/negocio')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}
