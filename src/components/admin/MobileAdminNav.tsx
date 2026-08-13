'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_ITEMS } from '@/components/admin/admin-nav'
import { cn } from '@/lib/utils'

const ITEMS = [
  { ...ADMIN_NAV_ITEMS.find((item) => item.href === '/admin')!, label: 'Inicio' },
  { ...ADMIN_NAV_ITEMS.find((item) => item.href === '/admin/catalogo')!, label: 'Productos' },
  { ...ADMIN_NAV_ITEMS.find((item) => item.href === '/admin/tienda')!, label: 'Diseño' },
  { ...ADMIN_NAV_ITEMS.find((item) => item.href === '/admin/negocio')!, label: 'Más' },
]

export function MobileAdminNav() {
  const pathname = usePathname()
  return (
    <nav className="mobile-admin-nav safe-area-pb fixed inset-x-2.5 bottom-2.5 z-50 lg:hidden" aria-label="Navegación principal">
      <div className="grid grid-cols-4 gap-1 rounded-[16px] border border-black/8 bg-white/96 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111820]/96">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} data-active={active ? 'true' : 'false'} aria-current={active ? 'page' : undefined} className={cn('mobile-admin-nav-link flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-[10px] font-semibold transition', active ? 'bg-[#10161d] text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-white/50')}>
              <Icon className={cn('size-4', active && 'text-[#12e89a]')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
