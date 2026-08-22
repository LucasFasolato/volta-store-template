import { GrowthSharePage } from '@/components/admin/GrowthSharePage'
import { getStoreCommercialAccess } from '@/lib/billing/commercial-access'
import { buildProductPublicUrl, buildStorePublicUrl, buildStoreShareMessage } from '@/lib/sharing/links'
import { getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { formatCurrency } from '@/lib/utils/format'

export default async function SharePage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const { store } = storeData
  const [products, commercialAccess] = await Promise.all([
    getAdminProducts(store.id),
    getStoreCommercialAccess(store.id),
  ])
  const storeUrl = buildStorePublicUrl(store.slug)
  const activeProducts = products
    .filter((product) => product.is_active)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      url: buildProductPublicUrl(store.slug, product.slug),
      imageUrl: product.images[0]?.url ?? null,
      priceLabel: formatCurrency(product.price),
    }))

  return (
    <GrowthSharePage
      storeName={store.name}
      storeUrl={storeUrl}
      storeMessage={buildStoreShareMessage(store.name, storeUrl)}
      products={activeProducts}
      planCode={commercialAccess.planCode}
    />
  )
}
