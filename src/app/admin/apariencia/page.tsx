import { redirect } from 'next/navigation'
import { getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AppearanceEditor } from '@/components/admin/AppearanceEditor'

export default async function AparienciaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const storeData = await getAdminStore(user.id)
  if (!storeData) redirect('/login')

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        title="Apariencia"
        description="Fuentes, colores, diseño y secciones visibles de tu tienda."
      />
      <AppearanceEditor theme={storeData.theme} layout={storeData.layout} />
    </div>
  )
}
