'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '@/components/admin/admin-nav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

type AdminSidebarProps = {
  storeName: string
}

export function AdminSidebar({ storeName }: AdminSidebarProps) {
  const pathname = usePathname()

  function isActive(item: AdminNavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] p-3 lg:block">
      <div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-white/8 bg-[#10161d] text-white shadow-[0_18px_48px_rgba(15,23,42,.14)]">
        <div className="px-5 pb-4 pt-5">
          <Link href="/admin" className="inline-flex items-center gap-2.5" aria-label="Ir al resumen">
            <span className="flex size-7 items-center justify-center rounded-[8px] bg-[#12e89a] text-[11px] font-black text-[#062117]">V</span>
            <span className="text-[15px] font-semibold tracking-[-0.03em]">VOLTA</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 pt-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex h-10 items-center gap-3 rounded-[9px] px-3 text-[13px] font-medium transition duration-150',
                  active
                    ? 'bg-white/[0.09] text-white'
                    : 'text-white/58 hover:bg-white/[0.055] hover:text-white',
                )}
              >
                <Icon className={cn('size-[15px] shrink-0', active ? 'text-[#12e89a]' : 'text-white/44 group-hover:text-white/70')} />
                <span className="flex-1">{item.label}</span>
                {active ? <span className="size-1.5 rounded-full bg-[#12e89a]" /> : null}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-3">
          <Link
            href="/admin/vista-previa"
            target="_blank"
            className="mb-3 flex h-10 items-center justify-between rounded-[9px] bg-[#12e89a] px-3.5 text-[13px] font-semibold text-[#062117] transition hover:bg-[#0fd98f]"
          >
            <span>Ver tienda</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <div className="border-t border-white/8 pt-3">
            <div className="mb-2 px-2">
              <p className="truncate text-[12px] font-medium text-white/90">{storeName}</p>
              <p className="mt-0.5 text-[10px] text-white/38">Administración</p>
            </div>
            <ThemeToggle variant="sidebar" />
            <form action={signOut}>
              <button
                type="submit"
                className="mt-1 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-[12px] text-white/46 transition hover:bg-white/[0.05] hover:text-red-300"
              >
                <LogOut className="size-3.5" />
                Salir
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}
