import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Link2,
  MessageCircle,
  PackageCheck,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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
    'Creá tu tienda online, compartí un link y recibí pedidos ordenados por WhatsApp. Empezá gratis y activá más herramientas cuando tu negocio las necesite.',
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
    answer: 'No. Cargás tus productos desde un panel simple y VOLTA se ocupa de convertirlos en una tienda lista para compartir.',
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
    answer: 'Sí. No hay permanencia. Cancelás cuando quieras y VOLTA te muestra claramente hasta cuándo conserva vigencia tu período pago.',
  },
]

const storeBenefits = [
  ['Tu tienda, siempre lista', 'Un solo link actualizado reemplaza fotos, precios y opciones mandadas una por una.'],
  ['Pedido ordenado', 'Productos, variantes y cantidades llegan preparados para continuar la conversación por WhatsApp.'],
  ['Hecho para celular', 'La experiencia de catálogo, producto y carrito está diseñada primero para mobile.'],
] as const

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RootPage({ searchParams }: { searchParams: RootSearchParams }) {
  const params = await searchParams
  const code = firstValue(params.code)
  const oauthError = firstValue(params.error)

  // Safety net: if Supabase falls back to Site URL instead of our explicit
  // callback, never leave the authorization code stranded on the homepage.
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
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f6] text-[#07120f] selection:bg-[#12e89a] selection:text-[#032319]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <header className="sticky top-0 z-50 border-b border-black/6 bg-[#f5f7f6]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" aria-label="VOLTA inicio" className="shrink-0"><VoltaBrand /></Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Navegación principal">
            <a href="#como-funciona" className="transition hover:text-slate-950">Cómo funciona</a>
            <a href="#ejemplo" className="transition hover:text-slate-950">Ejemplo</a>
            <a href="#planes" className="transition hover:text-slate-950">Planes</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:inline-flex">Ingresar</Link>
            <Link href="/login" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#07120f] px-4 text-sm font-semibold text-white transition hover:bg-[#16231f] sm:px-5">
              Crear tienda gratis <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pt-20">
        <div className="pointer-events-none absolute left-[12%] top-[-180px] h-[460px] w-[620px] rounded-full bg-[#12e89a]/14 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0aa66f]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#087e56] shadow-sm">
              <MessageCircle className="size-3.5" /> Vendé por donde ya vendés
            </div>
            <h1 className="mt-6 max-w-[760px] text-balance text-[3.35rem] font-semibold leading-[.91] tracking-[-0.072em] sm:text-[5rem] lg:text-[5.9rem]">
              Tu catálogo online para vender por WhatsApp.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Mostrá productos, precios y opciones en una tienda profesional. Tu cliente elige y el pedido llega ordenado a WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/login" className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-7 text-sm font-bold text-[#04251a] shadow-[0_18px_44px_rgba(18,232,154,.24)] transition hover:-translate-y-0.5 hover:bg-[#0fdb91]">
                Crear mi tienda gratis <ArrowRight className="size-4" />
              </Link>
              <Link href="/tienda/strongprotein" className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50">
                Ver tienda real <Store className="size-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Sin tarjeta</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Gratis para empezar</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Cancelás cuando quieras</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[610px]">
            <div className="absolute inset-x-[12%] bottom-[-5%] h-28 rounded-full bg-[#12e89a]/22 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[#07120f] p-3 shadow-[0_32px_100px_rgba(7,18,15,.24)] sm:p-5">
              <div className="relative min-h-[360px] overflow-hidden rounded-[27px] bg-[radial-gradient(circle_at_22%_8%,rgba(18,232,154,.18),transparent_34%),linear-gradient(145deg,#0b1713,#07100e)] sm:min-h-[430px]">
                <div className="absolute left-5 top-5 z-10 max-w-[220px] sm:left-7 sm:top-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300">Así puede verse tu tienda</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-.04em] text-white sm:text-2xl">NOVA Studio</p>
                  <p className="mt-2 text-xs leading-5 text-white/60">Una marca ficticia creada para mostrar VOLTA con productos reales dentro del ejemplo.</p>
                </div>
                <NovaHeroMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-black/6 bg-[#08120f] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#66f5bd]">Menos conversaciones repetidas</p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Dejá de mandar fotos, precios y opciones uno por uno.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">Un link hace el trabajo de catálogo. Vos seguís atendiendo y cerrando la venta por WhatsApp.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FlowCard number="1" icon={<PackageCheck className="size-5" />} title="Subí">Fotos, precios y variantes desde un panel simple.</FlowCard>
            <FlowCard number="2" icon={<Link2 className="size-5" />} title="Compartí">Instagram, WhatsApp, QR o donde ya están tus clientes.</FlowCard>
            <FlowCard number="3" icon={<ShoppingBag className="size-5" />} title="Recibí">El pedido llega con productos, opciones y cantidades.</FlowCard>
          </div>
        </div>
      </section>

      <section id="ejemplo" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-9 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Producto en acción</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Catálogo. Detalle. Pedido. Sin saltos raros.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">El ejemplo NOVA Studio muestra el recorrido completo. Y si querés tocar una tienda funcionando de verdad, Strong.Protein está abierta.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/tienda/strongprotein" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#07120f] px-6 text-sm font-semibold text-white">Abrir tienda real <ExternalLink className="size-4" /></Link>
                <a href="#planes" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-slate-800">Ver planes</a>
              </div>
            </div>
            <div className="overflow-hidden rounded-[30px] border border-black/7 bg-[#07120f] p-4 shadow-[0_28px_90px_rgba(7,18,15,.15)] sm:p-6">
              <NovaJourneyMock />
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {storeBenefits.map(([title, text], index) => (
              <div key={title} className="rounded-[24px] border border-black/7 bg-white p-6">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  {index === 0 ? <Store className="size-5" /> : index === 1 ? <MessageCircle className="size-5" /> : <ImageIcon className="size-5" />}
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-.035em]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="border-y border-black/6 bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Planes para cada etapa</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Empezá gratis. Pagá cuando VOLTA ya te esté dando valor.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">VOLTA es el plan natural para vender en serio. PRO suma inteligencia cuando ya tenés datos para aprovecharla.</p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:items-stretch">
            <PriceCard eyebrow="Para empezar" title="Gratis" price="$0" detail="Sin tarjeta · sin vencimiento" features={[`Hasta ${FREE_PLAN.productLimit} productos`, '1 imagen por producto', 'Carrito + WhatsApp', 'Tienda pública y personalización']} cta="Crear gratis" href="/login" />
            <PriceCard featured eyebrow="Para vender" title="VOLTA" price={formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)} detail={`por mes durante ${VOLTA_BILLING_PLAN.introCycles} meses · después ${formatBillingAmount(VOLTA_BILLING_PLAN.standardAmount)}/mes`} features={['Productos sin límite artificial', 'Hasta 12 imágenes por producto', 'QR y links medibles', 'Rendimiento comercial completo']} cta="Elegir VOLTA" href="/login?next=%2Fadmin%2Fplan" />
            <PriceCard dark eyebrow="Para crecer" title="VOLTA PRO" price={formatBillingAmount(VOLTA_PRO_PLAN.standardAmount)} detail="por mes · cancelás cuando quieras" features={['Todo VOLTA incluido', 'Campañas y atribución', 'Comparación de conversiones', 'Inteligencia y recomendaciones']} cta="Elegir PRO" href="/login?next=%2Fadmin%2Fplan" />
          </div>

          <div className="mt-6 grid gap-3 rounded-[24px] border border-black/7 bg-[#f7f9f8] p-5 sm:grid-cols-3 sm:p-6">
            <TrustItem icon={<ShieldCheck className="size-4" />} title="Cobro seguro">La suscripción paga se procesa en Mercado Pago.</TrustItem>
            <TrustItem icon={<CheckCircle2 className="size-4" />} title="Sin permanencia">Cancelás cuando quieras desde tu panel.</TrustItem>
            <TrustItem icon={<QrCode className="size-4" />} title="Tu negocio primero">VOLTA no cobra a tus clientes ni toca tus ventas.</TrustItem>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0a8f62]">Preguntas simples</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em]">Lo importante antes de empezar.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[20px] border border-black/7 bg-white px-5 py-4 open:shadow-sm">
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-slate-900 marker:hidden">{faq.question}</summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#07120f] px-6 py-10 text-white shadow-[0_30px_100px_rgba(7,18,15,.18)] sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-emerald-300"><Sparkles className="size-4" /> Tu tienda puede estar online hoy</div>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Tu próximo cliente no necesita otro mensaje con fotos. Necesita tu tienda.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Empezá con Gratis. Sin tarjeta y sin tener que aprender ecommerce.</p>
          </div>
          <Link href="/login" className="mt-7 inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-7 text-sm font-bold text-[#04251a] transition hover:-translate-y-0.5 lg:mt-0">Crear mi tienda gratis <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-black/6 bg-white px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><VoltaBrand /><span>Catálogo online para vender por WhatsApp.</span></div>
          <div className="flex flex-wrap gap-5"><Link href="/privacy" className="hover:text-slate-900">Privacidad</Link><Link href="/terms" className="hover:text-slate-900">Términos</Link><Link href="/login" className="hover:text-slate-900">Ingresar</Link></div>
        </div>
      </footer>
    </main>
  )
}

function NovaHeroMock() {
  return (
    <div className="absolute bottom-[-42px] right-[-8px] w-[72%] max-w-[410px] rotate-[4deg] rounded-[34px] border-[7px] border-[#202522] bg-[#f6f2ea] p-3 shadow-[0_30px_70px_rgba(0,0,0,.38)] sm:right-[3%]">
      <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20" />
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">NOVA Studio</p><p className="mt-1 text-sm font-semibold tracking-[-.03em] text-slate-950">Accesorios que te acompañan</p></div>
        <div className="flex size-8 items-center justify-center rounded-full bg-[#0e1713] text-[9px] font-bold text-white">NS</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <NovaProduct image="/landing/nova-bag.svg" name="Bolso Niza" price="$32.000" />
        <NovaProduct image="/landing/nova-shirt.svg" name="Remera Oversize" price="$18.000" />
        <NovaProduct image="/landing/nova-cap.svg" name="Gorra Classic" price="$15.000" />
        <NovaProduct image="/landing/nova-bottle.svg" name="Botella Térmica" price="$16.000" />
      </div>
      <div className="mt-3 rounded-xl bg-[#0e1713] px-3 py-2.5 text-center text-[10px] font-bold text-white">Ver catálogo</div>
    </div>
  )
}

function NovaJourneyMock() {
  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-label="Recorrido visual de una tienda VOLTA">
      <div className="rounded-[24px] bg-[#f6f2ea] p-3 text-[#111814]">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-black/15" />
        <p className="text-[8px] font-bold uppercase tracking-[.14em] text-slate-500">NOVA Studio</p>
        <p className="mt-1 text-xs font-semibold">Todos los productos</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <NovaProduct image="/landing/nova-bag.svg" name="Bolso Niza" price="$32.000" compact />
          <NovaProduct image="/landing/nova-shirt.svg" name="Remera" price="$18.000" compact />
          <NovaProduct image="/landing/nova-cap.svg" name="Gorra Classic" price="$15.000" compact />
          <NovaProduct image="/landing/nova-bottle.svg" name="Botella" price="$16.000" compact />
        </div>
      </div>
      <div className="rounded-[24px] bg-[#f6f2ea] p-3 text-[#111814]">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-black/15" />
        <div className="overflow-hidden rounded-xl bg-[#e9e4db]">
          <Image src="/landing/nova-bag.svg" alt="Bolso negro NOVA Studio" width={420} height={320} className="aspect-[4/3] w-full object-cover" />
        </div>
        <p className="mt-3 text-[8px] font-bold uppercase tracking-[.13em] text-slate-500">NOVA Studio</p>
        <p className="mt-1 text-sm font-semibold">Bolso Niza</p><p className="mt-1 text-sm font-bold">$32.000</p>
        <div className="mt-3 flex gap-1.5"><span className="size-4 rounded-full border border-black/15 bg-black" /><span className="size-4 rounded-full border border-black/15 bg-[#c7b9a5]" /><span className="size-4 rounded-full border border-black/15 bg-[#3f6955]" /></div>
        <div className="mt-3 rounded-xl bg-[#0e1713] px-2 py-2 text-center text-[9px] font-bold text-white">Agregar al pedido</div>
      </div>
      <div className="rounded-[24px] bg-[#f6f2ea] p-3 text-[#111814]">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-black/15" />
        <p className="text-[8px] font-bold uppercase tracking-[.13em] text-slate-500">Tu pedido</p>
        <div className="mt-3 space-y-2">
          <MiniOrder image="/landing/nova-bag.svg" name="Bolso Niza" price="$32.000" />
          <MiniOrder image="/landing/nova-cap.svg" name="Gorra Classic" price="$15.000" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-xs"><span>Total</span><strong>$47.000</strong></div>
        <div className="mt-3 rounded-xl bg-[#0e1713] px-2 py-2.5 text-center text-[9px] font-bold text-white">Pedir por WhatsApp</div>
      </div>
    </div>
  )
}

function NovaProduct({ image, name, price, compact = false }: { image: string; name: string; price: string; compact?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-lg bg-[#e9e4db]"><Image src={image} alt={name} width={320} height={260} className={`w-full object-cover ${compact ? 'aspect-square' : 'aspect-[5/4]'}`} /></div>
      <p className={`${compact ? 'mt-1 text-[7px]' : 'mt-1.5 text-[8px]'} truncate font-semibold text-slate-800`}>{name}</p>
      <p className={`${compact ? 'text-[7px]' : 'text-[8px]'} text-slate-500`}>{price}</p>
    </div>
  )
}

function MiniOrder({ image, name, price }: { image: string; name: string; price: string }) {
  return <div className="flex items-center gap-2 rounded-xl border border-black/7 bg-white/60 p-2"><Image src={image} alt="" width={48} height={48} className="size-10 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[9px] font-semibold">{name}</p><p className="text-[8px] text-slate-500">1 unidad</p></div><span className="text-[9px] font-bold">{price}</span></div>
}

function FlowCard({ number, icon, title, children }: { number: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/9 bg-white/[.045] p-5">
      <div className="flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-2xl bg-[#12e89a]/12 text-[#66f5bd]">{icon}</div><span className="text-xs font-semibold text-white/35">0{number}</span></div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{children}</p>
    </div>
  )
}

function PriceCard({ eyebrow, title, price, detail, features, cta, href, featured = false, dark = false }: { eyebrow: string; title: string; price: string; detail: string; features: string[]; cta: string; href: string; featured?: boolean; dark?: boolean }) {
  const shell = dark ? 'volta-contrast-dark border-[#173329] bg-[#07120f] text-white' : featured ? 'border-emerald-400/50 bg-[linear-gradient(180deg,#f3fff9,#ffffff)] shadow-[0_26px_80px_rgba(18,232,154,.12)]' : 'border-black/7 bg-[#fbfcfb]'
  return (
    <article className={`relative flex h-full flex-col rounded-[26px] border p-6 sm:p-7 ${shell}`}>
      {featured ? <span className="absolute right-5 top-5 rounded-full bg-[#12e89a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#05251a]">Más elegido</span> : null}
      <p className={`text-[10px] font-bold uppercase tracking-[.18em] ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>{eyebrow}</p>
      <h3 className={`mt-3 text-2xl font-semibold tracking-[-.045em] ${dark ? 'text-white' : 'text-slate-950'}`} style={dark ? { color: '#f8fafc', WebkitTextFillColor: '#f8fafc' } : undefined}>{title}</h3>
      <div className="mt-6"><div className="flex items-end gap-2"><span className={`text-4xl font-semibold tracking-[-.055em] ${dark ? 'text-white' : 'text-slate-950'}`} style={dark ? { color: '#f8fafc', WebkitTextFillColor: '#f8fafc' } : undefined}>{price}</span>{price !== '$0' ? <span className={`pb-1 text-xs ${dark ? 'text-white/55' : 'text-slate-500'}`}>/mes</span> : null}</div><p className={`mt-2 min-h-10 text-xs leading-5 ${dark ? 'text-white/58' : 'text-slate-500'}`}>{detail}</p></div>
      <div className="mt-6 flex-1 space-y-3">{features.map((feature) => <div key={feature} className={`flex items-start gap-2.5 text-sm ${dark ? 'text-white/80' : 'text-slate-700'}`}><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-emerald-400/12 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}><Check className="size-3" /></span><span>{feature}</span></div>)}</div>
      <Link href={href} className={`mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 ${featured ? 'bg-[#12e89a] text-[#04251a]' : dark ? 'bg-white text-[#07120f]' : 'border border-black/10 bg-white text-slate-900'}`}>{cta}<ArrowRight className="size-4" /></Link>
    </article>
  )
}

function TrustItem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{children}</p></div></div>
}
