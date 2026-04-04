import { redirect } from 'next/navigation'
import { ensureOnboarding } from '@/lib/actions/onboarding'
import { getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MobileAdminNav } from '@/components/admin/MobileAdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await ensureOnboarding(user)

  const storeData = await getAdminStore(user.id)
  if (!storeData) redirect('/login')

  return (
    <div className="admin-gradient admin-shell min-h-screen">
      <AdminSidebar storeName={storeData.store.name} storeSlug={storeData.store.slug} />

      <div className="relative z-10 lg:pl-[19rem]">
        <main className="min-h-screen pb-28 lg:pb-10">{children}</main>
      </div>

      <MobileAdminNav />
    </div>
  )
}
