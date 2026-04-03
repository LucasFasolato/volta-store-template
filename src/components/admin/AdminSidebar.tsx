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
    <aside className="admin-gradient fixed inset-y-0 left-0 hidden w-72 px-4 py-4 lg:block">
      <div className="surface-panel premium-ring flex h-full flex-col rounded-[34px] border border-white/8 p-4">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-2xl text-base font-black"
              style={{
                background: 'linear-gradient(145deg, #34d399, #5eead4)',
                color: '#04130e',
                boxShadow: '0 18px 36px rgba(52, 211, 153, 0.24)',
              }}
            >
              V
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-[15px] font-semibold tracking-[-0.03em] text-white">{storeName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">Control premium</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Workspace</p>
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
                  'group flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition',
                  active
                    ? 'border border-emerald-300/20 bg-emerald-400/10 text-white shadow-[0_18px_40px_rgba(16,185,129,0.08)]'
                    : 'border border-transparent text-neutral-400 hover:border-white/8 hover:bg-white/[0.045] hover:text-white',
                )}
              >
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-2xl transition',
                    active ? 'bg-emerald-400/14 text-emerald-200' : 'bg-white/[0.035] text-neutral-500 group-hover:text-white',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                </div>
                <span className="flex-1">{item.label}</span>
                {active ? <span className="size-1.5 rounded-full bg-emerald-300" /> : null}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-white/8 pt-4">
          <Link
            href={`/tienda/${storeSlug}`}
            target="_blank"
            className="flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-3 text-sm text-neutral-300 transition hover:border-white/8 hover:bg-white/[0.045] hover:text-white"
          >
            <Store className="size-4 shrink-0" />
            Ver tienda
            <ExternalLink className="ml-auto size-3.5" />
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-[20px] border border-transparent px-4 py-3 text-sm text-neutral-400 transition hover:border-red-400/10 hover:bg-red-400/10 hover:text-red-200"
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
