import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { VoltaBrand } from '@/components/brand/VoltaBrand'
import {
  FREE_PLAN,
  formatBillingAmount,
  VOLTA_BILLING_PLAN,
  VOLTA_PRO_PLAN,
} from '@/lib/billing/plan'

export const metadata: Metadata = {
  title: 'VOLTA — Tu catálogo online para vender por WhatsApp',
  description:
    'Creá una tienda online profesional, compartí un link y recibí pedidos ordenados por WhatsApp. Empezá gratis.',
  alternates: { canonical: 'https://www.voltastore.app' },
  openGraph: {
    title: 'VOLTA — Tu catálogo online para vender por WhatsApp',
    description: 'Tu tienda online lista para compartir y vender por WhatsApp. Empezá gratis.',
    url: 'https://www.voltastore.app',
    siteName: 'VOLTA Store',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOLTA — Tu catálogo online para vender por WhatsApp',
    description: 'Tu tienda online lista para compartir y vender por WhatsApp. Empezá gratis.',
  },
}

type RootSearchParams = Promise<Record<string, string | string[] | undefined>>

const faqs = [
  {
    question: '¿Necesito saber de tecnología?',
    answer: 'No. Cargás productos desde un panel simple y VOLTA se ocupa de convertirlos en una tienda lista para compartir.',
  },
  {
    question: '¿El cliente paga dentro de VOLTA?',
    answer: 'El cliente arma el pedido y continúa por WhatsApp. El pago y la entrega los coordinás como ya lo hacés hoy.',
  },
  {
    question: '¿Puedo empezar sin pagar?',
    answer: `Sí. Gratis incluye hasta ${FREE_PLAN.productLimit} productos, carrito, WhatsApp y una tienda pública sin pedirte tarjeta.`,
  },
  {
    question: '¿Puedo cancelar un plan pago?',
    answer: 'Sí. No hay permanencia. Cancelás cuando quieras desde tu panel.',
  },
]

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RootPage({ searchParams }: { searchParams: RootSearchParams }) {
  const params = await searchParams
  const code = firstValue(params.code)
  const oauthError = firstValue(params.error)

  if (code || oauthError) {
    const callbackParams = new URLSearchParams()
    if (code) callbackParams.set('code', code)
    if (oauthError) callbackParams.set('error', oauthError)
    const errorDescription = firstValue(params.error_description)
    if (errorDescription) callbackParams.set('error_description', errorDescription)
    callbackParams.set('provider', 'google')
    callbackParams.set('next', '/admin')
    redirect(`/auth/callback?${callbackParams.toString()}`)
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VOLTA Store',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Catálogo online para negocios que venden por WhatsApp.',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'ARS', name: 'Gratis' },
      { '@type': 'Offer', price: VOLTA_BILLING_PLAN.introAmount, priceCurrency: 'ARS', name: 'VOLTA' },
      { '@type': 'Offer', price: VOLTA_PRO_PLAN.standardAmount, priceCurrency: 'ARS', name: 'VOLTA PRO' },
    ],
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f5] text-[#07120f] selection:bg-[#12e89a] selection:text-[#032319]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <header className="sticky top-0 z-50 border-b border-black/6 bg-[#f5f7f5]/92 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" aria-label="VOLTA inicio" className="shrink-0"><VoltaBrand /></Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Navegación principal">
            <a href="#como-funciona" className="transition hover:text-slate-950">Cómo funciona</a>
            <a href="#experiencia" className="transition hover:text-slate-950">Producto</a>
            <a href="#planes" className="transition hover:text-slate-950">Planes</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:inline-flex">Ingresar</Link>
            <Link href="/login" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#07120f] px-4 text-sm font-semibold text-white transition hover:bg-[#16231f] sm:px-5">
              Crear gratis <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
        <div className="pointer-events-none absolute left-[8%] top-[-180px] h-[420px] w-[580px] rounded-full bg-[#12e89a]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-9 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0aa66f]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#087e56] shadow-sm">
              <MessageCircle className="size-3.5" /> Catálogo + carrito + WhatsApp
            </div>
            <h1 className="mt-5 text-balance text-[2.85rem] font-semibold leading-[.98] tracking-[-0.062em] sm:text-[4rem] lg:text-[4.6rem]">
              Tu tienda online, lista para vender por WhatsApp.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Mostrá productos, precios y opciones en un catálogo profesional. Tu cliente elige, arma el pedido y lo termina por WhatsApp.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-6 text-sm font-bold text-[#04251a] shadow-[0_16px_38px_rgba(18,232,154,.22)] transition hover:-translate-y-0.5 hover:bg-[#0fdb91]">
                Crear mi tienda gratis <ArrowRight className="size-4" />
              </Link>
              <Link href="/tienda/strongprotein" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50">
                Ver tienda real <ExternalLink className="size-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Sin tarjeta</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Publicás en minutos</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Sin comisión por venta</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="absolute inset-x-[14%] bottom-[-7%] h-24 rounded-full bg-[#12e89a]/16 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-black/8 bg-[#07120f] p-2 shadow-[0_28px_80px_rgba(7,18,15,.20)] sm:p-3">
              <div className="mb-2 flex items-center justify-between px-2 py-1 text-[10px] font-medium text-white/55 sm:px-3">
                <span>NOVA Studio</span>
                <span>Tienda creada con VOLTA</span>
              </div>
              <Image
                src="/landing/nova-brand.webp"
                alt="Ejemplo de una tienda creada con VOLTA"
                width={900}
                height={675}
                priority
                className="aspect-[4/3] w-full rounded-[20px] object-cover"
              />
            </div>
            <div className="absolute -bottom-4 right-3 hidden rounded-2xl border border-black/8 bg-white px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,.12)] sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">Pedido listo</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Continúa por WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-black/6 bg-white px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Cómo funciona</p>
              <h2 className="mt-3 max-w-lg text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">De tu catálogo a un pedido ordenado, sin cambiar cómo vendés.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">VOLTA organiza lo que hoy mandás por mensajes: productos, opciones, cantidades y el paso final a WhatsApp.</p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <StepCard icon={<Store className="size-5" />} number="01" title="Cargás tu catálogo">Fotos, precios, variantes y disponibilidad desde un panel simple.</StepCard>
            <StepCard icon={<QrCode className="size-5" />} number="02" title="Compartís un link">Instagram, WhatsApp, Facebook o QR: usás los canales que ya tenés.</StepCard>
            <StepCard icon={<MessageCircle className="size-5" />} number="03" title="Recibís el pedido">El cliente llega a WhatsApp con productos, opciones y cantidades ya definidos.</StepCard>
          </div>
        </div>
      </section>

      <section id="experiencia" className="px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[30px] bg-[#07120f] text-white shadow-[0_28px_90px_rgba(7,18,15,.14)]">
          <div className="grid items-center gap-8 p-5 sm:p-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-12 lg:p-10">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">Experiencia de producto</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-[2.8rem]">Que comprar se sienta simple, incluso desde el celular.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">El cliente entra, entiende el producto, elige sus opciones y avanza. Sin formularios eternos ni un checkout que compita con WhatsApp.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DarkFeature>Productos y variantes claras</DarkFeature>
                <DarkFeature>Carrito corto y entendible</DarkFeature>
                <DarkFeature>Pedido estructurado</DarkFeature>
                <DarkFeature>Diseño adaptable a tu marca</DarkFeature>
              </div>
              <Link href="/tienda/strongprotein" className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#07120f] transition hover:-translate-y-0.5">Probar una tienda real <ExternalLink className="size-4" /></Link>
            </div>

            <div className="mx-auto w-full max-w-[520px]">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[.04] p-2 sm:p-3">
                <Image
                  src="/landing/nova-product.webp"
                  alt="Detalle de producto en una tienda VOLTA"
                  width={640}
                  height={800}
                  className="aspect-[4/5] w-full rounded-[18px] object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="planes" className="border-y border-black/6 bg-white px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Planes</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Empezá gratis. Subí de plan cuando tu tienda ya te esté dando valor.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Gratis alcanza para validar. VOLTA suma herramientas para vender. PRO agrega inteligencia cuando ya tenés datos para aprovecharla.</p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:items-stretch">
            <PricingCard
              eyebrow="Para empezar"
              title="Gratis"
              price="$0"
              detail="Sin tarjeta · sin vencimiento"
              features={[`Hasta ${FREE_PLAN.productLimit} productos`, '1 imagen por producto', 'Carrito + WhatsApp', 'Tienda pública y personalización']}
              cta="Crear gratis"
              href="/login"
            />
            <PricingCard
              featured
              eyebrow="Para vender"
              title="VOLTA"
              price={formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)}
              detail={`por mes durante ${VOLTA_BILLING_PLAN.introCycles} meses · después ${formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes`}
              features={['Productos sin límite artificial', 'Hasta 12 imágenes por producto', 'QR y links medibles', 'Rendimiento comercial completo']}
              cta="Elegir VOLTA"
              href="/login?next=%2Fadmin%2Fplan"
            />
            <PricingCard
              dark
              eyebrow="Para crecer"
              title="VOLTA PRO"
              price={formatBillingAmount(VOLTA_PRO_PLAN.standardAmount)}
              detail="por mes · cancelás cuando quieras"
              features={['Todo VOLTA incluido', 'Campañas y atribución', 'Comparación de conversiones', 'Inteligencia y recomendaciones']}
              cta="Elegir PRO"
              href="/login?next=%2Fadmin%2Fplan"
            />
          </div>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-black/7 bg-[#f7f9f8] p-5 sm:grid-cols-3">
            <TrustItem icon={<ShieldCheck className="size-4" />} title="Cobro seguro">La suscripción paga se procesa en Mercado Pago.</TrustItem>
            <TrustItem icon={<CheckCircle2 className="size-4" />} title="Sin permanencia">Cancelás cuando quieras desde tu panel.</TrustItem>
            <TrustItem icon={<QrCode className="size-4" />} title="Tus ventas son tuyas">VOLTA no cobra a tus clientes ni toca tus ventas.</TrustItem>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Preguntas frecuentes</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.05em]">Lo importante, sin vueltas.</h2>
          </div>
          <div className="space-y-2.5">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[18px] border border-black/7 bg-white px-5 py-4 open:shadow-sm">
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-slate-900 marker:hidden">{faq.question}</summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#07120f] px-6 py-9 text-white sm:px-9 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">Empezá sin pagar</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Tu próximo cliente puede ver tu catálogo en un link, no en veinte fotos sueltas.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Creá tu tienda, cargá tus primeros productos y compartila.</p>
          </div>
          <Link href="/login" className="mt-6 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-6 text-sm font-bold text-[#04251a] transition hover:-translate-y-0.5 lg:mt-0">Crear mi tienda gratis <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-black/6 bg-white px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><VoltaBrand /><span>Catálogo online para vender por WhatsApp.</span></div>
          <div className="flex flex-wrap gap-5"><Link className="hover:text-slate-900" href="/privacy">Privacidad</Link><Link className="hover:text-slate-900" href="/terms">Términos</Link><Link className="hover:text-slate-900" href="/login">Ingresar</Link></div>
        </div>
      </footer>
    </main>
  )
}

function StepCard({ icon, number, title, children }: { icon: React.ReactNode; number: string; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[22px] border border-black/7 bg-[#f8faf8] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#07120f] text-white">{icon}</span>
        <span className="text-[11px] font-bold tracking-[.16em] text-slate-300">{number}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  )
}

function DarkFeature({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/[.045] px-3.5 py-3 text-sm text-white/82"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-300"><Check className="size-3" /></span><span>{children}</span></div>
}

function PricingCard({ eyebrow, title, price, detail, features, cta, href, featured = false, dark = false }: {
  eyebrow: string
  title: string
  price: string
  detail: string
  features: readonly string[]
  cta: string
  href: string
  featured?: boolean
  dark?: boolean
}) {
  const shell = dark
    ? 'volta-contrast-dark border-[#173329] bg-[#07120f] text-white'
    : featured
      ? 'border-emerald-400/50 bg-[linear-gradient(180deg,#f3fff9,#ffffff)] shadow-[0_22px_65px_rgba(18,232,154,.11)]'
      : 'border-black/7 bg-[#fbfcfb]'
  const forcedLight = dark ? { color: '#f8fafc', WebkitTextFillColor: '#f8fafc' } : undefined

  return (
    <article className={`relative flex h-full flex-col rounded-[24px] border p-5 sm:p-6 ${shell}`}>
      {featured ? <span className="absolute right-5 top-5 rounded-full bg-[#12e89a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#05251a]">Más elegido</span> : null}
      <p className={`text-[10px] font-bold uppercase tracking-[.18em] ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>{eyebrow}</p>
      <h3 className={`mt-3 text-2xl font-semibold tracking-[-.045em] ${dark ? 'text-white' : 'text-slate-950'}`} style={forcedLight}>{title}</h3>
      <div className="mt-5"><div className="flex items-end gap-2"><span className={`text-4xl font-semibold tracking-[-.055em] ${dark ? 'text-white' : 'text-slate-950'}`} style={forcedLight}>{price}</span>{price !== '$0' ? <span className={`pb-1 text-xs ${dark ? 'text-white/55' : 'text-slate-500'}`}>/mes</span> : null}</div><p className={`mt-2 min-h-10 text-xs leading-5 ${dark ? 'text-white/58' : 'text-slate-500'}`}>{detail}</p></div>
      <div className="mt-5 flex-1 space-y-3">{features.map((feature) => <div key={feature} className={`flex items-start gap-2.5 text-sm ${dark ? 'text-white/80' : 'text-slate-700'}`}><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-emerald-400/12 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}><Check className="size-3" /></span><span>{feature}</span></div>)}</div>
      <Link href={href} className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 ${dark ? 'bg-white text-[#07120f]' : featured ? 'bg-[#12e89a] text-[#04251a]' : 'border border-black/10 bg-white text-slate-900'}`}>{cta}<ArrowRight className="size-4" /></Link>
    </article>
  )
}

function TrustItem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{children}</p></div></div>
}
