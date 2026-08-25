import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupStartTracker } from '@/components/analytics/SignupStartTracker'
import { VoltaBrand } from '@/components/brand/VoltaBrand'
import { getLoginFeedbackFromSearchParams } from '@/lib/auth/login-feedback'
import { sanitizeInternalRedirect } from '@/lib/auth/redirects'

export const metadata: Metadata = {
  title: 'Ingresar - Volta Store',
  description: 'Accedé a tu tienda en Volta Store',
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const feedback = getLoginFeedbackFromSearchParams(params)
  const next = sanitizeInternalRedirect(firstValue(params.next))

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <SignupStartTracker />
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[22px] border border-black/8 bg-white lg:grid-cols-[.9fr_1.1fr]">
        <section className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
          <div>
            <VoltaBrand />
            <div className="mt-12 max-w-md lg:mt-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Vendé por WhatsApp</p>
              <h1 className="mt-3 text-balance text-[2.4rem] font-semibold leading-[.98] tracking-[-0.06em] sm:text-[3.2rem]">Tu tienda profesional, lista para vender.</h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">Creá tu catálogo, organizá pedidos y llevá la conversación a WhatsApp sin montar un ecommerce complejo.</p>
            </div>
          </div>

          <div>
            <div className="mt-10 hidden grid-cols-3 gap-3 text-xs text-slate-500 sm:grid lg:mt-16">
              <div><strong className="block text-slate-900">Simple</strong><span className="mt-1 block">Configuración rápida</span></div>
              <div><strong className="block text-slate-900">Profesional</strong><span className="mt-1 block">Diseño listo para vender</span></div>
              <div><strong className="block text-slate-900">Directo</strong><span className="mt-1 block">Pedidos por WhatsApp</span></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
              <Link href="/privacy" className="transition hover:text-slate-700">Política de Privacidad</Link>
              <Link href="/terms" className="transition hover:text-slate-700">Términos y Condiciones</Link>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border-t border-black/7 bg-[#fbfcfd] p-4 sm:p-8 lg:border-l lg:border-t-0 lg:p-12">
          <div className="w-full max-w-md">
            <LoginForm initialFeedback={feedback} next={next} />
          </div>
        </section>
      </div>
    </main>
  )
}
