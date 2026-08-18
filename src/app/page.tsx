import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Store } from 'lucide-react'
import { VoltaBrand } from '@/components/brand/VoltaBrand'

export const metadata: Metadata = {
  title: 'VOLTA — Tu tienda profesional para vender por WhatsApp',
  description:
    'VOLTA es una plataforma para crear una tienda profesional, organizar productos y llevar pedidos directo a WhatsApp.',
  alternates: {
    canonical: 'https://voltastore.app',
  },
}

type RootSearchParams = Promise<Record<string, string | string[] | undefined>>

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
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <header className="border-b border-black/6 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" aria-label="VOLTA inicio">
            <VoltaBrand />
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/privacy" className="hidden text-slate-500 transition hover:text-slate-950 sm:inline">Privacidad</Link>
            <Link href="/terms" className="hidden text-slate-500 transition hover:text-slate-950 sm:inline">Términos</Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#0b1220] px-5 font-medium text-white transition hover:bg-[#172033]"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <MessageCircle className="size-3.5" />
              Tienda + WhatsApp, sin complejidad
            </div>
            <h1 className="mt-6 max-w-3xl text-balance text-[3.2rem] font-semibold leading-[.94] tracking-[-0.065em] sm:text-[4.6rem]">
              VOLTA convierte tu catálogo en una tienda lista para vender.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Creá una tienda profesional, organizá productos y categorías, personalizá tu identidad y llevá cada pedido directamente a WhatsApp. Sin montar un ecommerce complejo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] shadow-[0_16px_34px_rgba(18,232,154,.2)] transition hover:bg-[#0fd98f]"
              >
                Entrar a VOLTA
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          <div className="rounded-[30px] border border-black/7 bg-[#0b1220] p-5 shadow-[0_28px_90px_rgba(15,23,42,.16)] sm:p-7">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.045] p-5 text-white sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">VOLTA</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Un panel simple para vender mejor.</h2>
              <div className="mt-7 space-y-3">
                {[
                  'Catálogo de productos y categorías',
                  'Diseño y apariencia de tu tienda',
                  'Pedidos enviados directo a WhatsApp',
                  'Acceso seguro con Google o email',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                    <CheckCircle2 className="size-4 shrink-0 text-[#12e89a]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-black/6 bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Qué hace VOLTA</p>
          <h2 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Todo lo necesario para mostrar tus productos y convertir conversaciones en ventas.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Feature icon={<Store className="size-5" />} title="Creá tu tienda">
              Configurá nombre, portada, catálogo, categorías y estilo visual desde un solo panel.
            </Feature>
            <Feature icon={<MessageCircle className="size-5" />} title="Vendé por WhatsApp">
              Cada pedido termina en una conversación de WhatsApp lista para continuar con tu cliente.
            </Feature>
            <Feature icon={<ShieldCheck className="size-5" />} title="Ingresá de forma segura">
              Podés autenticarte con Google o mediante un acceso por email, sin administrar contraseñas.
            </Feature>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-black/7 bg-white p-6 sm:p-9">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Acceso con Google</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Usamos tu cuenta de Google únicamente para identificarte e iniciar sesión.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              VOLTA solicita únicamente información básica de identidad, como tu dirección de correo y perfil público, para autenticar tu cuenta. No solicitamos acceso a Gmail, Drive, Calendar ni otros datos sensibles de Google.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
              <Link href="/privacy" className="text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950">Política de Privacidad</Link>
              <Link href="/terms" className="text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950">Términos y Condiciones</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/6 bg-white px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <VoltaBrand />
            <span>Plataforma para crear tiendas y gestionar ventas por WhatsApp.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-slate-950">Privacidad</Link>
            <Link href="/terms" className="transition hover:text-slate-950">Términos</Link>
            <Link href="/login" className="transition hover:text-slate-950">Ingresar</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-black/7 bg-[#fbfcfd] p-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.035em]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  )
}
