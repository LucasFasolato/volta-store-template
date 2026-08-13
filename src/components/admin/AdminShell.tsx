'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MobileAdminNav } from '@/components/admin/MobileAdminNav'

export function AdminShell({ children, storeName }: { children: React.ReactNode; storeName: string }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin/vista-previa')) return <>{children}</>

  return (
    <div className="admin-gradient admin-shell min-h-screen">
      <AdminSidebar storeName={storeName} />
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-black/7 bg-white/95 px-4 backdrop-blur-xl dark:border-white/8 dark:bg-[#10161d]/95 lg:hidden">
        <span className="min-w-0 truncate text-sm font-semibold text-foreground">{storeName}</span>
        <Link href="/admin/vista-previa" className="ux-dark-button inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[9px] bg-[#10161d] px-3 text-xs font-semibold">
          <Eye className="size-4 text-[#12e89a]" />
          Ver mi tienda
        </Link>
      </div>
      <div className="relative z-10 lg:pl-[232px]"><main className="min-h-screen pb-24 lg:pb-10">{children}</main></div>
      <MobileAdminNav />
    </div>
  )
}
