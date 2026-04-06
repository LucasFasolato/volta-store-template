import { getAdminCategories } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CategoriasList } from '@/components/admin/CategoriasList'

export default async function CategoriasPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const categories = await getAdminCategories(storeData.store.id)

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        title="Categorias"
        description="Ordena el catalogo para mejorar lectura, filtros y conversion desde mobile."
      />
      <div className="max-w-4xl">
        <CategoriasList categories={categories} />
      </div>
    </div>
  )
}
