import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { getLoginFeedbackFromSearchParams } from '@/lib/auth/login-feedback'

export const metadata: Metadata = {
  title: 'Ingresar - Volta Store',
  description: 'Accedé a tu tienda en Volta Store',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const feedback = getLoginFeedbackFromSearchParams(await searchParams)

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[22px] border border-black/8 bg-white lg:grid-cols-[.9fr_1.1fr]">
        <section className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-[9px] bg-[#12e89a] text-xs font-black text-[#062117]">V</span>
              <span className="text-sm font-semibold tracking-[-0.03em]">VOLTA STORE</span>
            </div>

            <div className="mt-12 max-w-md lg:mt-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Vendé por WhatsApp</p>
              <h1 className="mt-3 text-balance text-[2.4rem] font-semibold leading-[.98] tracking-[-0.06em] sm:text-[3.2rem]">Tu tienda profesional, lista para vender.</h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">Creá tu catálogo, organizá pedidos y llevá la conversación a WhatsApp sin montar un ecommerce complejo.</p>
            </div>
          </div>

          <div className="mt-10 hidden grid-cols-3 gap-3 text-xs text-slate-500 sm:grid lg:mt-16">
            <div><strong className="block text-slate-900">Simple</strong><span className="mt-1 block">Configuración rápida</span></div>
            <div><strong className="block text-slate-900">Profesional</strong><span className="mt-1 block">Diseño listo para vender</span></div>
            <div><strong className="block text-slate-900">Directo</strong><span className="mt-1 block">Pedidos por WhatsApp</span></div>
          </div>
        </section>

        <section className="flex items-center justify-center border-t border-black/7 bg-[#fbfcfd] p-4 sm:p-8 lg:border-l lg:border-t-0 lg:p-12">
          <div className="w-full max-w-md">
            <LoginForm initialFeedback={feedback} />
          </div>
        </section>
      </div>
    </main>
  )
}
