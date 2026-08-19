'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'

const productIdsSchema = z.array(z.string().uuid()).min(1, 'Seleccioná al menos un producto.').max(100, 'Podés modificar hasta 100 productos por vez.')

const bulkActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('state'), productIds: productIdsSchema, state: z.enum(['available', 'sold_out', 'hidden']) }),
  z.object({ action: z.literal('category'), productIds: productIdsSchema, categoryId: z.string().uuid().nullable() }),
  z.object({ action: z.literal('brand'), productIds: productIdsSchema, brandId: z.string().uuid().nullable() }),
  z.object({ action: z.literal('promotion_discount'), productIds: productIdsSchema, discountPercent: z.number().min(1).max(90) }),
  z.object({ action: z.literal('promotion_remove'), productIds: productIdsSchema }),
])

export type BulkProductActionInput = z.infer<typeof bulkActionSchema>

type UpdatedProduct = {
  id: string
  is_active?: boolean
  availability_status?: 'available' | 'sold_out'
  category_id?: string | null
  brand_id?: string | null
  price?: number
  compare_price?: number | null
}

function revalidateCatalog(storeSlug: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/catalogo')
  revalidatePath(`/tienda/${storeSlug}`)
}

async function ensureProductsBelongToStore(db: any, storeId: string, productIds: string[]) {
  const uniqueIds = [...new Set(productIds)]
  const { data, error } = await db
    .from('products')
    .select('id, price, compare_price')
    .eq('store_id', storeId)
    .in('id', uniqueIds)

  if (error) return { error: error.message, products: [] as any[] }
  if ((data?.length ?? 0) !== uniqueIds.length) {
    return { error: 'Uno de los productos ya no pertenece a esta tienda.', products: [] as any[] }
  }
  return { error: null, products: data ?? [] }
}

async function ensureRelatedEntity(db: any, table: 'categories' | 'brands', storeId: string, id: string | null) {
  if (!id) return null
  const { data, error } = await db.from(table).select('id').eq('id', id).eq('store_id', storeId).maybeSingle()
  if (error) return error.message
  if (!data) return table === 'categories' ? 'La categoría ya no existe.' : 'La marca ya no existe.'
  return null
}

export async function setProductOperationalState(productId: string, state: 'available' | 'sold_out' | 'hidden') {
  const parsed = z.object({ productId: z.string().uuid(), state: z.enum(['available', 'sold_out', 'hidden']) }).safeParse({ productId, state })
  if (!parsed.success) return { error: 'Estado inválido.' }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const patch = state === 'hidden'
    ? { is_active: false }
    : { is_active: true, availability_status: state === 'sold_out' ? 'sold_out' : 'available' }

  const { data, error } = await db
    .from('products')
    .update(patch)
    .eq('id', productId)
    .eq('store_id', store.id)
    .select('id, is_active, availability_status')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'El producto ya no existe.' }
  revalidateCatalog(store.slug)
  revalidatePath(`/admin/catalogo/${productId}`)
  return { success: true, product: data as UpdatedProduct }
}

export async function bulkUpdateProducts(input: BulkProductActionInput) {
  const validated = bulkActionSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten().formErrors[0] ?? 'Revisá la acción elegida.' }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any
  const productIds = [...new Set(validated.data.productIds)]
  const ownership = await ensureProductsBelongToStore(db, store.id, productIds)
  if (ownership.error) return { error: ownership.error }

  let updatedProducts: UpdatedProduct[] = []

  if (validated.data.action === 'state') {
    const patch = validated.data.state === 'hidden'
      ? { is_active: false }
      : { is_active: true, availability_status: validated.data.state === 'sold_out' ? 'sold_out' : 'available' }

    const { data, error } = await db
      .from('products')
      .update(patch)
      .eq('store_id', store.id)
      .in('id', productIds)
      .select('id, is_active, availability_status')
    if (error) return { error: error.message }
    updatedProducts = data ?? []
  }

  if (validated.data.action === 'category') {
    const relatedError = await ensureRelatedEntity(db, 'categories', store.id, validated.data.categoryId)
    if (relatedError) return { error: relatedError }
    const { data, error } = await db
      .from('products')
      .update({ category_id: validated.data.categoryId })
      .eq('store_id', store.id)
      .in('id', productIds)
      .select('id, category_id')
    if (error) return { error: error.message }
    updatedProducts = data ?? []
  }

  if (validated.data.action === 'brand') {
    const relatedError = await ensureRelatedEntity(db, 'brands', store.id, validated.data.brandId)
    if (relatedError) return { error: relatedError }
    const { data, error } = await db
      .from('products')
      .update({ brand_id: validated.data.brandId })
      .eq('store_id', store.id)
      .in('id', productIds)
      .select('id, brand_id')
    if (error) return { error: error.message }
    updatedProducts = data ?? []
  }

  if (validated.data.action === 'promotion_remove') {
    const changes = await Promise.all(ownership.products.map(async (product: any) => {
      const price = Number(product.price)
      const compare = product.compare_price === null ? null : Number(product.compare_price)
      const normalPrice = compare !== null && compare > price ? compare : price
      const { error } = await db
        .from('products')
        .update({ price: normalPrice, compare_price: null })
        .eq('store_id', store.id)
        .eq('id', product.id)
      return error ? { error: error.message } : { product: { id: product.id, price: normalPrice, compare_price: null } as UpdatedProduct }
    }))
    const failed = changes.find((change) => 'error' in change)
    if (failed && 'error' in failed) return { error: failed.error }
    updatedProducts = changes.flatMap((change) => 'product' in change ? [change.product] : [])
  }

  if (validated.data.action === 'promotion_discount') {
    const factor = 1 - validated.data.discountPercent / 100
    const changes = await Promise.all(ownership.products.map(async (product: any) => {
      const price = Number(product.price)
      const compare = product.compare_price === null ? null : Number(product.compare_price)
      const normalPrice = compare !== null && compare > price ? compare : price
      const promotionalPrice = Math.round(normalPrice * factor * 100) / 100
      const { error } = await db
        .from('products')
        .update({ price: promotionalPrice, compare_price: normalPrice })
        .eq('store_id', store.id)
        .eq('id', product.id)
      return error ? { error: error.message } : { product: { id: product.id, price: promotionalPrice, compare_price: normalPrice } as UpdatedProduct }
    }))
    const failed = changes.find((change) => 'error' in change)
    if (failed && 'error' in failed) return { error: failed.error }
    updatedProducts = changes.flatMap((change) => 'product' in change ? [change.product] : [])
  }

  revalidateCatalog(store.slug)
  return { success: true, updatedProducts }
}
