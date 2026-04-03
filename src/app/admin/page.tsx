import Link from 'next/link'
import { redirect } from 'next/navigation'
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
import { getAdminCategories, getAdminProducts, getAdminStore } from '@/lib/queries/store'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Badge } from '@/components/ui/badge'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const storeData = await getAdminStore(user.id)
  if (!storeData) redirect('/login')

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  const activeProducts = products.filter((product) => product.is_active)
  const featuredProducts = products.filter((product) => product.is_featured)
  const isConfigured = Boolean(storeData.store.whatsapp)

  const quickActions = [
    {
      href: '/admin/productos/nuevo',
      icon: Package,
      label: 'Agregar producto',
      description: 'Carga una nueva pieza al catalogo.',
    },
    {
      href: '/admin/apariencia',
      icon: Palette,
      label: 'Personalizar diseno',
      description: 'Colores, tipografia y jerarquia.',
    },
    {
      href: '/admin/contenido',
      icon: FileText,
      label: 'Editar contenido',
      description: 'Hero, textos y tono de conversion.',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        title={`Hola, ${storeData.store.name}`}
        description="Una vista clara del estado de tu tienda para operar rapido y sin ruido."
        action={
          <Link
            href={`/tienda/${storeData.store.slug}`}
            target="_blank"
            className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Ver tienda
            <ExternalLink className="ml-2 size-4" />
          </Link>
        }
      />

      {!isConfigured ? (
        <Link
          href="/admin/configuracion"
          className="surface-panel premium-ring mb-6 flex items-start gap-3 rounded-[28px] px-5 py-5 transition hover:bg-white/6"
        >
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-300/12 text-amber-200">
            <MessageCircle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-100">Falta configurar WhatsApp</p>
            <p className="mt-1 text-sm leading-6 text-amber-100/70">
              Sin este dato no puedes convertir visitas en pedidos. Configuralo ahora y deja el checkout listo.
            </p>
          </div>
          <ArrowRight className="ml-auto mt-1 size-4 shrink-0 text-amber-200" />
        </Link>
      ) : null}

      <section className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Productos activos" value={activeProducts.length} icon={Package} href="/admin/productos" />
        <StatCard label="Destacados" value={featuredProducts.length} icon={TrendingUp} href="/admin/productos" />
        <StatCard label="Categorias" value={categories.length} icon={Tag} href="/admin/categorias" />
        <StatCard label="Total de productos" value={products.length} icon={Package} href="/admin/productos" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel premium-ring rounded-[32px] px-5 py-6 sm:px-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Accesos rapidos</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Operaciones frecuentes</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-[26px] border border-white/8 bg-white/4 p-5 transition hover:bg-white/7"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white/8 text-emerald-200">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="surface-panel premium-ring rounded-[32px] px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Tu tienda</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Configuracion actual</h2>

          <div className="mt-6 grid gap-4 text-sm">
            <InfoRow label="Nombre" value={storeData.store.name} />
            <InfoRow label="URL publica" value={`/tienda/${storeData.store.slug}`} />
            <InfoRow label="WhatsApp" value={storeData.store.whatsapp || 'Pendiente'} empty={!storeData.store.whatsapp} />
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
      className="surface-panel premium-ring rounded-[28px] p-5 transition hover:bg-white/6"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/8 text-neutral-300">
          <Icon className="size-4" />
        </div>
        <ArrowRight className="size-4 text-neutral-500" />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-neutral-400">{label}</p>
    </Link>
  )
}

function InfoRow({
  label,
  value,
  empty,
  children,
}: {
  label: string
  value?: string
  empty?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/4 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {children ?? (
        <p className={empty ? 'mt-2 text-sm text-neutral-500' : 'mt-2 text-sm font-medium text-neutral-100'}>
          {value}
        </p>
      )}
    </div>
  )
}
