import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StoreLayout } from '@/components/landing/StoreLayout'
import { getAdminBrands, getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { resolveStorefrontView, type StorefrontSearchParams } from '@/lib/storefront/view'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import type { StorePublicData } from '@/types/store'

type Props = { searchParams: Promise<StorefrontSearchParams> }

export default async function AdminPreviewPage({ searchParams }: Props) {
  const { storeData } = await requireAuthenticatedAdminStore()
  const storefrontSearchParams = await searchParams
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
    getAdminBrands(storeData.store.id),
  ])
  const rawLayout = storeData.layout as typeof storeData.layout & {
    catalog_mode?: 'all' | 'sections' | 'navigation'
    show_catalog_search?: boolean
    show_catalog_brands?: boolean
  }
  const data: StorePublicData = {
    store: storeData.store,
    theme: storeData.theme,
    layout: {
      ...rawLayout,
      catalog_mode: rawLayout.catalog_mode ?? 'all',
      show_catalog_search: rawLayout.show_catalog_search ?? true,
      show_catalog_brands: rawLayout.show_catalog_brands ?? false,
    },
    content: storeData.content,
    categories,
    brands,
    products: products.filter((product) => product.is_active),
  }
  const view = resolveStorefrontView(data.products, data.categories, data.brands, storefrontSearchParams)

  return (
    <div className="admin-preview-shell pt-12">
      <div className="fixed inset-x-0 top-0 z-[70] flex h-12 items-center justify-between bg-[#10161d] px-3 text-white shadow-lg sm:px-5">
        <span className="text-sm font-semibold">Estás viendo tu tienda</span>
        <Link href="/admin/tienda" className="inline-flex min-h-9 items-center gap-2 rounded-[8px] bg-white px-3 text-xs font-semibold text-slate-950"><ArrowLeft className="size-3.5" />Volver a editar</Link>
      </div>
      <StoreLayout data={data} pathname="/admin/vista-previa" view={view} />
    </div>
  )
}
