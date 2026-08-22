import { Check, Minus, TrendingUp } from 'lucide-react'
import { BillingActions } from '@/components/admin/BillingActions'
import {
  FREE_PLAN,
  formatBillingAmount,
  type CommercialPlanCode,
  VOLTA_BILLING_PLAN,
  VOLTA_PRO_PLAN,
} from '@/lib/billing/plan'
import type { BillingStatus } from '@/lib/billing/types'

const COMPARISON = [
  ['Productos', `Hasta ${FREE_PLAN.productLimit}`, 'Sin límite', 'Sin límite'],
  ['Imágenes por producto', `${FREE_PLAN.imagesPerProductLimit}`, 'Hasta 12', 'Hasta 12'],
  ['Carrito + WhatsApp', true, true, true],
  ['Personalización', 'Incluida', 'Incluida', 'Incluida'],
  ['QR y links medibles', false, true, true],
  ['Rendimiento comercial', 'Vista inicial', 'Completo', 'Completo'],
  ['Campañas y atribución', false, false, true],
  ['Inteligencia y recomendaciones', false, false, true],
] as const

export function PlanValueShowcase({
  currentPlan,
  status,
  providerConfigured,
  complimentary = false,
  accessSource,
  accessUntilLabel,
  subscriptionPlan,
}: {
  currentPlan: CommercialPlanCode
  status: BillingStatus | null
  providerConfigured: boolean
  complimentary?: boolean
  accessSource?: string
  accessUntilLabel?: string | null
  subscriptionPlan?: 'volta' | 'pro'
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[22px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-7">
        <div className="max-w-3xl">
          <p className="admin-label">Elegí cómo querés usar VOLTA</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-3xl">
            Empezá sin riesgo. Pagá cuando VOLTA ya te esté ayudando a vender.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Gratis te deja comprobar que el catálogo y WhatsApp encajan con tu negocio. VOLTA elimina límites para operar en serio. PRO suma la capa de datos e inteligencia para crecer.
          </p>
        </div>

        <div className="mt-7 grid gap-4 xl:grid-cols-3 xl:items-stretch">
          <PlanCard
            eyebrow="Para empezar"
            title="Gratis"
            description="Publicá tu primera tienda, cargá productos y empezá a recibir pedidos sin poner una tarjeta."
            price="$0"
            priceDetail="Sin tarjeta. Sin vencimiento."
            features={[
              `Hasta ${FREE_PLAN.productLimit} productos`,
              '1 imagen por producto',
              'Carrito y pedidos por WhatsApp',
              'Link público y personalización de tienda',
              'Vista inicial de rendimiento',
            ]}
            badge={currentPlan === 'free' ? 'Tu plan actual' : undefined}
            footer={currentPlan === 'free'
              ? <CurrentPlanPill />
              : <p className="text-xs leading-5 text-muted-foreground">{accessSource === 'grandfathered' || (accessSource === 'paid_until' && currentPlan === 'volta') ? 'Tu acceso histórico conserva VOLTA.' : 'Gratis queda disponible si en algún momento dejás un plan pago.'}</p>}
          />

          <PlanCard
            featured
            eyebrow="Para vender"
            title="VOLTA"
            description="Para negocios que quieren vender de forma profesional, sin límites artificiales y con una operación simple."
            price={formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)}
            priceDetail={`Primeros ${VOLTA_BILLING_PLAN.introCycles} meses · después ${formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes`}
            features={[
              'Productos sin límite artificial',
              'Hasta 12 imágenes y variantes',
              'QR y links medibles',
              'Rendimiento, funnel y productos destacados',
              'Todo el flujo comercial por WhatsApp',
            ]}
            badge="Más elegido"
            footer={
              complimentary && currentPlan === 'volta' ? (
                <div className="rounded-[10px] bg-emerald-500/10 px-3 py-2.5 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">Tu acceso VOLTA está bonificado</div>
              ) : currentPlan === 'volta' && (status === 'active' || accessSource === 'grandfathered') ? (
                <CurrentPlanPill />
              ) : currentPlan === 'volta' && accessSource === 'paid_until' ? (
                <div className="rounded-[10px] bg-slate-100 px-3 py-2.5 text-center text-xs font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-white/65">
                  Renovación cancelada · disponible{accessUntilLabel ? ` hasta ${accessUntilLabel}` : ' hasta el final del período pago'}
                </div>
              ) : (
                <BillingActions status={status} providerConfigured={providerConfigured} currentPlan={currentPlan} subscriptionPlan={subscriptionPlan} targetPlan="volta" compact />
              )
            }
          />

          <PlanCard
            dark
            eyebrow="Para crecer"
            title="VOLTA PRO"
            description="Para negocios que ya venden y quieren saber qué productos, canales y acciones generan más intención de compra."
            price={formatBillingAmount(VOLTA_PRO_PLAN.standardAmount)}
            priceDetail="por mes · cancelás cuando quieras"
            features={[
              'Todo VOLTA incluido',
              'Campañas y atribución por canal',
              'Comparación de conversiones',
              'Oportunidades comerciales priorizadas',
              'Inteligencia y recomendaciones VOLTA',
            ]}
            badge={currentPlan === 'pro' ? 'Tu plan actual' : 'Más inteligencia'}
            footer={
              currentPlan === 'pro' && status === 'active' ? (
                <CurrentPlanPill inverted />
              ) : currentPlan === 'pro' && accessSource === 'paid_until' ? (
                <div className="rounded-[10px] bg-white/[0.08] px-3 py-2.5 text-center text-xs font-semibold text-white/70">
                  Renovación cancelada · disponible{accessUntilLabel ? ` hasta ${accessUntilLabel}` : ' hasta el final del período pago'}
                </div>
              ) : complimentary ? (
                <p className="text-xs leading-5 text-white/55">Tu bonificación cubre VOLTA. PRO requiere una suscripción propia.</p>
              ) : (
                <BillingActions status={status} providerConfigured={providerConfigured} currentPlan={currentPlan} subscriptionPlan={subscriptionPlan} targetPlan="pro" compact />
              )
            }
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]">
        <div className="border-b border-black/7 px-5 py-5 dark:border-white/8 sm:px-7">
          <p className="admin-label">Comparación rápida</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Lo importante, sin una tabla interminable</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/7 dark:border-white/8">
                <th className="px-5 py-4 font-medium text-muted-foreground sm:px-7">Función</th>
                <th className="px-4 py-4 font-semibold text-foreground">Gratis</th>
                <th className="px-4 py-4 font-semibold text-emerald-700 dark:text-emerald-300">VOLTA</th>
                <th className="px-4 py-4 font-semibold text-foreground">PRO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6 dark:divide-white/7">
              {COMPARISON.map(([label, free, volta, pro]) => (
                <tr key={label}>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground sm:px-7">{label}</td>
                  <ComparisonCell value={free} />
                  <ComparisonCell value={volta} />
                  <ComparisonCell value={pro} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function PlanCard({
  eyebrow,
  title,
  description,
  price,
  priceDetail,
  features,
  badge,
  footer,
  featured = false,
  dark = false,
}: {
  eyebrow: string
  title: string
  description: string
  price: string
  priceDetail: string
  features: readonly string[]
  badge?: string
  footer: React.ReactNode
  featured?: boolean
  dark?: boolean
}) {
  const shell = dark
    ? 'border-white/10 bg-[linear-gradient(145deg,#111820,#07110e)] text-white'
    : featured
      ? 'border-emerald-500/30 bg-[linear-gradient(180deg,rgba(16,185,129,.065),rgba(255,255,255,.98))] shadow-[0_20px_70px_rgba(16,185,129,.09)] dark:bg-[linear-gradient(180deg,rgba(18,232,154,.08),rgba(17,24,32,.98))]'
      : 'border-black/8 bg-[#fbfcfd] dark:border-white/8 dark:bg-white/[0.025]'

  return (
    <article className={`relative flex h-full flex-col rounded-[20px] border p-5 sm:p-6 ${shell}`}>
      {featured ? <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{eyebrow}</p>
          <h3 className={`mt-2 text-2xl font-semibold tracking-[-0.045em] ${dark ? 'text-white' : 'text-foreground'}`}>{title}</h3>
        </div>
        {badge ? <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${featured ? 'bg-emerald-500 text-white' : dark ? 'border border-white/10 bg-white/[0.06] text-white/75' : 'border border-black/8 bg-white text-muted-foreground dark:border-white/10 dark:bg-white/5'}`}>{badge}</span> : null}
      </div>

      <p className={`mt-3 min-h-16 text-sm leading-6 ${dark ? 'text-white/65' : 'text-muted-foreground'}`}>{description}</p>

      <div className={`mt-5 rounded-[15px] border p-4 ${dark ? 'border-white/10 bg-white/[0.055]' : 'border-black/7 bg-white/75 dark:border-white/8 dark:bg-white/[0.035]'}`}>
        <div className="flex flex-wrap items-end gap-2">
          <span className={`text-3xl font-semibold tracking-[-0.045em] ${dark ? 'text-white' : 'text-foreground'}`}>{price}</span>
          {price !== '$0' ? <span className={`pb-1 text-xs ${dark ? 'text-white/50' : 'text-muted-foreground'}`}>/ mes</span> : null}
        </div>
        <p className={`mt-1.5 text-[11px] leading-5 ${dark ? 'text-white/50' : 'text-muted-foreground'}`}>{priceDetail}</p>
      </div>

      <div className="mt-5 flex-1 space-y-2.5">
        {features.map((feature) => (
          <div key={feature} className={`flex items-start gap-2.5 text-xs leading-5 ${dark ? 'text-white/75' : 'text-foreground'}`}>
            <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-emerald-300/12 text-emerald-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}><Check className="size-2.5" /></span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-black/7 pt-4 dark:border-white/10">{footer}</div>
    </article>
  )
}

function CurrentPlanPill({ inverted = false }: { inverted?: boolean }) {
  return <div className={`rounded-[10px] px-3 py-2.5 text-center text-xs font-semibold ${inverted ? 'bg-white/10 text-white' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>Tu plan actual</div>
}

function ComparisonCell({ value }: { value: string | boolean }) {
  return (
    <td className="px-4 py-3.5 text-muted-foreground">
      {value === true ? <Check className="size-4 text-emerald-600 dark:text-emerald-300" /> : value === false ? <Minus className="size-4 text-muted-foreground/50" /> : value}
    </td>
  )
}
