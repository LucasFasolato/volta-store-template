'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  LogOut,
  Store,
} from 'lucide-react'
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
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] px-3 py-3 lg:block">
      <div className="admin-surface flex h-full flex-col rounded-xl p-3">
        {/* Brand */}
        <div className="admin-surface-muted rounded-lg px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="admin-button-primary flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black">
              V
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{storeName}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>

        <div className="admin-surface-selected mt-2.5 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
            Vista publica
          </p>
          <Link
            href="/admin/vista-previa"
            target="_blank"
            className="admin-button-primary mt-2.5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_18px_38px_rgba(16,185,129,0.22)] transition hover:shadow-[0_0_28px_rgba(52,211,153,0.38)]"
          >
            <Store className="size-4.5 shrink-0" />
            <span className="flex-1">Ver tienda</span>
            <ExternalLink className="size-4 shrink-0 opacity-80" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="mt-3.5 flex-1 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition duration-150',
                  active
                    ? 'admin-surface-selected font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0',
                    active ? 'text-emerald-500' : 'text-muted-foreground',
                  )}
                />
                <span>{item.label}</span>
                {active ? (
                  <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-1.5 border-t border-border pt-3">
          <ThemeToggle variant="sidebar" />

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-red-400/8 hover:text-red-500"
            >
              <LogOut className="size-4 shrink-0" />
              Salir
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
