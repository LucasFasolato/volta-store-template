import {
  BarChart3,
  Check,
  MessageCircle,
  Palette,
  Share2,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { formatBillingAmount, VOLTA_BILLING_PLAN } from '@/lib/billing/plan'

const VOLTA_FEATURES = [
  'Catálogo profesional con productos y variantes',
  'Carrito y pedidos ordenados por WhatsApp',
  'Personalización visual y portada',
  'QR, links de producto y herramientas para compartir',
  'Rendimiento, origen de visitas y campañas',
] as const

const PRO_FEATURES = [
  'Inteligencia comercial más profunda',
  'Comparativas y tendencias para decidir qué impulsar',
  'Recomendaciones automáticas priorizadas',
  'Nuevas herramientas de crecimiento sobre tus datos',
] as const

const VALUE_GROUPS = [
  {
    title: 'Tu tienda',
    description: 'Todo lo necesario para mostrar lo que vendés de forma profesional.',
    icon: ShoppingBag,
    items: ['Catálogo online', 'Productos y variantes', 'Categorías, marcas y promociones'],
  },
  {
    title: 'Tu marca',
    description: 'Una experiencia que se siente propia sin tener que diseñar desde cero.',
    icon: Palette,
    items: ['Colores y tipografías', 'Portada y logo', 'Diseño optimizado para celular'],
  },
  {
    title: 'Tus pedidos',
    description: 'El cliente elige tranquilo y vos recibís un mensaje listo para responder.',
    icon: MessageCircle,
    items: ['Carrito', 'Variantes y cantidades', 'Datos, retiro o envío y observaciones'],
  },
  {
    title: 'Compartí y medí',
    description: 'Distribuí tu tienda y entendé qué está generando intención de compra.',
    icon: Share2,
    items: ['Link, WhatsApp y QR', 'Links por producto y campaña', 'Rendimiento y origen de visitas'],
  },
] as const

export function PlanValueShowcase({ complimentary = false }: { complimentary?: boolean }) {
  return (
    <section className="space-y-4">
      <div className="rounded-[20px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-7">
        <div className="max-w-2xl">
          <p className="admin-label">Planes VOLTA</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            Vendé hoy. Crecé con más inteligencia cuando lo necesites.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            VOLTA está pensado para resolver la venta diaria sin complicarte. PRO va a sumar una capa más profunda de crecimiento, sin convertir tu tienda en un sistema difícil de usar.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[18px] border border-emerald-500/20 bg-emerald-500/[0.045] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Para vender</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">VOLTA</h3>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                {complimentary ? 'Tu acceso está bonificado' : 'Disponible hoy'}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tu catálogo profesional para vender por WhatsApp, compartirlo donde ya están tus clientes y medir qué está funcionando.
            </p>

            <div className="mt-5 rounded-[14px] border border-black/7 bg-white/75 p-4 dark:border-white/8 dark:bg-white/[0.035]">
              <p className="text-xs font-medium text-muted-foreground">{complimentary ? 'Precio de lista' : 'Precio de lanzamiento'}</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-2xl font-semibold tracking-tight text-foreground">{formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)}</span>
                <span className="pb-0.5 text-xs text-muted-foreground">/ mes</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                Primeros {VOLTA_BILLING_PLAN.introCycles} meses. Después {formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes.
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              {VOLTA_FEATURES.map((feature) => (
                <FeatureRow key={feature}>{feature}</FeatureRow>
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(145deg,#111820,#07110e)] p-5 text-white shadow-[0_20px_70px_rgba(0,0,0,.16)] sm:p-6">
            <div className="absolute -right-16 -top-20 size-48 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Para crecer</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">VOLTA PRO</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/75">
                  Próximamente
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/65">
                Para negocios que ya venden y quieren entender mejor qué productos, canales y acciones generan más intención de compra.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-emerald-300/15 bg-emerald-300/[0.07] p-4">
                <TrendingUp className="size-5 shrink-0 text-emerald-300" />
                <p className="text-xs leading-5 text-white/75">Todo VOLTA + una capa de inteligencia y crecimiento.</p>
              </div>

              <div className="mt-5 space-y-2.5">
                {PRO_FEATURES.map((feature) => (
                  <FeatureRow key={feature} inverted>{feature}</FeatureRow>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs leading-5 text-white/50">
                  PRO todavía no se cobra ni cambia tu acceso actual. Cuando esté disponible, la elección va a ser explícita.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="rounded-[20px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-7">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Todo esto ya viene con VOLTA</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Sin módulos sueltos, sin cobrarte cada herramienta por separado.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {VALUE_GROUPS.map(({ title, description, icon: Icon, items }) => (
            <article key={title} className="rounded-[15px] border border-black/7 bg-[#fbfcfd] p-4 dark:border-white/8 dark:bg-white/[0.025]">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p>
              <div className="mt-4 space-y-2">
                {items.map((item) => (
                  <FeatureRow key={item}>{item}</FeatureRow>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ children, inverted = false }: { children: React.ReactNode; inverted?: boolean }) {
  return (
    <div className={`flex items-start gap-2.5 text-xs leading-5 ${inverted ? 'text-white/75' : 'text-foreground'}`}>
      <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${inverted ? 'bg-emerald-300/12 text-emerald-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
        <Check className="size-2.5" />
      </span>
      <span>{children}</span>
    </div>
  )
}
