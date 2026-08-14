import { createClient } from '@/lib/supabase/server'
import type { StorePublicData, AdminStoreData, ProductWithImages, Category } from '@/types/store'
import { getOwnerStoreData } from '@/lib/server/store-context'

const PRODUCT_SELECT = '*, images:product_images(*), category:categories(*), options:product_options(*)' as const

function categoryKey(category: Pick<Category, 'name'>) {
  return category.name.trim().toLocaleLowerCase('es')
}

function uniqueCategories(categories: Category[]) {
  const seen = new Set<string>()
  return categories.filter((category) => {
    const key = categoryKey(category)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
    supabase.from('categories').select('*').eq('store_id', store.id).order('sort_order'),
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
    categories: uniqueCategories((categoriesRes.data ?? []) as Category[]),
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

  const categories = (data ?? []) as Category[]
  const canonicalByName = new Map<string, Category>()

  for (const category of categories) {
    const key = categoryKey(category)
    const canonical = canonicalByName.get(key)
    if (!canonical) {
      canonicalByName.set(key, category)
      continue
    }

    await supabase
      .from('products')
      .update({ category_id: canonical.id })
      .eq('store_id', storeId)
      .eq('category_id', category.id)

    await supabase
      .from('categories')
      .delete()
      .eq('store_id', storeId)
      .eq('id', category.id)
  }

  return Array.from(canonicalByName.values())
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
