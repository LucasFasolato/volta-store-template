'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

const optionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(40, 'Máximo 40 caracteres'),
  values: z
    .array(z.string().min(1))
    .min(1, 'Ingresá al menos un valor')
    .max(30, 'Máximo 30 valores por atributo'),
  sort_order: z.number().int().min(0).default(0),
})

export type ProductOptionInput = z.infer<typeof optionSchema>

/**
 * Verify the product belongs to the current store before mutating its options.
 */
async function requireProductOwnership(productId: string) {
  const ctx = await requireAuthenticatedStoreContext()
  const { data: product } = await ctx.supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('store_id', ctx.store.id)
    .maybeSingle()

  if (!product) {
    throw new Error('Producto no encontrado o sin permisos.')
  }

  return ctx
}

function revalidate(storeSlug: string, productId: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/catalogo')
  revalidatePath(`/admin/catalogo/${productId}`)
  revalidatePath(`/tienda/${storeSlug}`)
}

export async function createProductOption(productId: string, input: ProductOptionInput) {
  const validated = optionSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireProductOwnership(productId)
  const data = validated.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: option, error } = await (supabase as any)
    .from('product_options')
    .insert({
      product_id: productId,
      name: data.name,
      values: data.values,
      sort_order: data.sort_order,
    })
    .select('*')
    .single()

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidate(store.slug, productId)
  return { success: true, option }
}

export async function updateProductOption(
  optionId: string,
  productId: string,
  input: ProductOptionInput,
) {
  const validated = optionSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireProductOwnership(productId)
  const data = validated.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: option, error } = await (supabase as any)
    .from('product_options')
    .update({ name: data.name, values: data.values, sort_order: data.sort_order })
    .eq('id', optionId)
    .eq('product_id', productId)
    .select('*')
    .single()

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidate(store.slug, productId)
  return { success: true, option }
}

export async function deleteProductOption(optionId: string, productId: string) {
  const { supabase, store } = await requireProductOwnership(productId)

  const { error } = await supabase
    .from('product_options')
    .delete()
    .eq('id', optionId)
    .eq('product_id', productId)

  if (error) return { error: error.message }

  revalidate(store.slug, productId)
  return { success: true }
}

/**
 * Replace all options for a product in one shot.
 * Used by bulk save from the editor.
 */
export async function replaceProductOptions(
  productId: string,
  options: ProductOptionInput[],
) {
  const { supabase, store } = await requireProductOwnership(productId)

  // Validate all
  for (const opt of options) {
    const result = optionSchema.safeParse(opt)
    if (!result.success) {
      return { error: { formErrors: [`Atributo inválido: ${opt.name}`], fieldErrors: {} } }
    }
  }

  // Delete existing, then insert new
  const { error: deleteError } = await supabase
    .from('product_options')
    .delete()
    .eq('product_id', productId)

  if (deleteError) return { error: { formErrors: [deleteError.message], fieldErrors: {} } }

  if (options.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('product_options')
      .insert(
        options.map((opt, i) => ({
          product_id: productId,
          name: opt.name,
          values: opt.values,
          sort_order: i,
        })),
      )

    if (insertError) return { error: { formErrors: [insertError.message], fieldErrors: {} } }
  }

  revalidate(store.slug, productId)
  return { success: true }
}
