import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  ExternalLink,
  ImageIcon,
  Megaphone,
  PackageCheck,
  QrCode,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { VoltaBrand } from '@/components/brand/VoltaBrand'
import type { CommercialPlanCode } from '@/lib/billing/plan'

type PaidPlan = Extract<CommercialPlanCode, 'volta' | 'pro'>

type Feature = {
  title: string
  description: string
  icon: React.ReactNode
}

type Step = {
  number: string
  title: string
  description: string
  href: string
  cta: string
}

const VOLTA_FEATURES: Feature[] = [
  { title: 'Productos sin límite', description: 'Hacé crecer tu catálogo sin contar espacios.', icon: <PackageCheck className="size-5" /> },
  { title: 'Más imágenes', description: 'Mostrá cada producto con una galería completa.', icon: <ImageIcon className="size-5" /> },
  { title: 'QR y links medibles', description: 'Compartí tu tienda por cada canal y medí mejor.', icon: <QrCode className="size-5" /> },
  { title: 'Rendimiento completo', description: 'Entendé qué productos generan más intención.', icon: <BarChart3 className="size-5" /> },
]

const PRO_FEATURES: Feature[] = [
  { title: 'Campañas y atribución', description: 'Creá links por campaña y conservá el origen de cada visita.', icon: <Megaphone className="size-5" /> },
  { title: 'Comparación de canales', description: 'Descubrí qué fuente trae tráfico y cuál convierte mejor.', icon: <TrendingUp className="size-5" /> },
  { title: 'Oportunidades priorizadas', description: 'Detectá dónde hay intención comercial para actuar primero.', icon: <Target className="size-5" /> },
  { title: 'Inteligencia VOLTA', description: 'Convertí datos del negocio en próximos pasos más claros.', icon: <Sparkles className="size-5" /> },
]

const VOLTA_STEPS: Step[] = [
  { number: '1', title: 'Completá tu catálogo', description: 'Sumá más productos, variantes e imágenes sin el límite del plan Gratis.', href: '/admin/productos', cta: 'Ir a productos' },
  { number: '2', title: 'Compartí tu tienda', description: 'Usá QR y links medibles para llegar a más clientes desde tus canales.', href: '/admin/compartir', cta: 'Ir a compartir' },
  { number: '3', title: 'Mirá qué funciona', description: 'Revisá visitas, productos abiertos, carrito y WhatsApps iniciados.', href: '/admin/rendimiento', cta: 'Ver rendimiento' },
]

const PRO_STEPS: Step[] = [
  { number: '1', title: 'Creá tu primera campaña', description: 'Generá un link medible para Instagram, una promoción o una acción puntual.', href: '/admin/compartir', cta: 'Crear campaña' },
  { number: '2', title: 'Compará tus canales', description: 'Mirá qué origen trae visitas y cuál termina generando más WhatsApps.', href: '/admin/rendimiento', cta: 'Comparar canales' },
  { number: '3', title: 'Buscá oportunidades', description: 'Usá tus datos para decidir qué producto o canal conviene impulsar primero.', href: '/admin/rendimiento', cta: 'Ver oportunidades' },
]

export function PaidWelcomeExperience({
  planCode,
  publicUrl,
  isUpgrade = false,
}: {
  planCode: PaidPlan
  publicUrl: string
  isUpgrade?: boolean
}) {
  const isPro = planCode === 'pro'
  const planName = isPro ? 'VOLTA PRO' : 'VOLTA'
  const features = isPro ? PRO_FEATURES : VOLTA_FEATURES
  const steps = isPro ? PRO_STEPS : VOLTA_STEPS
  const accent = isPro ? '#9b7bff' : '#12e89a'

  return (
    <main className="min-h-screen bg-[#f4f7f6] px-4 py-5 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 px-1 py-2">
          <VoltaBrand />
          <Link href="/admin" className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">Ir al panel</Link>
        </header>

        <section className={`relative mt-4 overflow-hidden rounded-[32px] border px-5 py-9 text-white shadow-[0_28px_90px_rgba(15,23,42,.12)] sm:px-9 sm:py-11 ${isPro ? 'border-violet-400/20 bg-[linear-gradient(145deg,#141326,#080b16)]' : 'border-emerald-400/20 bg-[linear-gradient(145deg,#0b1b16,#07110e)]'}`}>
          <div className="pointer-events-none absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 50% 0%, ${accent}30, transparent 35%)` }} />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="relative mx-auto flex size-20 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}>
              <div className="absolute inset-2 animate-ping rounded-full opacity-20" style={{ backgroundColor: accent }} />
              <Check className="relative size-9" strokeWidth={2.5} />
            </div>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[.2em]" style={{ color: accent }}>{isUpgrade ? 'Upgrade confirmado' : 'Plan confirmado'}</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
              {isPro ? 'Bienvenido a VOLTA PRO.' : '¡Bienvenido a VOLTA!'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              {isPro
                ? 'Ahora tus datos pueden empezar a trabajar para vos. Te mostramos qué desbloqueaste y cuál es el mejor primer paso.'
                : 'Tu tienda acaba de desbloquear nuevas herramientas para vender con menos límites y entender mejor qué está funcionando.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium text-white/65">
              <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5">Confirmación automática</span>
              <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5">Sin configuración técnica</span>
              <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5">Listo para usar</span>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-black/7 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,.06)] sm:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700">Lo que acabás de desbloquear</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.045em] sm:text-3xl">Tu plan ya se nota dentro del producto.</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[20px] border border-black/7 bg-[#f7faf8] p-5">
                <div className={`flex size-10 items-center justify-center rounded-2xl ${isPro ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>{feature.icon}</div>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-black/7 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,.06)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">Mini guía</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.045em]">Tres pasos para aprovechar {planName} ahora.</h2>
            </div>
            <span className="text-xs text-slate-400">Podés hacerlos en cualquier orden.</span>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="flex h-full flex-col rounded-[20px] border border-black/7 bg-[#fbfcfb] p-5">
                <div className="flex size-8 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: `${accent}18`, color: isPro ? '#6d4ee8' : '#087e56' }}>{step.number}</div>
                <h3 className="mt-4 text-base font-semibold tracking-[-.025em]">{step.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">{step.description}</p>
                <Link href={step.href} className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 transition hover:gap-2.5">{step.cta} <ArrowRight className="size-3.5" /></Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-[1.25fr_.75fr]">
          <div className={`rounded-[26px] border p-6 ${isPro ? 'border-violet-200 bg-violet-50/70' : 'border-emerald-200 bg-emerald-50/70'}`}>
            <p className={`text-[11px] font-bold uppercase tracking-[.16em] ${isPro ? 'text-violet-700' : 'text-emerald-700'}`}>Tu próximo paso recomendado</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-.04em]">{isPro ? 'Creá una campaña y empezá a comparar.' : 'Compartí tu tienda y empezá a traer visitas.'}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{isPro ? 'PRO gana valor cuando cada canal queda medido. Empezá por una acción concreta que ya pensabas publicar.' : 'Tu catálogo ya está listo: llevarle personas es lo que convierte la configuración en ventas reales.'}</p>
            <Link href="/admin/compartir" className={`mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold ${isPro ? 'bg-violet-600 text-white' : 'bg-[#12e89a] text-[#04251a]'}`}>
              {isPro ? 'Crear mi primera campaña' : 'Compartir mi tienda'} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="rounded-[26px] border border-black/7 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500">Tu tienda</p>
            <p className="mt-2 text-lg font-semibold">Seguí viéndola como cliente.</p>
            <div className="mt-5 space-y-2">
              <Link href={publicUrl} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 text-sm font-semibold text-slate-800">Ver mi tienda <ExternalLink className="size-4" /></Link>
              <Link href="/admin/plan" className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-slate-500">Ver mi suscripción</Link>
            </div>
          </div>
        </section>

        <footer className="py-7 text-center text-xs text-slate-400">
          La autorización y los cobros recurrentes se procesan en Mercado Pago. VOLTA no guarda datos de tarjeta.
        </footer>
      </div>
    </main>
  )
}
