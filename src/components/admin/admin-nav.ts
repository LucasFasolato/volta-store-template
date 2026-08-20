import {
  CreditCard,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
} from 'lucide-react'

export type AdminNavItem = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/tienda', label: 'Apariencia', icon: Palette },
  { href: '/admin/catalogo', label: 'Productos', icon: Package },
  { href: '/admin/plan', label: 'Plan', icon: CreditCard },
  { href: '/admin/negocio', label: 'Configuración', icon: Settings },
]
