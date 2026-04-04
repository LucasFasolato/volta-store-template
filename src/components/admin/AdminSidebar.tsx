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
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[19rem] px-4 py-4 lg:block">
      <div className="admin-surface flex h-full flex-col rounded-[30px] p-4">
        <div className="admin-surface-muted rounded-[24px] p-4">
          <div className="flex items-center gap-3">
            <div className="admin-button-primary flex size-11 items-center justify-center rounded-2xl text-sm font-black">
              V
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold tracking-[-0.03em] text-white">{storeName}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-neutral-500">Admin workspace</p>
            </div>
          </div>
        </div>

        <div className="mt-6 px-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Workspace</p>
        </div>

        <nav className="mt-3 flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-[20px] px-3 py-3 text-sm transition',
                  active ? 'admin-surface-selected text-white' : 'admin-button-soft text-neutral-400 hover:text-white',
                )}
              >
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-2xl transition',
                    active ? 'bg-black/15 text-emerald-100' : 'bg-white/[0.04] text-neutral-500 group-hover:text-white',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                </div>
                <span className="flex-1 font-medium">{item.label}</span>
                {active ? <span className="size-1.5 rounded-full bg-emerald-200" /> : null}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-white/8 pt-4">
          <Link
            href={`/tienda/${storeSlug}`}
            target="_blank"
            className="admin-surface-elevated flex items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm text-white"
          >
            <div className="flex size-9 items-center justify-center rounded-2xl bg-black/15">
              <Store className="size-4 shrink-0" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">Ver tienda</p>
              <p className="text-xs text-white/68">Landing publica en produccion</p>
            </div>
            <ExternalLink className="ml-auto size-3.5" />
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="admin-button-soft flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-neutral-400 hover:border-red-400/14 hover:bg-red-400/10 hover:text-red-100"
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
