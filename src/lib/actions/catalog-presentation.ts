'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

export type CatalogMode = 'all' | 'sections' | 'navigation'

function revalidateCatalog(storeSlug: string) {
  revalidatePath('/admin/catalogo')
  revalidatePath(`/tienda/${storeSlug}`)
}

export async function updateCatalogMode(mode: CatalogMode) {
  if (!['all', 'sections', 'navigation'].includes(mode)) {
    return { error: 'Modo de catálogo inválido.' }
  }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const { error } = await db
    .from('store_layout')
    .update({ catalog_mode: mode })
    .eq('store_id', store.id)

  if (error) return { error: error.message }
  revalidateCatalog(store.slug)
  return { success: true }
}

export async function reorderCategories(categoryIds: string[]) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  const { data: owned, error: ownedError } = await db
    .from('categories')
    .select('id')
    .eq('store_id', store.id)
    .in('id', categoryIds)

  if (ownedError) return { error: ownedError.message }
  if ((owned ?? []).length !== categoryIds.length) return { error: 'Hay categorías que ya no existen.' }

  for (let index = 0; index < categoryIds.length; index += 1) {
    const { error } = await db
      .from('categories')
      .update({ sort_order: index })
      .eq('store_id', store.id)
      .eq('id', categoryIds[index])
    if (error) return { error: error.message }
  }

  revalidateCatalog(store.slug)
  return { success: true }
}

export async function reorderProducts(
  productIds: string[],
  scope: { type: 'global' } | { type: 'category'; categoryId: string | null },
) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  let query = db.from('products').select('id, category_id').eq('store_id', store.id).in('id', productIds)
  if (scope.type === 'category') {
    query = scope.categoryId ? query.eq('category_id', scope.categoryId) : query.is('category_id', null)
  }

  const { data: owned, error: ownedError } = await query
  if (ownedError) return { error: ownedError.message }
  if ((owned ?? []).length !== productIds.length) return { error: 'Hay productos que cambiaron de categoría o ya no existen.' }

  const field = scope.type === 'global' ? 'sort_order' : 'category_sort_order'

  for (let index = 0; index < productIds.length; index += 1) {
    const { error } = await db
      .from('products')
      .update({ [field]: index })
      .eq('store_id', store.id)
      .eq('id', productIds[index])
    if (error) return { error: error.message }
  }

  revalidateCatalog(store.slug)
  return { success: true }
}
