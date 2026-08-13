'use client'

import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MobileAdminNav } from '@/components/admin/MobileAdminNav'

export function AdminShell({ children, storeName }: { children: React.ReactNode; storeName: string }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin/vista-previa')) return <>{children}</>

  return <div className="admin-gradient admin-shell min-h-screen">
    <AdminSidebar storeName={storeName} />
    <div className="relative z-10 lg:pl-[232px]"><main className="min-h-screen pb-32 lg:pb-10">{children}</main></div>
    <MobileAdminNav />
  </div>
}
