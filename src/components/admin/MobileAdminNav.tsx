'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_ITEMS } from '@/components/admin/admin-nav'
import { cn } from '@/lib/utils'

export function MobileAdminNav() {
  const pathname = usePathname()

  return (
    <nav className="safe-area-pb admin-surface fixed inset-x-2.5 bottom-2.5 z-40 rounded-[18px] p-1.5 lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {ADMIN_NAV_ITEMS.map((item) => {
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
