import type { ElementType } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ExternalLink,
  FileText,
  MessageCircle,
  Package,
  Palette,
  Store,
  Tag,
  TrendingUp,
} from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { LaunchChecklist } from '@/components/admin/LaunchChecklist'
import { StoreReadinessSummary } from '@/components/admin/StoreReadinessSummary'
import { StoreSharePanel } from '@/components/admin/StoreSharePanel'
import { Badge } from '@/components/ui/badge'
import { buildStoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { cn } from '@/lib/utils'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const activeProducts = products.filter((product) => product.is_active)
  const featuredProducts = products.filter((product) => product.is_featured)
  const plan = buildStoreLaunchPlan({ storeData, categories, products })

  const quickActions = [
    {
      href: '/admin/productos/nuevo',
      icon: Package,
      label: 'Agregar producto',
      description: 'Suma una nueva pieza al catalogo y hazlo ver mas completo.',
    },
    {
      href: '/admin/configuracion#section-contacto',
      icon: MessageCircle,
      label: 'Completar datos',
      description: 'Ajusta WhatsApp, Instagram, horarios y direccion.',
    },
    {
      href: '/admin/contenido#section-copy',
      icon: FileText,
      label: 'Afinar portada',
      description: 'Mejora el mensaje principal y lo que ve primero tu cliente.',
    },
    {
      href: '/admin/apariencia',
      icon: Palette,
      label: 'Pulir diseno',
      description: 'Colores, tipografias y detalles visuales de la tienda.',
    },
  ]

  const nextActionCopy =
    plan.state === 'ready'
      ? 'Ya esta todo lo esencial. Ahora toca moverla y empezar a recibir visitas.'
      : plan.state === 'almost_ready'
        ? 'Estas en el ultimo tramo. Cierra este punto y la tienda queda lista para compartir con mas confianza.'
        : 'Empieza por aqui para destrabar la salida de tu tienda y volver todo mucho mas claro.'

  return (
    <div className="space-y-5 p-4 sm:p-5 lg:p-6">
      <AdminPageHeader
        title="Activacion"
        description="Desde aqui ves que falta, cual es el siguiente mejor paso y cuando la tienda ya esta lista para compartir."
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <StoreReadinessSummary plan={plan} />
        <StoreSharePanel plan={plan} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <LaunchChecklist plan={plan} />

        <div className="space-y-4">
          <section className="admin-surface rounded-[30px] p-5">
            <p className="admin-label">Siguiente mejor paso</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{plan.nextBestAction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">{nextActionCopy}</p>
            <Link
              href={plan.nextBestAction.href}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-emerald-300/24 bg-[linear-gradient(135deg,rgba(46,230,166,0.16),rgba(111,243,223,0.08))] px-4 text-sm font-semibold text-white transition hover:bg-[linear-gradient(135deg,rgba(46,230,166,0.22),rgba(111,243,223,0.12))]"
            >
              {plan.nextBestAction.label}
              <ArrowRight className="size-4" />
            </Link>
          </section>

          <section className="admin-surface rounded-[30px] p-5">
            <div className="mb-4">
              <p className="admin-label">Resumen rapido</p>
              <h2 className="mt-2 text-base font-semibold text-white">Como se ve hoy tu tienda</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                label="Categorias"
                value={categories.length}
                icon={Tag}
                href="/admin/categorias"
              />
              <StatCard
                label="Confianza extra"
                value={plan.completedRecommendedCount}
                icon={Store}
                href="/admin/configuracion#section-contexto"
              />
            </div>
          </section>

          <section className="admin-surface rounded-[30px] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="admin-label">Tu tienda</p>
                <h2 className="mt-2 text-base font-semibold text-white">Datos visibles para tus clientes</h2>
              </div>
              <Link
                href={plan.publicPath}
                target="_blank"
                className="shrink-0 text-xs font-medium text-emerald-300 transition hover:text-white"
              >
                Abrir
              </Link>
            </div>

            <div className="divide-y divide-white/6">
              <InfoRow
                label="Nombre"
                value={storeData.store.name}
                href="/admin/configuracion#section-identidad"
                action="Editar"
              />
              <InfoRow
                label="Enlace"
                value={plan.publicPath}
                href="/admin/configuracion#section-identidad"
                action="Editar"
              />
              <InfoRow
                label="WhatsApp"
                value={storeData.store.whatsapp || 'Pendiente'}
                empty={!storeData.store.whatsapp}
                href="/admin/configuracion#section-contacto"
                action="Editar"
              />
              <InfoRow
                label="Instagram"
                value={storeData.store.instagram ? `@${storeData.store.instagram}` : 'Opcional'}
                empty={!storeData.store.instagram}
                href="/admin/configuracion#section-contacto"
                action="Editar"
              />
              <InfoRow
                label="Direccion"
                value={storeData.store.address || 'Opcional'}
                empty={!storeData.store.address}
                href="/admin/configuracion#section-contexto"
                action="Editar"
              />
              <InfoRow
                label="Horarios"
                value={storeData.store.hours || 'Opcional'}
                empty={!storeData.store.hours}
                href="/admin/configuracion#section-contexto"
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
                  {storeData.store.is_active ? 'Visible' : 'Pausada'}
                </Badge>
              </InfoRow>
            </div>
          </section>

          <section className="admin-surface rounded-[30px] p-5">
            <div className="mb-4">
              <p className="admin-label">Accesos rapidos</p>
              <h2 className="mt-2 text-base font-semibold text-white">Tareas frecuentes</h2>
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
        </div>
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
  icon: ElementType
  href: string
}) {
  return (
    <Link
      href={href}
      className="group admin-surface-muted rounded-[22px] p-4 transition duration-150 hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_22px_52px_rgba(2,6,23,0.24)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex size-8 items-center justify-center rounded-xl bg-white/6 text-neutral-400 transition-colors duration-150 group-hover:bg-white/8">
          <Icon className="size-4" />
        </div>
        <ExternalLink className="size-3.5 text-white/16 transition-all duration-150 group-hover:text-white/45" />
      </div>
      <p className="text-[1.6rem] font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{label}</p>
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
      <p className="w-[4.7rem] shrink-0 text-[11px] font-medium text-neutral-600">{label}</p>
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
