import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminCategories, getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/button'

export default async function NuevoProductoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const storeData = await getAdminStore(user.id)
  if (!storeData) redirect('/login')

  const categories = await getAdminCategories(storeData.store.id)

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-5 rounded-full text-neutral-400 hover:text-white">
        <Link href="/admin/productos">
          <ArrowLeft className="mr-1.5 size-4" />
          Productos
        </Link>
      </Button>

      <AdminPageHeader
        title="Nuevo producto"
        description="Carga la informacion principal. Luego podras sumar imagenes y terminar de pulir la ficha."
      />

      <div className="max-w-4xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
