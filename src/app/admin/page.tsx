import Link from 'next/link'
import {
  ArrowRight,
  ExternalLink,
  FileText,
  MessageCircle,
  Package,
  Palette,
  Tag,
  TrendingUp,
} from 'lucide-react'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const activeProducts = products.filter((p) => p.is_active)
  const featuredProducts = products.filter((p) => p.is_featured)
  const isConfigured = Boolean(storeData.store.whatsapp)

  const quickActions = [
    {
      href: '/admin/productos/nuevo',
      icon: Package,
      label: 'Agregar producto',
      description: 'Carga una nueva pieza al catálogo.',
    },
    {
      href: '/admin/apariencia',
      icon: Palette,
      label: 'Personalizar diseño',
      description: 'Colores, tipografía y jerarquía.',
    },
    {
      href: '/admin/contenido',
      icon: FileText,
      label: 'Editar contenido',
      description: 'Hero, textos y tono de conversión.',
    },
  ]

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      {/* Compact header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="admin-label">{storeData.store.name}</p>
          <h1 className="mt-2 font-heading text-[1.75rem] font-semibold tracking-[-0.055em] text-white">
            Resumen
          </h1>
        </div>
        <Link
          href={`/tienda/${storeData.store.slug}`}
          target="_blank"
          className="flex shrink-0 items-center gap-2 rounded-[18px] border border-emerald-300/30 bg-[linear-gradient(135deg,rgba(46,230,166,0.16),rgba(111,243,223,0.08))] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-150 hover:bg-[linear-gradient(135deg,rgba(46,230,166,0.22),rgba(111,243,223,0.12))] hover:shadow-[0_0_28px_rgba(16,185,129,0.2)]"
        >
          Ver tienda
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* WhatsApp warning */}
      {!isConfigured ? (
        <Link
          href="/admin/configuracion"
          className="flex items-center gap-3 rounded-[20px] border border-amber-300/14 bg-amber-400/6 px-4 py-3 transition hover:bg-amber-400/10"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
            <MessageCircle className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-100">Falta configurar WhatsApp</p>
            <p className="text-xs text-amber-100/60">
              Sin este dato no podés convertir visitas en pedidos.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-amber-200/50" />
        </Link>
      ) : null}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Productos activos"
          value={activeProducts.length}
          icon={Package}
          href="/admin/productos"
        />
        <StatCard
          label="Destacados"
          value={featuredProducts.length}
          icon={TrendingUp}
          href="/admin/productos"
        />
        <StatCard
          label="Categorías"
          value={categories.length}
          icon={Tag}
          href="/admin/categorias"
        />
        <StatCard
          label="Total"
          value={products.length}
          icon={Package}
          href="/admin/productos"
        />
      </section>

      {/* Main 2-col */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Quick actions */}
        <section className="admin-surface rounded-[24px] p-4 sm:p-5">
          <div className="mb-4">
            <p className="admin-label">Accesos rápidos</p>
            <h2 className="mt-1.5 text-base font-semibold text-white">Operaciones frecuentes</h2>
          </div>
          <div className="space-y-1.5">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group admin-button-soft flex items-center gap-3 rounded-[18px] px-4 py-3 transition duration-150"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/6 text-emerald-200 transition-colors duration-150 group-hover:bg-emerald-400/12">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-xs text-neutral-500">{action.description}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-white/16 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white/50" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* Config */}
        <section className="admin-surface rounded-[24px] p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="admin-label">Tu tienda</p>
              <h2 className="mt-1.5 text-base font-semibold text-white">Configuración actual</h2>
            </div>
            <Link
              href="/admin/configuracion"
              className="shrink-0 text-xs font-medium text-emerald-300 transition hover:text-white"
            >
              Editar todo
            </Link>
          </div>

          <div className="divide-y divide-white/6">
            <InfoRow
              label="Nombre"
              value={storeData.store.name}
              href="/admin/configuracion"
              action="Editar"
            />
            <InfoRow
              label="URL"
              value={`/tienda/${storeData.store.slug}`}
              href="/admin/configuracion"
              action="Editar"
            />
            <InfoRow
              label="WhatsApp"
              value={storeData.store.whatsapp ?? 'Pendiente'}
              empty={!storeData.store.whatsapp}
              href="/admin/configuracion"
              action="Editar"
            />
            <InfoRow
              label="Instagram"
              value={
                storeData.store.instagram ? `@${storeData.store.instagram}` : 'Opcional'
              }
              empty={!storeData.store.instagram}
              href="/admin/configuracion"
              action="Editar"
            />
            <InfoRow
              label="Horarios"
              value={storeData.store.hours ?? 'Opcional'}
              empty={!storeData.store.hours}
              href="/admin/configuracion"
              action="Editar"
            />
            <InfoRow label="Estado">
              <Badge
                variant={storeData.store.is_active ? 'default' : 'secondary'}
                className={
                  storeData.store.is_active
                    ? 'border-0 bg-emerald-400/14 text-emerald-100'
                    : 'border-0 bg-white/10 text-neutral-300'
                }
              >
                {storeData.store.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </InfoRow>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: number
  icon: React.ElementType
  href: string
}) {
  return (
    <Link
      href={href}
      className="group admin-surface rounded-[20px] p-4 transition duration-150 hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_22px_52px_rgba(2,6,23,0.34)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex size-8 items-center justify-center rounded-xl bg-white/6 text-neutral-400 transition-colors duration-150 group-hover:bg-white/8">
          <Icon className="size-4" />
        </div>
        <ArrowRight className="size-3.5 text-white/16 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white/45" />
      </div>
      <p className="text-[1.65rem] font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </Link>
  )
}

function InfoRow({
  label,
  value,
  empty,
  href,
  action,
  children,
}: {
  label: string
  value?: string
  empty?: boolean
  href?: string
  action?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <p className="w-[4.5rem] shrink-0 text-[11px] font-medium text-neutral-600">{label}</p>
      <div className="min-w-0 flex-1">
        {children ?? (
          <p
            className={cn(
              'truncate text-sm',
              empty ? 'text-neutral-600' : 'font-medium text-neutral-100',
            )}
          >
            {value}
          </p>
        )}
      </div>
      {href && action ? (
        <Link
          href={href}
          className="shrink-0 text-xs text-neutral-500 transition duration-150 hover:text-emerald-300"
        >
          {action}
        </Link>
      ) : null}
    </div>
  )
}
