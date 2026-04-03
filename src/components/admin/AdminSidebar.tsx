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
    <aside className="admin-gradient fixed inset-y-0 left-0 hidden w-72 border-r border-white/6 px-4 py-4 lg:block">
      <div className="surface-panel premium-ring flex h-full flex-col rounded-[32px] p-4">
        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400 text-base font-black text-black">
              V
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{storeName}</p>
              <p className="mt-1 text-xs text-neutral-500">Panel premium de administracion</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition',
                  active
                    ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-white/8 pt-4">
          <Link
            href={`/tienda/${storeSlug}`}
            target="_blank"
            className="flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
          >
            <Store className="size-4 shrink-0" />
            Ver tienda
            <ExternalLink className="ml-auto size-3.5" />
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-neutral-400 transition hover:bg-red-400/10 hover:text-red-300"
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
