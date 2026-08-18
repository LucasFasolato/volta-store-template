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
    let query = supabase.from(table).select('id').eq('store_id', storeId).eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data: existing, error } = await query.maybeSingle()
    if (error) throw new Error(`Failed to generate unique slug: ${error.message}`)
    if (!existing) return candidate
    suffix += 1
  }
}

async function categoryNameAlreadyExists({
  supabase,
  storeId,
  name,
  excludeId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  storeId: string
  name: string
  excludeId?: string
}) {
  let query = supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', storeId)
    .ilike('name', name.trim())

  if (excludeId) query = query.neq('id', excludeId)

  const { data, error } = await query.limit(1)
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

function revalidateStorePaths(storeSlug: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/catalogo')
  revalidatePath(`/tienda/${storeSlug}`)
}

function productWriteError(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return { formErrors: ['El SKU ya está usado por otro producto.'], fieldErrors: {} }
  }
  return { formErrors: [error.message], fieldErrors: {} }
}

export async function createProduct(input: ProductInput) {
  const validated = productSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const data = validated.data
  const slug = await getUniqueSlug({ supabase, table: 'products', storeId: store.id, value: data.name })
  const { data: product, error } = await db
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
      brand_id: data.brand_id ?? null,
      sku: data.sku?.trim() || null,
      is_featured: data.is_featured,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .select('id, slug')
    .single()
  if (error) return { error: productWriteError(error) }
  revalidateStorePaths(store.slug)
  return { success: true, productId: product.id }
}

export async function updateProduct(productId: string, input: ProductInput) {
  const validated = productSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const data = validated.data
  const { error } = await db
    .from('products')
    .update({
      name: data.name,
      short_description: data.short_description ?? null,
      description: data.description ?? null,
      price: data.price,
      compare_price: data.compare_price ?? null,
      badge: data.badge ?? null,
      category_id: data.category_id ?? null,
      brand_id: data.brand_id ?? null,
      sku: data.sku?.trim() || null,
      is_featured: data.is_featured,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .eq('id', productId)
    .eq('store_id', store.id)
  if (error) return { error: productWriteError(error) }
  revalidateStorePaths(store.slug)
  revalidatePath(`/admin/catalogo/${productId}`)
  return { success: true }
}

export async function deleteProduct(productId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const { error } = await supabase.from('products').delete().eq('id', productId).eq('store_id', store.id)
  if (error) return { error: error.message }
  revalidateStorePaths(store.slug)
  return { success: true }
}

export async function uploadProductImage(productId: string, file: FormData) {
  const { supabase, store, user } = await requireAuthenticatedStoreContext()
  const imageFile = file.get('image') as File | null
  if (!imageFile) return { error: 'No image provided' }
  const makePrimary = file.get('makePrimary') === 'true'
  const ext = imageFile.name.split('.').pop()
  const path = `${user.id}/products/${productId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('store-assets').upload(path, imageFile, { upsert: false })
  if (uploadError) return { error: uploadError.message }
  const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(path)
  let sortOrder = 0

  if (makePrimary) {
    const { data: existingImages, error: existingImagesError } = await supabase.from('product_images').select('id, sort_order').eq('product_id', productId)
    if (existingImagesError) return { error: existingImagesError.message }
    for (const image of existingImages ?? []) {
      const { error: reorderError } = await supabase.from('product_images').update({ sort_order: (image.sort_order ?? 0) + 1 }).eq('id', image.id).eq('product_id', productId)
      if (reorderError) return { error: reorderError.message }
    }
  } else {
    const { data: lastImage, error: lastImageError } = await supabase.from('product_images').select('sort_order').eq('product_id', productId).order('sort_order', { ascending: false }).limit(1).maybeSingle()
    if (lastImageError) return { error: lastImageError.message }
    sortOrder = (lastImage?.sort_order ?? -1) + 1
  }

  const { data: image, error: insertError } = await supabase.from('product_images').insert({ product_id: productId, url: urlData.publicUrl, sort_order: sortOrder }).select('id, url, sort_order').single()
  if (insertError) return { error: insertError.message }
  revalidateStorePaths(store.slug)
  revalidatePath(`/admin/catalogo/${productId}`)
  return { success: true, image }
}

export async function deleteProductImage(imageId: string, productId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const { error } = await supabase.from('product_images').delete().eq('id', imageId).eq('product_id', productId)
  if (error) return { error: error.message }
  revalidateStorePaths(store.slug)
  revalidatePath(`/admin/catalogo/${productId}`)
  return { success: true }
}

export async function createCategory(input: CategoryInput) {
  const validated = categorySchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const data = { ...validated.data, name: validated.data.name.trim() }

  if (await categoryNameAlreadyExists({ supabase, storeId: store.id, name: data.name })) {
    return { error: { formErrors: ['Ya existe una categoría con ese nombre.'], fieldErrors: {} } }
  }

  const slug = await getUniqueSlug({ supabase, table: 'categories', storeId: store.id, value: data.name })
  const { data: category, error } = await supabase
    .from('categories')
    .insert({ store_id: store.id, name: data.name, slug, sort_order: data.sort_order })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return { error: { formErrors: ['Ya existe una categoría con ese nombre.'], fieldErrors: {} } }
    return { error: { formErrors: [error.message], fieldErrors: {} } }
  }
  revalidateStorePaths(store.slug)
  return { success: true, category }
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const validated = categorySchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const data = { ...validated.data, name: validated.data.name.trim() }

  if (await categoryNameAlreadyExists({ supabase, storeId: store.id, name: data.name, excludeId: categoryId })) {
    return { error: { formErrors: ['Ya existe una categoría con ese nombre.'], fieldErrors: {} } }
  }

  const slug = await getUniqueSlug({ supabase, table: 'categories', storeId: store.id, value: data.name, excludeId: categoryId })
  const { data: category, error } = await supabase
    .from('categories')
    .update({ name: data.name, slug, sort_order: data.sort_order })
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
  const { error } = await supabase.from('categories').delete().eq('id', categoryId).eq('store_id', store.id)
  if (error) return { error: error.message }
  revalidateStorePaths(store.slug)
  return { success: true }
}

export async function assignProductToCategory(productId: string, categoryId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const { error } = await supabase.from('products').update({ category_id: categoryId }).eq('id', productId).eq('store_id', store.id)
  if (error) return { error: error.message }
  revalidateStorePaths(store.slug)
  return { success: true }
}
