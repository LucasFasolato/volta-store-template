'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Palette, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_NAV = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/apariencia', label: 'Apariencia', icon: Palette },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/configuracion', label: 'Config', icon: Settings },
]

export function MobileAdminNav() {
  const pathname = usePathname()

  return (
    <nav className="safe-area-pb admin-surface fixed inset-x-2.5 bottom-2.5 z-40 rounded-[18px] p-1.5 lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 text-[10px] font-medium transition sm:text-[11px]',
                active ? 'admin-surface-selected text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-3.5 sm:size-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
