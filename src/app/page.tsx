import type { Metadata } from 'next'
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
import { LandingAnalytics } from '@/components/analytics/LandingAnalytics'
import { VoltaBrand } from '@/components/brand/VoltaBrand'
import {
  FREE_PLAN,
  formatBillingAmount,
  VOLTA_BILLING_PLAN,
  VOLTA_PRO_PLAN,
} from '@/lib/billing/plan'
import type { SaasFunnelEventType } from '@/lib/analytics/saas-events'

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

const NOVA_HERO = '/landing/nova/hero-editorial.jpg'
const NOVA_SET = '/landing/nova/essential-set.jpg'

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
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8f5] text-[#07120f] selection:bg-[#12e89a] selection:text-[#032319]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <LandingAnalytics />

      <header
        className="sticky top-0 z-50 border-b border-black/6 bg-[#f6f8f5]/92 px-4 backdrop-blur-xl sm:px-6"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4">
          <Link href="/" aria-label="VOLTA Store - inicio" className="shrink-0">
            <span className="inline-flex items-center gap-2.5">
              <VoltaBrand />
              <span className="hidden text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 sm:inline">/ Store</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Navegación principal">
            <a href="#como-funciona" className="transition hover:text-slate-950">Cómo funciona</a>
            <a href="#experiencia" className="transition hover:text-slate-950">Producto</a>
            <a href="#planes" className="transition hover:text-slate-950">Planes</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden min-h-11 items-center text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:inline-flex">Ingresar</Link>
            <Link
              href="/login"
              data-saas-event="landing_primary_cta_click"
              data-saas-location="header"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#07120f] px-4 text-sm font-semibold text-white transition hover:bg-[#16231f] sm:px-5"
            >
              Crear gratis <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section
        id="landing-hero"
        data-store-landing-section="hero"
        className="relative px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:pb-18 lg:pt-16"
      >
        <div className="pointer-events-none absolute left-[7%] top-[-190px] h-[470px] w-[620px] rounded-full bg-[#12e89a]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-14">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0aa66f]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#087e56] shadow-sm">
              <MessageCircle className="size-3.5" /> Catálogo + carrito + WhatsApp
            </div>
            <h1 className="mt-5 text-balance text-[2.85rem] font-semibold leading-[.97] tracking-[-0.062em] sm:text-[4rem] lg:text-[4.35rem]">
              Tu tienda online, lista para vender por WhatsApp.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Mostrá productos, precios y opciones con una presencia profesional. Tu cliente elige y el pedido llega ordenado a WhatsApp.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                data-saas-event="landing_primary_cta_click"
                data-saas-location="hero"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-6 text-sm font-bold text-[#04251a] shadow-[0_16px_38px_rgba(18,232,154,.22)] transition hover:-translate-y-0.5 hover:bg-[#0fdb91]"
              >
                Crear mi tienda gratis <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/tienda/strongprotein"
                data-saas-event="landing_real_store_click"
                data-saas-location="hero"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Ver tienda real <ExternalLink className="size-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Sin tarjeta</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Publicás en minutos</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Sin comisión por venta</span>
            </div>
          </div>
          <DesktopStorePreview />
        </div>
      </section>

      <section
        id="como-funciona"
        data-store-landing-section="steps"
        className="border-y border-black/6 bg-white px-4 py-12 sm:px-6 sm:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Cómo funciona</p>
              <h2 className="mt-3 max-w-lg text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Cargá. Compartí. Vendé.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">VOLTA ordena lo que pasa antes del mensaje. Vos seguís cerrando la venta donde ya hablás con tus clientes.</p>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[24px] border border-black/7 bg-black/7 md:grid-cols-3">
            <StepRow icon={<Store className="size-5" />} number="01" title="Cargá">Productos, fotos, precios y opciones.</StepRow>
            <StepRow icon={<QrCode className="size-5" />} number="02" title="Compartí">Un link en Instagram, WhatsApp o QR.</StepRow>
            <StepRow icon={<MessageCircle className="size-5" />} number="03" title="Vendé">El pedido llega armado a WhatsApp.</StepRow>
          </div>
        </div>
      </section>

      <section
        id="experiencia"
        data-store-landing-section="product"
        className="px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      >
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#06110e] text-white shadow-[0_30px_100px_rgba(7,18,15,.16)]">
          <div className="grid items-center gap-10 p-5 sm:p-8 lg:grid-cols-[.88fr_1.12fr] lg:gap-14 lg:p-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">Experiencia de producto</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-[2.9rem]">Elegir simple. Pedir simple.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">El cliente entiende el producto, elige opciones, arma el carrito y continúa por WhatsApp. Sin un checkout que complique la venta.</p>
              <div className="mt-6 divide-y divide-white/8 border-y border-white/8">
                <DarkFeature>Productos y variantes claras</DarkFeature>
                <DarkFeature>Carrito corto y entendible</DarkFeature>
                <DarkFeature>Pedido estructurado</DarkFeature>
                <DarkFeature>Diseño adaptable a tu marca</DarkFeature>
              </div>
            </div>
            <MobileProductPreview />
          </div>
        </div>
      </section>

      <section data-store-landing-section="proof" className="px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto grid max-w-7xl gap-5 border-y border-black/8 py-7 lg:grid-cols-[1fr_auto] lg:items-center lg:py-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Store className="size-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Producto real</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Probalo como cliente.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Recorré una tienda publicada y seguí el flujo que termina en WhatsApp. Sin testimonios inventados: producto funcionando.</p>
            </div>
          </div>
          <Link
            href="/tienda/strongprotein"
            data-saas-event="landing_real_store_click"
            data-saas-location="proof"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#07120f] px-5 text-sm font-semibold text-white"
          >
            Ver tienda funcionando <ExternalLink className="size-4" />
          </Link>
        </div>
      </section>

      <section
        id="planes"
        data-store-landing-section="pricing"
        className="border-y border-black/6 bg-white px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Planes</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Empezá gratis. Subí cuando lo necesites.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Gratis para arrancar. VOLTA para vender sin límites de catálogo. PRO para entender mejor qué genera oportunidades.</p>
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
              eventType="landing_free_cta_click"
              plan="free"
            />
            <PricingCard
              featured
              eyebrow="Para vender"
              title="VOLTA"
              price={formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)}
              detail={`Primeros ${VOLTA_BILLING_PLAN.introCycles} meses · después ${formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes`}
              features={['Productos ilimitados', 'Hasta 12 imágenes por producto', 'Variantes y opciones', 'QR y links medibles', 'Visitas, pedidos y conversión']}
              cta="Elegir VOLTA"
              href="/login?next=%2Fadmin%2Fplan"
              eventType="landing_volta_cta_click"
              plan="volta"
            />
            <PricingCard
              dark
              eyebrow="Para crecer"
              title="VOLTA PRO"
              price={formatBillingAmount(VOLTA_PRO_PLAN.standardAmount)}
              detail="Entendé qué genera oportunidades y qué hacer después. Cancelás cuando quieras."
              features={['Todo VOLTA incluido', 'Campañas y atribución', 'Compará tus canales', 'Detectá oportunidades', 'Recomendaciones comerciales']}
              cta="Elegir PRO"
              href="/login?next=%2Fadmin%2Fplan"
              eventType="landing_pro_cta_click"
              plan="pro"
            />
          </div>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-black/7 bg-[#f7f9f8] p-5 sm:grid-cols-3">
            <TrustItem icon={<ShieldCheck className="size-4" />} title="Cobro seguro">La suscripción paga se procesa en Mercado Pago.</TrustItem>
            <TrustItem icon={<CheckCircle2 className="size-4" />} title="Sin permanencia">Cancelás cuando quieras desde tu panel.</TrustItem>
            <TrustItem icon={<QrCode className="size-4" />} title="Tus ventas son tuyas">VOLTA no cobra a tus clientes ni toca tus ventas.</TrustItem>
          </div>
        </div>
      </section>

      <section
        id="landing-final-cta"
        data-store-landing-section="cta"
        className="px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#07120f] px-6 py-9 text-white sm:px-9 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">Empezá sin pagar</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Tu catálogo puede estar online hoy.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Cargá tus primeros productos, compartí el link y dejá que el pedido llegue ordenado.</p>
          </div>
          <Link
            href="/login"
            data-saas-event="landing_primary_cta_click"
            data-saas-location="final"
            className="mt-6 inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-6 text-sm font-bold text-[#04251a] transition hover:-translate-y-0.5 lg:mt-0"
          >
            Crear mi tienda gratis <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/6 bg-white px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><VoltaBrand /><span>Catálogo online para vender por WhatsApp.</span></div>
          <div className="flex flex-wrap gap-5"><Link className="hover:text-slate-900" href="/privacy">Privacidad</Link><Link className="hover:text-slate-900" href="/terms">Términos</Link><Link className="hover:text-slate-900" href="/login">Ingresar</Link></div>
        </div>
      </footer>
    </main>
  )
}

function DesktopStorePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <div className="absolute inset-x-[12%] bottom-[-8%] h-28 rounded-full bg-[#12e89a]/16 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-black/8 bg-[#06110e] p-2 shadow-[0_32px_90px_rgba(7,18,15,.22)] sm:p-3">
        <div className="flex items-center justify-between px-2 pb-2 pt-1 text-[10px] font-medium text-white/50 sm:px-3">
          <span>NOVA Studio</span>
          <span className="hidden sm:inline">Producto → carrito → WhatsApp</span>
        </div>
        <div className="overflow-hidden rounded-[22px] bg-[#0a1713]">
          <div className="grid min-h-[420px] sm:grid-cols-[.29fr_.71fr]">
            <aside className="hidden border-r border-white/8 bg-[#06110e] p-5 text-white sm:flex sm:flex-col">
              <p className="text-[11px] font-medium text-white/70">NOVA Studio</p>
              <div className="mt-8">
                <p className="text-3xl font-semibold tracking-[.12em]">NOVA<span className="text-[#12e89a]">·</span></p>
                <p className="mt-1 text-xs tracking-[.28em] text-white/72">STUDIO</p>
              </div>
              <p className="mt-7 font-serif text-[1.35rem] leading-[1.08]">Objetos simples.<br />Diseño que queda.</p>
              <p className="mt-3 text-[9px] leading-4 text-white/48">Piezas funcionales, materiales honestos y detalles que elevan lo cotidiano.</p>
              <span className="mt-5 inline-flex w-fit rounded-full bg-[#12e89a] px-3 py-2 text-[9px] font-bold text-[#05251a]">Ver colección</span>
              <div className="mt-auto rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] p-3">
                <p className="text-[9px] font-semibold text-white">Compra por WhatsApp</p>
                <p className="mt-1 text-[8px] leading-3 text-white/45">Elegís en la tienda. Cerrás el pedido por WhatsApp.</p>
              </div>
            </aside>

            <div className="bg-[#f7f3ed] p-2 sm:p-3">
              <div className="relative overflow-hidden rounded-[16px] bg-[#e8ddd0]">
                <img src={NOVA_HERO} alt="Colección premium NOVA fotografiada para la tienda demo de VOLTA" className="h-[190px] w-full object-cover sm:h-[220px]" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/48 to-transparent" />
                <div className="absolute inset-y-0 left-0 flex max-w-[64%] flex-col justify-center p-5 sm:p-7">
                  <p className="text-[8px] font-bold uppercase tracking-[.15em] text-[#0b9364]">Colección destacada</p>
                  <p className="mt-2 font-serif text-[1.65rem] leading-[.98] tracking-[-.04em] text-[#101713] sm:text-[2.15rem]">Esenciales,<br />elevados.<br />Hechos para durar.</p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <PreviewProductCard image={NOVA_HERO} position="44% center" title="NOVA Bottle" price="$18.000" />
                <PreviewProductCard image={NOVA_SET} position="center" title="Essential Set" price="$42.000" />
                <PreviewProductCard image={NOVA_HERO} position="88% center" title="NOVA Cap" price="$22.000" hideOnMobile />
                <PreviewProductCard image={NOVA_SET} position="20% center" title="Daily Objects" price="$28.000" hideOnMobile />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 rounded-[14px] bg-white px-3 py-2.5 shadow-sm">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-slate-900">Carrito · 1 producto</p>
                  <p className="mt-0.5 hidden text-[8px] text-slate-400 sm:block">Tu selección queda lista para enviar.</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#12e89a] px-3 py-2 text-[8px] font-bold text-[#05251a]">Continuar por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewProductCard({ image, position, title, price, hideOnMobile = false }: { image: string; position: string; title: string; price: string; hideOnMobile?: boolean }) {
  return (
    <div className={`${hideOnMobile ? 'hidden sm:block' : ''} overflow-hidden rounded-[13px] bg-white shadow-sm`}>
      <img src={image} alt="" className="aspect-[1.05/1] w-full object-cover" style={{ objectPosition: position }} />
      <div className="p-2">
        <p className="truncate text-[8px] font-semibold text-slate-900">{title}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-[8px] text-slate-500">{price}</span>
          <span className="flex size-4 items-center justify-center rounded-full bg-[#07120f] text-[10px] text-white">+</span>
        </div>
      </div>
    </div>
  )
}

function MobileProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div className="absolute inset-x-[18%] bottom-[-5%] h-24 rounded-full bg-[#12e89a]/12 blur-3xl" />
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#09130f] p-2 shadow-[0_28px_80px_rgba(0,0,0,.34)]">
        <div className="overflow-hidden rounded-[29px] border border-white/6 bg-[#07120f]">
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <span className="text-[11px] font-semibold">9:41</span>
            <span className="text-sm font-semibold tracking-[-.03em]">VOLTA<span className="text-[#12e89a]">·Store</span></span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white/7 text-[11px]">1</span>
          </div>
          <img src={NOVA_SET} alt="Essential Set de NOVA en el detalle mobile de una tienda VOLTA" className="aspect-[1.2/1] w-full object-cover" />
          <div className="p-5 sm:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#28dda1]">Colección destacada</p>
            <h3 className="mt-2 font-serif text-3xl tracking-[-.04em] text-white">Essential Set</h3>
            <p className="mt-1 text-xl font-medium text-white">$42.000</p>
            <p className="mt-3 text-xs leading-5 text-white/58">Elegí la opción y terminá el pedido por WhatsApp.</p>
            <p className="mt-4 text-[10px] font-semibold text-white/80">Color</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full border border-[#12e89a] bg-[#12e89a]/10 px-3 py-2 text-[9px] text-[#67f3be]">Negro</span>
              <span className="rounded-full border border-white/8 px-3 py-2 text-[9px] text-white/55">Crudo</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-[16px] border border-white/7 bg-white/[.035] p-3">
              <MiniTrust title="Pedido" text="Ordenado" />
              <MiniTrust title="Envío" text="A coordinar" />
              <MiniTrust title="Pago" text="Con tu cliente" />
            </div>
            <div className="mt-4 flex min-h-12 items-center justify-between rounded-[15px] bg-[#12e89a] px-4 text-sm font-bold text-[#032319]">
              <span className="inline-flex items-center gap-2"><MessageCircle className="size-4" /> Pedir por WhatsApp</span>
              <ArrowRight className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniTrust({ title, text }: { title: string; text: string }) {
  return <div><p className="text-[8px] font-semibold text-white/78">{title}</p><p className="mt-1 text-[7px] leading-3 text-white/35">{text}</p></div>
}

function StepRow({ icon, number, title, children }: { icon: React.ReactNode; number: string; title: string; children: React.ReactNode }) {
  return (
    <article className="bg-[#f8faf8] p-5 sm:p-6">
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
  return <div className="flex items-center gap-2.5 py-3 text-sm text-white/82"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-300"><Check className="size-3" /></span><span>{children}</span></div>
}

function PricingCard({ eyebrow, title, price, detail, features, cta, href, eventType, plan, featured = false, dark = false }: {
  eyebrow: string
  title: string
  price: string
  detail: string
  features: readonly string[]
  cta: string
  href: string
  eventType: Extract<SaasFunnelEventType, 'landing_free_cta_click' | 'landing_volta_cta_click' | 'landing_pro_cta_click'>
  plan: 'free' | 'volta' | 'pro'
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
      <Link
        href={href}
        data-saas-event={eventType}
        data-saas-location="pricing"
        data-saas-plan={plan}
        className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 ${dark ? 'bg-white text-[#07120f]' : featured ? 'bg-[#12e89a] text-[#04251a]' : 'border border-black/10 bg-white text-slate-900'}`}
      >
        {cta}<ArrowRight className="size-4" />
      </Link>
    </article>
  )
}

function TrustItem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{children}</p></div></div>
}
