import Link from 'next/link'
import {
  ExternalLink,
  FileText,
  MessageCircle,
  Package,
  Palette,
  Store,
  Tag,
} from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ActivationFlow } from '@/components/admin/ActivationFlow'
import { StoreSharePanel } from '@/components/admin/StoreSharePanel'
import { buildActivationFlowSteps, buildStoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { cn } from '@/lib/utils'

export default async function AdminPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const plan = buildStoreLaunchPlan({ storeData, categories, products })
  const steps = buildActivationFlowSteps(plan)

  const secondaryLinks = [
    {
      href: '/admin/configuracion#section-identidad',
      icon: Store,
      label: 'Datos de la tienda',
      description: 'Nombre, enlace y contacto.',
    },
    {
      href: '/admin/productos',
      icon: Package,
      label: 'Catalogo',
      description: 'Productos activos y edicion.',
    },
    {
      href: '/admin/categorias',
      icon: Tag,
      label: 'Categorias',
      description: 'Orden y navegacion del catalogo.',
    },
    {
      href: '/admin/apariencia',
      icon: Palette,
      label: 'Apariencia',
      description: 'Colores, tipografia y estilo.',
    },
    {
      href: '/admin/contenido#section-copy',
      icon: FileText,
      label: 'Contenido',
      description: 'Portada y mensaje comercial.',
    },
    {
      href: '/admin/configuracion#section-contacto',
      icon: MessageCircle,
      label: 'Confianza',
      description: 'WhatsApp, Instagram, direccion y horarios.',
    },
  ]

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <AdminPageHeader
        title="Pone tu tienda en marcha"
        description="Completa lo justo para dejarla lista y compartirla con confianza."
        className="mb-2"
        action={
          <div className="w-full sm:w-[240px]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Progreso
              </p>
              <p className="text-sm font-medium text-neutral-300">
                {plan.requiredCompletionPercent}%
              </p>
            </div>
            <div className="h-2 rounded-full bg-white/6">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  plan.state === 'ready'
                    ? 'bg-[linear-gradient(90deg,rgba(46,230,166,0.95),rgba(111,243,223,0.75))]'
                    : plan.state === 'almost_ready'
                      ? 'bg-[linear-gradient(90deg,rgba(251,191,36,0.95),rgba(251,146,60,0.7))]'
                      : 'bg-[linear-gradient(90deg,rgba(115,115,115,0.9),rgba(212,212,212,0.6))]',
                )}
                style={{ width: `${plan.requiredCompletionPercent}%` }}
              />
            </div>
          </div>
        }
      />

      <ActivationFlow steps={steps} />

      {plan.shareEnabled ? (
        <StoreSharePanel plan={plan} />
      ) : (
        <section className="admin-surface rounded-xl p-5 sm:p-6">
          <p className="admin-label">Compartir tienda</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Todavia no es momento de compartirla</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Te faltan {plan.missingRequiredCount} cosa{plan.missingRequiredCount === 1 ? '' : 's'} para poder mostrarla con mas confianza.
          </p>
        </section>
      )}

      <details className="admin-surface rounded-xl p-5 sm:p-6">
        <summary className="cursor-pointer list-none text-sm font-medium text-white marker:hidden">
          <span className="inline-flex items-center gap-2">
            <ExternalLink className="size-4 text-neutral-400" />
            Ver mas
          </span>
        </summary>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {secondaryLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group admin-surface-muted rounded-lg p-4 transition duration-150 hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_22px_52px_rgba(2,6,23,0.24)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white/6 text-neutral-300 transition-colors duration-150 group-hover:bg-white/8">
                    <Icon className="size-4" />
                  </div>
                  <ExternalLink className="size-3.5 text-white/16 transition-all duration-150 group-hover:text-white/45" />
                </div>
                <p className="text-sm font-medium text-white">{link.label}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{link.description}</p>
              </Link>
            )
          })}
        </div>
      </details>
    </div>
  )
}
