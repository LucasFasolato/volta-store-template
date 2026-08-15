import type { Metadata } from 'next'
import Link from 'next/link'
import { MailCheck, ShieldCheck } from 'lucide-react'
import { EmailConfirmForm } from '@/components/auth/EmailConfirmForm'
import { VoltaBrand } from '@/components/brand/VoltaBrand'

export const metadata: Metadata = {
  title: 'Confirmar acceso',
  description: 'Confirma tu acceso seguro a Volta Store.',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function safeNext(value: string | undefined) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/admin'
}

export default async function EmailAccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const tokenHash = firstValue(params.token_hash)
  const next = safeNext(firstValue(params.next))

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <section className="w-full max-w-lg rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)] sm:p-9">
          <VoltaBrand />

          {tokenHash ? (
            <>
              <div className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="size-6" />
              </div>
              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Acceso protegido</p>
              <h1 className="mt-2 text-[2rem] font-semibold leading-[1.02] tracking-[-0.055em]">Tu acceso está listo.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Confirmá el ingreso para abrir tu panel. El enlace todavía no fue usado: el acceso se valida recién cuando tocás el botón.
              </p>

              <EmailConfirmForm tokenHash={tokenHash} next={next} />

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-black/6 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                <MailCheck className="mt-0.5 size-4 shrink-0 text-slate-700" />
                <p>Por seguridad, cada acceso funciona una sola vez. Si pediste varios correos, usá siempre el más reciente.</p>
              </div>
            </>
          ) : (
            <>
              <div className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <MailCheck className="size-6" />
              </div>
              <h1 className="mt-7 text-[2rem] font-semibold leading-[1.02] tracking-[-0.055em]">Este acceso está incompleto.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-500">Volvé al ingreso y pedí un nuevo enlace para continuar de forma segura.</p>
              <Link href="/login" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#10161d] px-5 text-sm font-semibold text-white transition hover:bg-[#18212b]">Volver al ingreso</Link>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
