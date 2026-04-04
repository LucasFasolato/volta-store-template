import { redirect } from 'next/navigation'
import { getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
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
        title="Configuracion"
        description="Datos de negocio que impactan la confianza de la tienda y el mensaje final de WhatsApp."
      />
      <div className="max-w-[1200px]">
        <ConfigForm store={storeData.store} />
      </div>
    </div>
  )
}
