'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Palette, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_NAV = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/apariencia', label: 'Diseno', icon: Palette },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/configuracion', label: 'Config', icon: Settings },
]

export function MobileAdminNav() {
  const pathname = usePathname()

  return (
    <nav className="safe-area-pb fixed inset-x-3 bottom-3 z-40 rounded-[26px] border border-white/8 bg-neutral-950/88 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-medium transition',
                active ? 'bg-emerald-400/12 text-emerald-200' : 'text-neutral-500',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
