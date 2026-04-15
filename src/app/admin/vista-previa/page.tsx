import { StoreLayout } from '@/components/landing/StoreLayout'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'

type Props = {
  searchParams: Promise<{ categoria?: string; producto?: string }>
}

export default async function AdminPreviewPage({ searchParams }: Props) {
  const { storeData } = await requireAuthenticatedAdminStore()
  const { categoria, producto } = await searchParams

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  return (
    <StoreLayout
      data={{
        store: storeData.store,
        theme: storeData.theme,
        layout: storeData.layout,
        content: storeData.content,
        categories,
        products: products.filter((product) => product.is_active),
      }}
      activeCategory={categoria}
      activeProduct={producto}
    />
  )
}
