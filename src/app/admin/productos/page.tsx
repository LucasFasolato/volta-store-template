import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getAdminCategories, getAdminProducts, getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductList } from '@/components/admin/ProductList'
import { Button } from '@/components/ui/button'

export default async function ProductosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const storeData = await getAdminStore(user.id)
  if (!storeData) redirect('/login')

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
