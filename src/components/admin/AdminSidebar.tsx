'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye, LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '@/components/admin/admin-nav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export function AdminSidebar({ storeName }: { storeName: string }) {
  const pathname = usePathname()
  const isActive = (item: AdminNavItem) => item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return <aside className="admin-sidebar fixed inset-y-0 left-0 z-30 hidden w-[232px] p-3 lg:block"><div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-white/8 bg-[#10161d] text-white shadow-xl">
    <div className="px-5 pb-4 pt-5"><Link href="/admin" className="admin-sidebar-brand inline-flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-[9px] bg-white shadow-[0_6px_18px_rgba(0,0,0,.16)]"><Image src="/brand/volta-mark.svg" alt="" width={26} height={26} priority className="size-6" /></span><span className="text-[15px] font-semibold">VOLTA</span></Link></div>
    <nav className="flex-1 space-y-1 px-3 pt-2">{ADMIN_NAV_ITEMS.map((item) => { const Icon = item.icon; const active = isActive(item); return <Link key={item.href} href={item.href} data-active={active ? 'true' : 'false'} className={cn('admin-sidebar-nav-link group flex h-10 items-center gap-3 rounded-[9px] px-3 text-[13px] font-medium transition', active ? 'bg-white/[0.09] text-white' : 'text-white/58 hover:bg-white/[0.055] hover:text-white')}><Icon className={cn('size-[15px]', active ? 'text-[#12e89a]' : 'text-white/44')} /><span className="flex-1">{item.label}</span>{active ? <span className="size-1.5 rounded-full bg-[#12e89a]" /> : null}</Link> })}</nav>
    <div className="px-3 pb-3"><Link href="/admin/vista-previa" className="mb-3 flex h-10 items-center justify-between rounded-[9px] bg-[#12e89a] px-3.5 text-[13px] font-semibold text-[#062117]"><span>Ver mi tienda</span><Eye className="size-3.5" /></Link><div className="border-t border-white/8 pt-3"><div className="mb-2 px-2"><p className="admin-sidebar-store-name truncate text-[12px] font-medium text-white/90">{storeName}</p><p className="admin-sidebar-store-meta mt-0.5 text-[10px] text-white/38">Administración</p></div><ThemeToggle variant="sidebar" /><form action={signOut}><button type="submit" className="admin-sidebar-signout mt-1 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-[12px] text-white/46"><LogOut className="size-3.5" />Salir</button></form></div></div>
  </div></aside>
}
