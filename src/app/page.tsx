import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  Instagram,
  Link2,
  MessageCircle,
  PackageCheck,
  QrCode,
  Send,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  WandSparkles,
} from 'lucide-react'
import { VoltaBrand } from '@/components/brand/VoltaBrand'

export const metadata: Metadata = {
  title: 'VOLTA — Tu catálogo online para vender por WhatsApp',
  description:
    'Subí tus productos, compartí tu tienda y recibí pedidos ordenados directamente en WhatsApp. Simple, profesional y listo para vender.',
  alternates: {
    canonical: 'https://voltastore.app',
  },
}

type RootSearchParams = Promise<Record<string, string | string[] | undefined>>

const benefits = [
  'Tu catálogo completo en un solo link',
  'Pedidos claros, con productos, opciones y cantidades',
  'Una tienda profesional sin aprender ecommerce',
  'Lista para compartir en Instagram, WhatsApp, Facebook o QR',
]

const audiences = [
  'Indumentaria y accesorios',
  'Suplementos y alimentos',
  'Cosmética y cuidado personal',
  'Emprendimientos y tiendas locales',
  'Mayoristas y catálogos por encargo',
  'Negocios que hoy venden mandando fotos',
]

const faqs = [
  {
    question: '¿Necesito una página web o saber de tecnología?',
    answer: 'No. Creás tu tienda desde un panel simple, cargás tus productos y VOLTA te da el link listo para compartir.',
  },
  {
    question: '¿Los clientes pagan dentro de VOLTA?',
    answer: 'No por ahora. El cliente arma el pedido y VOLTA lo envía ordenado a tu WhatsApp. El pago y la entrega los coordinás como ya lo hacés hoy.',
  },
  {
    question: '¿Puedo usarlo si vendo por Instagram?',
    answer: 'Sí. La idea es justamente poner el link de tu tienda en la bio, historias, mensajes, campañas o donde ya conseguís clientes.',
  },
  {
    question: '¿Cuántos productos puedo cargar?',
    answer: 'Hoy VOLTA no tiene un límite artificial de productos. Queremos que puedas validar y usar tu catálogo sin estar contando espacios.',
  },
  {
    question: '¿Puedo cancelar cuando quiera?',
    answer: 'Sí. No hay permanencia. Podés cancelar cuando quieras.',
  },
]

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RootPage({ searchParams }: { searchParams: RootSearchParams }) {
  const params = await searchParams
  const code = firstValue(params.code)
  const oauthError = firstValue(params.error)

  // Safety net: if Supabase falls back to Site URL instead of our explicit
  // /auth/callback redirect, never leave the OAuth authorization code stranded
  // on the public homepage. Forward it to the existing server callback so the
  // PKCE code can be exchanged for a session and the user can reach the panel.
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f6f7] text-[#07120f] selection:bg-[#12e89a] selection:text-[#032319]">
      <header className="sticky top-0 z-50 border-b border-black/6 bg-[#f4f6f7]/88 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" aria-label="VOLTA inicio" className="shrink-0">
            <VoltaBrand />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Navegación principal">
            <a href="#como-funciona" className="transition hover:text-slate-950">Cómo funciona</a>
            <a href="#demo" className="transition hover:text-slate-950">Demo</a>
            <a href="#beneficios" className="transition hover:text-slate-950">Beneficios</a>
            <a href="#precio" className="transition hover:text-slate-950">Precio</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:inline-flex">
              Ingresar
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#07120f] px-4 text-sm font-semibold text-white transition hover:bg-[#16231f] sm:px-5"
            >
              Crear mi tienda
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#12e89a]/12 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0aa66f]/15 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#087e56] shadow-sm">
              <MessageCircle className="size-3.5" />
              Vendé por donde ya vendés
            </div>
            <h1 className="mt-6 max-w-[820px] text-balance text-[3.35rem] font-semibold leading-[.91] tracking-[-0.072em] sm:text-[5.2rem] lg:text-[6.25rem]">
              Tu catálogo online para vender por WhatsApp.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
              Subí tus productos, compartí tu tienda y recibí pedidos ordenados directamente en WhatsApp. Sin montar un ecommerce complejo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-7 text-sm font-bold text-[#04251a] shadow-[0_18px_44px_rgba(18,232,154,.25)] transition hover:-translate-y-0.5 hover:bg-[#0fdb91]"
              >
                Crear mi tienda
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/tienda/strongprotein"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Ver una tienda real
                <Store className="size-4" />
              </Link>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-500">Primeros 3 meses $15.000/mes · Después $30.000/mes · Cancelás cuando quieras.</p>
          </div>

          <StorefrontMock />
        </div>
      </section>

      <section className="border-y border-black/6 bg-[#08120f] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.84fr_1.16fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#66f5bd]">El problema</p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Dejá de mandar 40 fotos por WhatsApp.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              '“¿Tenés fotos de lo que vendés?”',
              '“¿Cuánto sale este?”',
              '“¿Qué colores o sabores quedan?”',
              '“Mandame de nuevo el catálogo.”',
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/9 bg-white/[.045] p-5 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
            <div className="sm:col-span-2 rounded-[22px] border border-[#12e89a]/25 bg-[#12e89a]/8 p-5 text-sm leading-6 text-emerald-100">
              Con VOLTA mandás un solo link. El cliente mira, elige, arma su pedido y llega a tu WhatsApp con todo ordenado.
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Simple desde el primer día" title="Subís. Compartís. Recibís el pedido." description="VOLTA se mete justo entre tus redes y tu WhatsApp. No cambia cómo vendés: lo ordena." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <ProcessCard number="01" icon={<PackageCheck className="size-5" />} title="Subí tus productos">
              Cargá fotos, precios, categorías, opciones y disponibilidad desde un panel pensado para personas, no para técnicos.
            </ProcessCard>
            <ProcessCard number="02" icon={<Link2 className="size-5" />} title="Compartí un link">
              Ponelo en Instagram, Facebook, WhatsApp, una campaña o un QR. Tu catálogo queda siempre disponible.
            </ProcessCard>
            <ProcessCard number="03" icon={<Send className="size-5" />} title="Recibí pedidos claros">
              El comprador elige productos, variantes y cantidades. VOLTA arma el mensaje y abre tu WhatsApp con el pedido listo.
            </ProcessCard>
          </div>
        </div>
      </section>

      <section id="demo" className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#07120f] text-white shadow-[0_30px_100px_rgba(7,18,15,.16)]">
          <div className="grid lg:grid-cols-[.82fr_1.18fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#66f5bd]">Demo real</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Mirá VOLTA como la ve un comprador.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Navegá una tienda real, abrí productos, elegí opciones, agregá al carrito y recorré el checkout que termina en WhatsApp.
              </p>
              <Link href="/tienda/strongprotein" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#07120f] transition hover:bg-slate-100">
                Abrir Strong.Protein
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="border-t border-white/8 bg-white/[.035] p-5 sm:p-8 lg:border-l lg:border-t-0">
              <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-[#111d19] p-4 shadow-2xl">
                <div className="rounded-[23px] bg-[#f5f3ee] p-4 text-[#121a16]">
                  <div className="flex items-center justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Strong.Protein</p><p className="mt-1 text-lg font-semibold">Suplementos para todos los días.</p></div>
                    <div className="size-10 rounded-full bg-[#171d1a]" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniProduct label="Whey Protein" price="$38.000" />
                    <MiniProduct label="Creatina" price="$25.000" />
                  </div>
                  <div className="mt-4 rounded-2xl bg-[#171d1a] px-4 py-3 text-center text-sm font-bold text-white">Ver carrito · 2 productos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-y border-black/6 bg-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Menos fricción" title="Una tienda profesional sin cambiar tu forma de vender." description="Tus clientes compran con más claridad y vos seguís cerrando la conversación donde ya trabajás: WhatsApp." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <BenefitCard icon={<Smartphone className="size-5" />} title="Pensado para celular">Catálogo, productos, carrito y checkout diseñados primero para mobile.</BenefitCard>
            <BenefitCard icon={<WandSparkles className="size-5" />} title="Se ve profesional">Personalizá portada, colores, tipografía y estilo sin tener que diseñar una web.</BenefitCard>
            <BenefitCard icon={<Clock3 className="size-5" />} title="Disponible siempre">Tus productos se pueden consultar aunque estés trabajando, durmiendo o atendiendo otra cosa.</BenefitCard>
            <BenefitCard icon={<MessageCircle className="size-5" />} title="Cierra en WhatsApp">No obligamos a tus clientes a aprender otro canal. El pedido llega directo a tu conversación.</BenefitCard>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-start">
            <div className="rounded-[28px] border border-black/7 bg-[#f7f9f8] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0a8f62]">Lo que ganás</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 rounded-2xl bg-white p-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#08a16d]" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-black/7 bg-[#07120f] p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#66f5bd]">Sin vueltas</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">No necesitás configurar pagos, logística ni veinte integraciones para empezar.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">VOLTA prioriza lo que hace falta para que un negocio chico o mediano publique su catálogo y empiece a usarlo de verdad.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Para quién sirve" title="Si hoy vendés conversando, VOLTA encaja." description="Especialmente útil cuando Instagram y WhatsApp ya son tus canales comerciales y necesitás ordenar el catálogo antes de la conversación." />
          <div className="mt-10 flex flex-wrap gap-3">
            {audiences.map((audience) => (
              <span key={audience} className="rounded-full border border-black/8 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">{audience}</span>
            ))}
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <ChannelCard icon={<Instagram className="size-5" />} title="Instagram">Link en bio, historias, campañas o respuestas rápidas.</ChannelCard>
            <ChannelCard icon={<MessageCircle className="size-5" />} title="WhatsApp">Mandá tu tienda en vez de reenviar fotos y precios todo el día.</ChannelCard>
            <ChannelCard icon={<QrCode className="size-5" />} title="QR y presencial">Convertí mostrador, packaging, ferias o folletería en acceso directo al catálogo.</ChannelCard>
          </div>
        </div>
      </section>

      <section className="border-y border-black/6 bg-[#eafdf5] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#087a54]">Hecho para convertir</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">El camino más corto entre “lo vi” y “te lo pido”.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">VOLTA ordena el tramo que normalmente se pierde entre una historia de Instagram y una conversación de WhatsApp.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricMock icon={<BarChart3 className="size-4" />} label="Visitas" value="1.248" />
            <MetricMock icon={<ShoppingBag className="size-4" />} label="Productos abiertos" value="486" />
            <MetricMock icon={<Sparkles className="size-4" />} label="Agregados al carrito" value="173" />
            <MetricMock icon={<MessageCircle className="size-4" />} label="WhatsApps iniciados" value="94" />
          </div>
        </div>
      </section>

      <section id="precio" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#087a54]">Un solo plan</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Simple también para pagar.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">No hay cuatro niveles para entender. Empezás con todo VOLTA y validás si te ayuda a vender mejor.</p>
          </div>
          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-[32px] border border-black/8 bg-[#07120f] p-2 shadow-[0_28px_90px_rgba(7,18,15,.16)]">
            <div className="rounded-[27px] bg-white p-6 sm:p-9">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[#07895e]">Precio lanzamiento</p>
                  <div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-0.06em]">$15.000</span><span className="pb-1 text-sm text-slate-500">ARS / mes</span></div>
                  <p className="mt-2 text-sm text-slate-500">durante tus primeros 3 meses</p>
                </div>
                <div className="rounded-2xl bg-[#f2f6f4] px-4 py-3 text-sm text-slate-600"><strong className="text-slate-900">Después:</strong> $30.000/mes</div>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  'Catálogo y tienda profesional',
                  'Productos y variantes',
                  'Carrito y pedido a WhatsApp',
                  'Personalización visual',
                  'Compartir tu tienda',
                  'Sin permanencia',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-700"><Check className="size-4 text-[#08a16d]" />{item}</div>
                ))}
              </div>
              <Link href="/login" className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#12e89a] px-6 text-sm font-bold text-[#04251a] transition hover:bg-[#0fdb91]">
                Crear mi tienda
                <ArrowRight className="size-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-slate-500">Cancelás cuando quieras. Sin permanencia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/6 bg-white px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow="Preguntas frecuentes" title="Lo importante, claro." description="VOLTA está pensado para que puedas decidir rápido si te sirve." centered />
          <div className="mt-10 divide-y divide-black/7 rounded-[28px] border border-black/7 bg-[#fafbfb] px-5 sm:px-7">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold text-slate-900 sm:text-base">
                  {faq.question}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-lg font-normal shadow-sm ring-1 ring-black/5 transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#07120f] px-6 py-12 text-center text-white sm:px-10 sm:py-16">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#12e89a] text-[#04251a]"><Store className="size-5" /></div>
          <h2 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Tu próximo cliente no necesita otro mensaje con fotos. Necesita tu tienda.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Creá tu catálogo, compartí el link y empezá a ordenar tus ventas por WhatsApp.</p>
          <Link href="/login" className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-7 text-sm font-bold text-[#04251a] transition hover:bg-[#0fdb91]">
            Crear mi tienda
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[24px] border border-black/7 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><ShieldCheck className="size-5" /></div>
            <div>
              <h2 className="text-base font-semibold">Acceso seguro y datos claros</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Podés ingresar con Google o email. VOLTA usa la información básica necesaria para autenticar tu cuenta y no solicita acceso a Gmail, Drive, Calendar ni otros datos sensibles de Google.</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href="/privacy" className="text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950">Privacidad</Link>
                <Link href="/terms" className="text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950">Términos</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/6 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <VoltaBrand />
            <span>Tu catálogo online para vender por WhatsApp.</span>
          </div>
          <div className="flex flex-wrap gap-5 font-medium">
            <Link href="/privacy" className="transition hover:text-slate-950">Privacidad</Link>
            <Link href="/terms" className="transition hover:text-slate-950">Términos</Link>
            <Link href="/login" className="transition hover:text-slate-950">Ingresar</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function StorefrontMock() {
  return (
    <div className="relative mx-auto w-full max-w-[610px]">
      <div className="absolute -left-8 top-10 hidden rounded-2xl border border-black/7 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-xl sm:block">
        <span className="mr-2 inline-block size-2 rounded-full bg-[#12e89a]" />
        Pedido listo para WhatsApp
      </div>
      <div className="rounded-[34px] border border-black/8 bg-[#07120f] p-3 shadow-[0_36px_100px_rgba(7,18,15,.22)] sm:p-4">
        <div className="overflow-hidden rounded-[28px] bg-[#f5f3ee]">
          <div className="flex items-center justify-between border-b border-black/6 px-5 py-4">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-500">STRONG.PROTEIN</p><p className="mt-1 text-sm font-semibold">Elegí. Agregá. Pedí.</p></div>
            <div className="flex size-9 items-center justify-center rounded-full bg-[#18201c] text-white"><ShoppingBag className="size-4" /></div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="rounded-[22px] bg-[#d8d4c8] p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">Energía · rendimiento · recuperación</p>
              <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-[.95] tracking-[-0.055em]">Todo lo que necesitás para seguir fuerte.</h2>
              <div className="mt-5 inline-flex rounded-full bg-[#172019] px-4 py-2 text-xs font-semibold text-white">Ver productos</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MiniProduct label="Whey Protein" price="$38.000" />
              <MiniProduct label="Creatina" price="$25.000" />
              <div className="hidden sm:block"><MiniProduct label="Pre Workout" price="$31.500" /></div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#172019] px-4 py-3 text-white">
              <div><p className="text-[10px] uppercase tracking-[.12em] text-white/55">Tu pedido</p><p className="mt-0.5 text-sm font-semibold">2 productos</p></div>
              <span className="rounded-full bg-[#12e89a] px-4 py-2 text-xs font-bold text-[#04251a]">Continuar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniProduct({ label, price }: { label: string; price: string }) {
  return (
    <div className="rounded-[18px] bg-white p-2.5 shadow-sm ring-1 ring-black/5">
      <div className="aspect-square rounded-[13px] bg-gradient-to-br from-[#d9ddd8] to-[#b9c2ba]" />
      <p className="mt-2 truncate text-[11px] font-semibold text-slate-800">{label}</p>
      <p className="mt-0.5 text-[10px] font-bold text-slate-500">{price}</p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description, centered = false }: { eyebrow: string; title: string; description: string; centered?: boolean }) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#087a54]">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{title}</h2>
      <p className={`mt-5 text-sm leading-7 text-slate-600 sm:text-base ${centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{description}</p>
    </div>
  )
}

function ProcessCard({ number, icon, title, children }: { number: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[28px] border border-black/7 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.045)] sm:p-7">
      <div className="flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-2xl bg-[#e8fff6] text-[#087a54]">{icon}</div><span className="text-xs font-bold tracking-[.14em] text-slate-300">{number}</span></div>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.045em]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{children}</p>
    </article>
  )
}

function BenefitCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-black/7 bg-[#fafbfb] p-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#087a54] shadow-sm ring-1 ring-black/5">{icon}</div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.035em]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  )
}

function ChannelCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-black/7 bg-white p-6">
      <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e8fff6] text-[#087a54]">{icon}</span><h3 className="text-lg font-semibold tracking-[-0.035em]">{title}</h3></div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  )
}

function MetricMock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#0b8e61]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="text-[#0a8f62]">{icon}</span>{label}</div>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</p>
    </div>
  )
}
