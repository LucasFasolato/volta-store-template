'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

export async function setProductCategory(productId: string, categoryId: string | null) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  if (categoryId) {
    const { data: category } = await db
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('store_id', store.id)
      .maybeSingle()

    if (!category) return { error: 'La categoría ya no existe.' }
  }

  let orderQuery = db
    .from('products')
    .select('category_sort_order')
    .eq('store_id', store.id)
    .order('category_sort_order', { ascending: false })
    .limit(1)

  orderQuery = categoryId ? orderQuery.eq('category_id', categoryId) : orderQuery.is('category_id', null)
  const { data: lastProduct } = await orderQuery.maybeSingle()
  const nextCategoryOrder = (lastProduct?.category_sort_order ?? -1) + 1

  const { error } = await db
    .from('products')
    .update({ category_id: categoryId, category_sort_order: nextCategoryOrder })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/catalogo')
  revalidatePath(`/admin/catalogo/${productId}`)
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}
