'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

export async function setProductCategory(productId: string, categoryId: string | null) {
  const { supabase, store } = await requireAuthenticatedStoreContext()

  if (categoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('store_id', store.id)
      .maybeSingle()

    if (!category) return { error: 'La categoría ya no existe.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ category_id: categoryId })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/catalogo')
  revalidatePath(`/admin/catalogo/${productId}`)
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}
