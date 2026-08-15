import Link from 'next/link'
import type { ReactNode } from 'react'
import { VoltaBrand } from '@/components/brand/VoltaBrand'

export function LegalPage({
  eyebrow,
  title,
  intro,
  updatedAt,
  children,
}: {
  eyebrow: string
  title: string
  intro: string
  updatedAt: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_24px_80px_rgba(15,23,42,.06)]">
        <header className="border-b border-black/7 px-6 py-7 sm:px-10 sm:py-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/login" aria-label="Volver a VOLTA">
              <VoltaBrand />
            </Link>
            <nav className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <Link href="/privacy" className="transition hover:text-slate-950">Privacidad</Link>
              <Link href="/terms" className="transition hover:text-slate-950">Términos</Link>
            </nav>
          </div>

          <div className="mt-12 max-w-3xl sm:mt-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">{eyebrow}</p>
            <h1 className="mt-3 text-balance text-[2.4rem] font-semibold leading-[.98] tracking-[-0.055em] sm:text-[3.4rem]">{title}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{intro}</p>
            <p className="mt-4 text-xs text-slate-400">Última actualización: {updatedAt}</p>
          </div>
        </header>

        <article className="legal-content px-6 py-8 sm:px-10 sm:py-12">{children}</article>

        <footer className="flex flex-col gap-4 border-t border-black/7 bg-[#fbfcfd] px-6 py-6 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>VOLTA · Plataforma para crear tiendas y gestionar ventas por WhatsApp.</p>
          <div className="flex gap-4">
            <Link href="/login" className="font-medium text-slate-700 transition hover:text-slate-950">Volver al ingreso</Link>
            <a href="mailto:legal@voltastore.app" className="font-medium text-slate-700 transition hover:text-slate-950">legal@voltastore.app</a>
          </div>
        </footer>
      </div>
    </main>
  )
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border-b border-black/6 py-8 last:border-b-0 sm:py-10">
      <h2 className="text-xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-[15px]">{children}</div>
    </section>
  )
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-emerald-500">{children}</ul>
}
