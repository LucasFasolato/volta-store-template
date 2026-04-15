import { StoreLayout } from '@/components/landing/StoreLayout'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { resolveStorefrontView, type StorefrontSearchParams } from '@/lib/storefront/view'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'

type Props = {
  searchParams: Promise<StorefrontSearchParams>
}

export default async function AdminPreviewPage({ searchParams }: Props) {
  const { storeData } = await requireAuthenticatedAdminStore()
  const storefrontSearchParams = await searchParams

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const data = {
    store: storeData.store,
    theme: storeData.theme,
    layout: storeData.layout,
    content: storeData.content,
    categories,
    products: products.filter((product) => product.is_active),
  }
  const view = resolveStorefrontView(data.products, data.categories, storefrontSearchParams)

  return (
    <StoreLayout
      data={data}
      pathname="/admin/vista-previa"
      view={view}
    />
  )
}
