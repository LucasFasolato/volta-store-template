import { redirect } from 'next/navigation'
import { getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { ThemeForm } from '@/components/admin/ThemeForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        description="Colores, tipografia, layout y detalles que hacen que la tienda se vea mas cara y mas clara."
      />

      <Tabs defaultValue="tema" className="space-y-6">
        <TabsList className="h-auto rounded-full border border-white/8 bg-white/5 p-1">
          <TabsTrigger value="tema" className="rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white">
            Tema
          </TabsTrigger>
          <TabsTrigger value="layout" className="rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white">
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tema">
          <ThemeForm theme={storeData.theme} />
        </TabsContent>

        <TabsContent value="layout">
          <LayoutForm layout={storeData.layout} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
