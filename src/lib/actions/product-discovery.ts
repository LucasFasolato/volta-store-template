'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

function revalidateProductDiscovery(storeSlug: string, productId: string) {
  revalidatePath('/admin/catalogo')
  revalidatePath(`/admin/catalogo/${productId}`)
  revalidatePath(`/tienda/${storeSlug}`)
}

export async function setProductBrand(productId: string, brandId: string | null) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  if (brandId) {
    const { data: brand, error: brandError } = await db
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('store_id', store.id)
      .maybeSingle()

    if (brandError) return { error: brandError.message }
    if (!brand) return { error: 'La marca ya no existe.' }
  }

  const { error } = await db
    .from('products')
    .update({ brand_id: brandId })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }
  revalidateProductDiscovery(store.slug, productId)
  return { success: true }
}

export async function setProductSku(productId: string, sku: string) {
  const normalizedSku = sku.trim()
  if (normalizedSku.length > 80) return { error: 'El SKU no puede superar los 80 caracteres.' }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const { error } = await db
    .from('products')
    .update({ sku: normalizedSku || null })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error?.code === '23505') return { error: 'Ese SKU ya está usado por otro producto.' }
  if (error) return { error: error.message }

  revalidateProductDiscovery(store.slug, productId)
  return { success: true, sku: normalizedSku || null }
}

export async function setProductPromotion(productId: string, promotionalPrice: number | null) {
  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  const { data: product, error: productError } = await db
    .from('products')
    .select('id, price, compare_price')
    .eq('id', productId)
    .eq('store_id', store.id)
    .maybeSingle()

  if (productError) return { error: productError.message }
  if (!product) return { error: 'El producto ya no existe.' }

  const currentPrice = Number(product.price)
  const currentComparePrice = product.compare_price === null ? null : Number(product.compare_price)
  const isCurrentlyOnPromotion = currentComparePrice !== null && currentComparePrice > currentPrice
  const normalPrice = isCurrentlyOnPromotion ? currentComparePrice : currentPrice

  if (promotionalPrice === null) {
    if (!isCurrentlyOnPromotion) {
      return { success: true, price: currentPrice, comparePrice: null }
    }

    const { error } = await db
      .from('products')
      .update({ price: normalPrice, compare_price: null })
      .eq('id', productId)
      .eq('store_id', store.id)

    if (error) return { error: error.message }
    revalidateProductDiscovery(store.slug, productId)
    return { success: true, price: normalPrice, comparePrice: null }
  }

  if (!Number.isFinite(promotionalPrice) || promotionalPrice <= 0) {
    return { error: 'Ingresá un precio promocional válido.' }
  }

  if (promotionalPrice >= normalPrice) {
    return { error: 'El precio promocional tiene que ser menor al precio normal.' }
  }

  const { error } = await db
    .from('products')
    .update({ price: promotionalPrice, compare_price: normalPrice })
    .eq('id', productId)
    .eq('store_id', store.id)

  if (error) return { error: error.message }

  revalidateProductDiscovery(store.slug, productId)
  return { success: true, price: promotionalPrice, comparePrice: normalPrice }
}
