'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import { categorySchema, productSchema } from '@/lib/validations/product'
import { slugify } from '@/lib/utils/format'
import type { CategoryInput, ProductInput } from '@/lib/validations/product'

async function getUniqueSlug({
  supabase,
  table,
  storeId,
  value,
  excludeId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  table: 'products' | 'categories'
  storeId: string
  value: string
  excludeId?: string
}) {
  const baseSlug = slugify(value)
  let suffix = 0

  while (true) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`

    let query = supabase
      .from(table)
      .select('id')
      .eq('store_id', storeId)
      .eq('slug', candidate)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data: existing, error } = await query.maybeSingle()
    if (error) {
      throw new Error(`Failed to generate unique slug: ${error.message}`)
    }

    if (!existing) return candidate
    suffix += 1
  }
}

function revalidateStorePaths(storeSlug: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/productos')
  revalidatePath('/admin/categorias')
  revalidatePath(`/tienda/${storeSlug}`)
}

export async function createProduct(input: ProductInput) {
  const validated = productSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const data = validated.data

  const slug = await getUniqueSlug({
    supabase,
    table: 'products',
    storeId: store.id,
    value: data.name,
  })

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      store_id: store.id,
      slug,
      name: data.name,
      short_description: data.short_description ?? null,
      description: data.description ?? null,
      price: data.price,
      compare_price: data.compare_price ?? null,
      badge: data.badge ?? null,
      category_id: data.category_id ?? null,
      is_featured: data.is_featured,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .select('id, slug')
    .single()

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidateStorePaths(store.slug)
  return { success: true, productId: product.id }
}

export async function updateProduct(productId: string, input: ProductInput) {
  const validated = productSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const data = validated.data

  const { error } = await supabase
    .from('products')
    .update({
      name: data.name,
      short_description: data.short_description ?? null,
      description: data.description ?? null,
      price: data.price,
      compare_price: data.compare_price ?? null,
      badge: data.badge ?? null,
      category_id: data.category_id ?? null,
      is_featured: data.is_featured,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidateStorePaths(store.slug)
  revalidatePath(`/admin/productos/${productId}`)
  return { success: true }
}

export async function deleteProduct(productId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }

  revalidateStorePaths(store.slug)
  return { success: true }
}

export async function uploadProductImage(productId: string, file: FormData) {
  const { supabase, store, user } = await requireAuthenticatedStoreContext()

  const imageFile = file.get('image') as File | null
  if (!imageFile) return { error: 'No image provided' }

  const ext = imageFile.name.split('.').pop()
  const path = `${user.id}/products/${productId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(path, imageFile, { upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(path)

  const { data: image, error: insertError } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url: urlData.publicUrl, sort_order: 0 })
    .select('id, url')
    .single()

  if (insertError) return { error: insertError.message }

  revalidateStorePaths(store.slug)
  revalidatePath(`/admin/productos/${productId}`)
  return { success: true, image }
}

export async function deleteProductImage(imageId: string, productId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('product_id', productId)

  if (error) return { error: error.message }

  revalidateStorePaths(store.slug)
  revalidatePath(`/admin/productos/${productId}`)
  return { success: true }
}

export async function createCategory(input: CategoryInput) {
  const validated = categorySchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const data = validated.data

  const slug = await getUniqueSlug({
    supabase,
    table: 'categories',
    storeId: store.id,
    value: data.name,
  })

  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      store_id: store.id,
      name: data.name,
      slug,
      sort_order: data.sort_order,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: { formErrors: ['Ya existe una categoria con ese nombre.'], fieldErrors: {} } }
    }
    return { error: { formErrors: [error.message], fieldErrors: {} } }
  }

  revalidateStorePaths(store.slug)
  return { success: true, category }
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const validated = categorySchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()

  const slug = await getUniqueSlug({
    supabase,
    table: 'categories',
    storeId: store.id,
    value: validated.data.name,
    excludeId: categoryId,
  })

  const { data: category, error } = await supabase
    .from('categories')
    .update({
      name: validated.data.name,
      slug,
      sort_order: validated.data.sort_order,
    })
    .eq('id', categoryId)
    .eq('store_id', store.id)
    .select('*')
    .single()

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidateStorePaths(store.slug)
  return { success: true, category }
}

export async function deleteCategory(categoryId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }

  revalidateStorePaths(store.slug)
  return { success: true }
}

export async function assignProductToCategory(productId: string, categoryId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('products')
    .update({ category_id: categoryId })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }

  revalidateStorePaths(store.slug)
  return { success: true }
}
