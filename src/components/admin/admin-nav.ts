import {
  BriefcaseBusiness,
  LayoutDashboard,
  Package,
  Store,
} from 'lucide-react'

export type AdminNavItem = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/catalogo', label: 'Catalogo', icon: Package },
  { href: '/admin/tienda', label: 'Tienda', icon: Store },
  { href: '/admin/negocio', label: 'Negocio', icon: BriefcaseBusiness },
]
