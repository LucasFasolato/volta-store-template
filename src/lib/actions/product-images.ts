'use server'

import { revalidatePath } from 'next/cache'
import { getStoreCommercialAccess } from '@/lib/billing/commercial-access'
import {
  MAX_PRODUCT_IMAGES,
  removeStoragePaths,
  STORE_ASSET_BUCKET,
  storagePathFromPublicUrl,
  validateOptimizedWebp,
} from '@/lib/images/storage-assets'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

function revalidateStorePaths(storeSlug: string, productId: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/catalogo')
  revalidatePath(`/admin/catalogo/${productId}`)
  revalidatePath(`/tienda/${storeSlug}`)
}

async function assertOwnedProduct(db: any, storeId: string, productId: string) {
  const { data, error } = await db
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('store_id', storeId)
    .maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'Producto no encontrado.' }
  return { error: null as string | null }
}

export async function uploadProductImageForPlan(productId: string, formData: FormData) {
  const { supabase, store, user } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const imageFile = formData.get('image') as File | null
  if (!imageFile) return { error: 'No recibimos una imagen.' }

  const ownership = await assertOwnedProduct(db, store.id, productId)
  if (ownership.error) return { error: ownership.error }

  const validationError = await validateOptimizedWebp(imageFile, 'product')
  if (validationError) return { error: validationError }

  const [{ data: existingImages, error: existingImagesError }, commercialAccess] = await Promise.all([
    db
      .from('product_images')
      .select('id, url, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true }),
    getStoreCommercialAccess(store.id),
  ])

  if (existingImagesError) return { error: existingImagesError.message }

  const makePrimary = formData.get('makePrimary') === 'true'
  const isFree = commercialAccess.planCode === 'free'
  const existingCount = existingImages?.length ?? 0

  if (isFree && existingCount >= 1 && !makePrimary) {
    return { error: 'Gratis incluye 1 imagen por producto. Pasá a VOLTA para sumar una galería completa.', upgradeRequired: true as const }
  }
  if (!isFree && existingCount >= MAX_PRODUCT_IMAGES) {
    return { error: `Podés usar hasta ${MAX_PRODUCT_IMAGES} imágenes por producto.` }
  }

  const path = `${user.id}/products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`
  const { error: uploadError } = await supabase.storage
    .from(STORE_ASSET_BUCKET)
    .upload(path, imageFile, {
      upsert: false,
      contentType: 'image/webp',
      cacheControl: '31536000',
    })
  if (uploadError) return { error: uploadError.message }

  const cleanupNewFile = async () => removeStoragePaths(supabase, [path])
  const { data: urlData } = supabase.storage.from(STORE_ASSET_BUCKET).getPublicUrl(path)

  if (isFree && existingCount >= 1 && makePrimary) {
    const primary = existingImages[0]
    const oldPath = storagePathFromPublicUrl(primary.url)
    const { data: updatedImage, error: updateError } = await db
      .from('product_images')
      .update({ url: urlData.publicUrl, sort_order: 0 })
      .eq('id', primary.id)
      .eq('product_id', productId)
      .select('id, url, sort_order')
      .single()

    if (updateError) {
      await cleanupNewFile()
      return { error: updateError.message }
    }

    // The DB now points at the new image. Old storage cleanup is best-effort and
    // never rolls the product back to a broken URL.
    await removeStoragePaths(supabase, [oldPath])
    revalidateStorePaths(store.slug, productId)
    return { success: true, image: updatedImage, replaced: true as const }
  }

  let sortOrder = 0
  if (makePrimary) {
    for (const image of existingImages ?? []) {
      const { error: reorderError } = await db
        .from('product_images')
        .update({ sort_order: (image.sort_order ?? 0) + 1 })
        .eq('id', image.id)
        .eq('product_id', productId)
      if (reorderError) {
        await cleanupNewFile()
        return { error: reorderError.message }
      }
    }
  } else {
    const lastSortOrder = existingImages?.at(-1)?.sort_order
    sortOrder = (typeof lastSortOrder === 'number' ? lastSortOrder : -1) + 1
  }

  const { data: image, error: insertError } = await db
    .from('product_images')
    .insert({ product_id: productId, url: urlData.publicUrl, sort_order: sortOrder })
    .select('id, url, sort_order')
    .single()

  if (insertError) {
    await cleanupNewFile()
    return { error: insertError.message }
  }

  revalidateStorePaths(store.slug, productId)
  return { success: true, image }
}
