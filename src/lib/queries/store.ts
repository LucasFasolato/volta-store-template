import { createClient } from '@/lib/supabase/server'
import type { StorePublicData, AdminStoreData, ProductWithImages } from '@/types/store'
import { getOwnerStoreData } from '@/lib/server/store-context'

// Supabase nested select for products with all relations
const PRODUCT_SELECT = '*, images:product_images(*), category:categories(*), options:product_options(*)' as const

export async function getStoreBySlug(slug: string): Promise<StorePublicData | null> {
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!store) return null

  const [themeRes, layoutRes, contentRes, categoriesRes, productsRes] = await Promise.all([
    supabase.from('store_theme').select('*').eq('store_id', store.id).maybeSingle(),
    supabase.from('store_layout').select('*').eq('store_id', store.id).maybeSingle(),
    supabase.from('store_content').select('*').eq('store_id', store.id).maybeSingle(),
    supabase
      .from('categories')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order'),
    supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('sort_order')
      .order('sort_order', { referencedTable: 'product_images' })
      .order('sort_order', { referencedTable: 'product_options' }),
  ])

  if (!themeRes.data || !layoutRes.data || !contentRes.data) return null

  return {
    store,
    theme: themeRes.data,
    layout: layoutRes.data,
    content: contentRes.data,
    categories: categoriesRes.data ?? [],
    products: (productsRes.data ?? []) as ProductWithImages[],
  }
}

export async function getAdminStore(userId: string): Promise<AdminStoreData | null> {
  return getOwnerStoreData(userId)
}

export async function getAdminProducts(storeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', storeId)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'product_images' })
    .order('sort_order', { referencedTable: 'product_options' })
  return (data ?? []) as ProductWithImages[]
}

export async function getAdminCategories(storeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order')
  return data ?? []
}

export async function getAdminProductById(storeId: string, productId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('store_id', storeId)
    .order('sort_order', { referencedTable: 'product_images' })
    .order('sort_order', { referencedTable: 'product_options' })
    .maybeSingle()
  return data as ProductWithImages | null
}

export async function getProductBySlug(storeId: string, slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', storeId)
    .eq('slug', slug)
    .eq('is_active', true)
    .order('sort_order', { referencedTable: 'product_images' })
    .order('sort_order', { referencedTable: 'product_options' })
    .maybeSingle()
  return data as ProductWithImages | null
}
