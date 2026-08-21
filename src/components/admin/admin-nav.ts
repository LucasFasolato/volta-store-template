import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Share2,
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
  { href: '/admin/compartir', label: 'Compartir', icon: Share2 },
  { href: '/admin/rendimiento', label: 'Rendimiento', icon: BarChart3 },
  { href: '/admin/plan', label: 'Plan', icon: CreditCard },
  { href: '/admin/negocio', label: 'Configuración', icon: Settings },
]
