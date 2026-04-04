import { redirect } from 'next/navigation'
import { getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ContentForm } from '@/components/admin/ContentForm'

export default async function ContenidoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const storeData = await getAdminStore(user.id)
  if (!storeData) redirect('/login')

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Contenido"
        description="Ajusta el mensaje comercial y la imagen principal para que la tienda convierta mejor."
      />
      <ContentForm content={storeData.content} store={storeData.store} />
    </div>
  )
}
