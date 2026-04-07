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
  Upload,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
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
  { href: '/admin/importar', label: 'Importar CSV', icon: Upload },
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

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
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
          <Link
            href={`/tienda/${storeSlug}`}
            target="_blank"
            className="admin-surface-elevated flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition duration-150 hover:brightness-105"
          >
            <Store className="size-4 shrink-0" />
            <span className="flex-1">Ver tienda</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </Link>

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
