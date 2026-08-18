'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import { slugify } from '@/lib/utils/format'
import { brandSchema, type BrandInput } from '@/lib/validations/brand'
import type { Brand } from '@/types/store'

function revalidateBrandPaths(storeSlug: string) {
  revalidatePath('/admin/catalogo')
  revalidatePath(`/tienda/${storeSlug}`)
}

async function getUniqueBrandSlug(
  db: any,
  storeId: string,
  name: string,
  excludeId?: string,
) {
  const base = slugify(name) || 'marca'
  let suffix = 0

  while (true) {
    const slug = suffix === 0 ? base : `${base}-${suffix}`
    let query = db.from('brands').select('id').eq('store_id', storeId).eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return slug
    suffix += 1
  }
}

async function brandNameExists(db: any, storeId: string, name: string, excludeId?: string) {
  let query = db
    .from('brands')
    .select('id')
    .eq('store_id', storeId)
    .ilike('name', name.trim())

  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.limit(1)
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

export async function createBrand(input: BrandInput) {
  const validated = brandSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten().formErrors[0] ?? 'Revisá la marca.' }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const name = validated.data.name.trim()

  if (await brandNameExists(db, store.id, name)) {
    return { error: 'Ya existe una marca con ese nombre.' }
  }

  const slug = await getUniqueBrandSlug(db, store.id, name)
  const { data: lastBrand, error: orderError } = await db
    .from('brands')
    .select('sort_order')
    .eq('store_id', store.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (orderError) return { error: orderError.message }

  const { data, error } = await db
    .from('brands')
    .insert({
      store_id: store.id,
      name,
      slug,
      is_active: true,
      sort_order: (lastBrand?.sort_order ?? -1) + 1,
    })
    .select('*')
    .single()

  if (error) return { error: error.message }
  revalidateBrandPaths(store.slug)
  return { success: true, brand: data as Brand }
}

export async function updateBrand(brandId: string, input: BrandInput) {
  const validated = brandSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten().formErrors[0] ?? 'Revisá la marca.' }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const name = validated.data.name.trim()

  if (await brandNameExists(db, store.id, name, brandId)) {
    return { error: 'Ya existe una marca con ese nombre.' }
  }

  const slug = await getUniqueBrandSlug(db, store.id, name, brandId)
  const { error } = await db
    .from('brands')
    .update({ name, slug })
    .eq('id', brandId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }
  revalidateBrandPaths(store.slug)
  return { success: true, slug }
}

export async function setBrandActive(brandId: string, isActive: boolean) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const { error } = await db
    .from('brands')
    .update({ is_active: isActive })
    .eq('id', brandId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }
  revalidateBrandPaths(store.slug)
  return { success: true }
}

export async function deleteBrand(brandId: string) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const { error } = await db
    .from('brands')
    .delete()
    .eq('id', brandId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }
  revalidateBrandPaths(store.slug)
  return { success: true }
}

export async function reorderBrands(brandIds: string[]) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  const { data: owned, error: ownedError } = await db
    .from('brands')
    .select('id')
    .eq('store_id', store.id)
    .in('id', brandIds)

  if (ownedError) return { error: ownedError.message }
  if ((owned ?? []).length !== brandIds.length) return { error: 'Hay marcas que ya no existen.' }

  for (let index = 0; index < brandIds.length; index += 1) {
    const { error } = await db
      .from('brands')
      .update({ sort_order: index })
      .eq('store_id', store.id)
      .eq('id', brandIds[index])

    if (error) return { error: error.message }
  }

  revalidateBrandPaths(store.slug)
  return { success: true }
}
