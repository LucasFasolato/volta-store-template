import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductList } from '@/components/admin/ProductList'
import { Button } from '@/components/ui/button'

export default async function ProductosPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        title="Productos"
        description={`${products.length} producto${products.length !== 1 ? 's' : ''} cargados en tu catalogo.`}
        action={
          <Button asChild className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300">
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 size-4" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <ProductList products={products} categories={categories} />
    </div>
  )
}
