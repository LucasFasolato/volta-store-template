import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminCategories } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/button'

export default async function NuevoProductoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const categories = await getAdminCategories(storeData.store.id)

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-5 rounded-full text-muted-foreground hover:text-foreground dark:hover:text-white">
        <Link href="/admin/catalogo">
          <ArrowLeft className="mr-1.5 size-4" />
          Catalogo
        </Link>
      </Button>

      <AdminPageHeader
        eyebrow="Catalogo"
        title="Nuevo producto"
        description="Carga nombre, precio, portada y opciones en el mismo flujo. Lo avanzado queda guardado para despues."
      />

      <div className="max-w-4xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
