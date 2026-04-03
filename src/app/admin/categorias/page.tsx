import { redirect } from 'next/navigation'
import { getAdminCategories, getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CategoriasList } from '@/components/admin/CategoriasList'

export default async function CategoriasPage() {
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
