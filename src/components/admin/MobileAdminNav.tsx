'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      for (const item of ITEMS) router.prefetch(item.href)
    }, 80)
    return () => window.clearTimeout(timeout)
  }, [router])

  return (
    <nav className="mobile-admin-nav safe-area-pb fixed inset-x-2.5 bottom-2.5 z-50 lg:hidden" aria-label="Navegación principal">
      <div className="grid grid-cols-4 gap-1 rounded-[16px] border border-black/8 bg-white/96 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111820]/96">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const routeActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const active = pendingHref ? pendingHref === item.href : routeActive
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onTouchStart={() => router.prefetch(item.href)}
              onPointerEnter={() => router.prefetch(item.href)}
              onClick={() => setPendingHref(item.href)}
              data-active={active ? 'true' : 'false'}
              aria-current={routeActive ? 'page' : undefined}
              className={cn(
                'mobile-admin-nav-link flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-[10px] font-semibold transition-colors duration-100',
                active ? 'bg-[#10161d] text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-white/50',
              )}
            >
              <Icon className={cn('size-4', active && 'text-[#12e89a]')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
