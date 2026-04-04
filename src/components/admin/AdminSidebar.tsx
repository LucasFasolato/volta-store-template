'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Palette,
  Settings,
  Store,
  Tag,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/apariencia', label: 'Apariencia', icon: Palette },
  { href: '/admin/contenido', label: 'Contenido', icon: FileText },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag },
  { href: '/admin/configuracion', label: 'Configuracion', icon: Settings },
]

type AdminSidebarProps = {
  storeName: string
  storeSlug: string
}

export function AdminSidebar({ storeName, storeSlug }: AdminSidebarProps) {
  const pathname = usePathname()

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] px-3 py-3 lg:block">
      <div className="admin-surface flex h-full flex-col rounded-[26px] p-3">
        {/* Brand */}
        <div className="admin-surface-muted rounded-[20px] px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="admin-button-primary flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black">
              V
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{storeName}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-sm transition',
                  active
                    ? 'admin-surface-selected font-medium text-white'
                    : 'text-neutral-400 hover:bg-white/[0.045] hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0',
                    active ? 'text-emerald-200' : 'text-neutral-500',
                  )}
                />
                <span>{item.label}</span>
                {active ? (
                  <span className="ml-auto size-1.5 rounded-full bg-emerald-200" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-1.5 border-t border-white/8 pt-3">
          <Link
            href={`/tienda/${storeSlug}`}
            target="_blank"
            className="admin-surface-elevated flex items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-sm font-medium text-white transition hover:brightness-105"
          >
            <Store className="size-4 shrink-0" />
            <span className="flex-1">Ver tienda</span>
            <ExternalLink className="size-3.5 text-white/50" />
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-sm text-neutral-500 transition hover:bg-red-400/8 hover:text-red-300"
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
