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
  unavailable_values: z.array(z.string().min(1)).max(30).optional(),
  sort_order: z.number().int().min(0).default(0),
})

export type ProductOptionInput = z.infer<typeof optionSchema>

async function requireProductOwnership(productId: string) {
  const ctx = await requireAuthenticatedStoreContext()
  const { data: product } = await ctx.supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('store_id', ctx.store.id)
    .maybeSingle()

  if (!product) throw new Error('Producto no encontrado o sin permisos.')
  return ctx
}

function revalidate(storeSlug: string, productId: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/catalogo')
  revalidatePath(`/admin/catalogo/${productId}`)
  revalidatePath(`/tienda/${storeSlug}`)
}

function cleanUnavailable(values: string[], unavailableValues: string[] | undefined) {
  const unavailable = new Set(unavailableValues ?? [])
  return values.filter((value) => unavailable.has(value))
}

function optionKey(name: string) {
  return name.trim().toLocaleLowerCase('es')
}

export async function createProductOption(productId: string, input: ProductOptionInput) {
  const validated = optionSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireProductOwnership(productId)
  const data = validated.data
  const db = supabase as any
  const { data: option, error } = await db
    .from('product_options')
    .insert({
      product_id: productId,
      name: data.name,
      values: data.values,
      unavailable_values: cleanUnavailable(data.values, data.unavailable_values),
      sort_order: data.sort_order,
    })
    .select('*')
    .single()

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }
  revalidate(store.slug, productId)
  return { success: true, option }
}

export async function updateProductOption(optionId: string, productId: string, input: ProductOptionInput) {
  const validated = optionSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireProductOwnership(productId)
  const data = validated.data
  const db = supabase as any
  const { error } = await db
    .from('product_options')
    .update({
      name: data.name,
      values: data.values,
      unavailable_values: cleanUnavailable(data.values, data.unavailable_values),
      sort_order: data.sort_order,
    })
    .eq('id', optionId)
    .eq('product_id', productId)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }
  revalidate(store.slug, productId)
  return { success: true }
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

export async function setProductOptionValueAvailability({
  productId,
  optionId,
  value,
  available,
}: {
  productId: string
  optionId: string
  value: string
  available: boolean
}) {
  const { supabase, store } = await requireProductOwnership(productId)
  const db = supabase as any
  const { data: option, error: readError } = await db
    .from('product_options')
    .select('id, values, unavailable_values')
    .eq('id', optionId)
    .eq('product_id', productId)
    .maybeSingle()

  if (readError) return { error: readError.message }
  if (!option) return { error: 'No encontramos esa opción.' }
  if (!option.values.includes(value)) return { error: 'Ese valor ya no pertenece a la opción.' }

  const unavailable = new Set<string>(option.unavailable_values ?? [])
  if (available) unavailable.delete(value)
  else unavailable.add(value)

  const nextUnavailable = option.values.filter((candidate: string) => unavailable.has(candidate))
  const { error } = await db
    .from('product_options')
    .update({ unavailable_values: nextUnavailable })
    .eq('id', optionId)
    .eq('product_id', productId)

  if (error) return { error: error.message }
  revalidate(store.slug, productId)
  return { success: true, unavailableValues: nextUnavailable }
}

export async function replaceProductOptions(productId: string, options: ProductOptionInput[]) {
  const { supabase, store } = await requireProductOwnership(productId)
  const db = supabase as any

  for (const opt of options) {
    const result = optionSchema.safeParse(opt)
    if (!result.success) {
      return { error: { formErrors: [`Atributo inválido: ${opt.name}`], fieldErrors: {} } }
    }
  }

  const { data: existingOptions, error: existingError } = await db
    .from('product_options')
    .select('name, unavailable_values')
    .eq('product_id', productId)

  if (existingError) return { error: { formErrors: [existingError.message], fieldErrors: {} } }

  const unavailableByName = new Map<string, string[]>()
  for (const existing of existingOptions ?? []) {
    unavailableByName.set(optionKey(existing.name), existing.unavailable_values ?? [])
  }

  const { error: deleteError } = await supabase
    .from('product_options')
    .delete()
    .eq('product_id', productId)

  if (deleteError) return { error: { formErrors: [deleteError.message], fieldErrors: {} } }

  if (options.length > 0) {
    const rows = options.map((opt, index) => {
      const preservedUnavailable = opt.unavailable_values ?? unavailableByName.get(optionKey(opt.name)) ?? []
      return {
        product_id: productId,
        name: opt.name,
        values: opt.values,
        unavailable_values: cleanUnavailable(opt.values, preservedUnavailable),
        sort_order: index,
      }
    })

    const { error: insertError } = await db.from('product_options').insert(rows)
    if (insertError) return { error: { formErrors: [insertError.message], fieldErrors: {} } }
  }

  revalidate(store.slug, productId)
  return { success: true }
}
