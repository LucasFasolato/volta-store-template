'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { completeOnboarding } from '@/lib/actions/onboarding'

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter()
  const [storeName, setStoreName] = useState(initialName)
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const name = storeName.trim()
    const phone = whatsapp.trim()

    if (name.length < 2) {
      setError('Ingresá el nombre de tu negocio.')
      return
    }

    if (phone.length < 8 || !/^\+?[0-9\s\-()]+$/.test(phone)) {
      setError('Ingresá un número de WhatsApp válido.')
      return
    }

    setIsSubmitting(true)
    const result = await completeOnboarding({ storeName: name, whatsapp: phone })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.replace('/onboarding/success')
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-[22px] border border-black/8 bg-white lg:grid lg:grid-cols-[.95fr_1.05fr]">
        <section className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-white shadow-[0_8px_22px_rgba(15,23,42,.08)] ring-1 ring-black/6">
                <Image src="/brand/volta-mark.png" alt="VOLTA" width={30} height={30} priority className="size-7 object-contain" />
              </span>
              <span className="text-sm font-semibold tracking-[-0.03em]">VOLTA STORE</span>
            </div>

            <div className="mt-12 max-w-md lg:mt-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Empecemos por lo esencial</p>
              <h1 className="mt-3 text-[2.35rem] font-semibold leading-[.98] tracking-[-0.06em] sm:text-[3.15rem]">Tu tienda empieza acá.</h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">Con estos dos datos creamos tu espacio. Después vas a completar portada, primer producto y estilo desde el admin.</p>
            </div>
          </div>
          <p className="mt-10 text-xs leading-5 text-slate-400">Sin configuraciones técnicas. Podés cambiar todo más adelante.</p>
        </section>

        <section className="flex items-center border-t border-black/7 bg-[#fbfcfd] p-5 sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Crear tienda</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">Creemos tu tienda</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Solo necesitamos estos datos para arrancar.</p>
            </div>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">Nombre del negocio</span>
                <input
                  autoFocus
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  placeholder="Casa Olivia"
                  maxLength={48}
                  className="h-12 w-full rounded-[10px] border border-black/10 bg-white px-3.5 text-sm outline-none transition focus:border-[#12e89a] focus:ring-4 focus:ring-[#12e89a]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">WhatsApp de pedidos</span>
                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  type="tel"
                  inputMode="tel"
                  placeholder="+54 9 351 000 0000"
                  className="h-12 w-full rounded-[10px] border border-black/10 bg-white px-3.5 text-sm outline-none transition focus:border-[#12e89a] focus:ring-4 focus:ring-[#12e89a]/10"
                />
                <span className="mt-2 block text-xs leading-5 text-slate-400">Lo vamos a usar para recibir los pedidos de tu tienda.</span>
              </label>
            </div>

            {error ? <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</p> : null}

            <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#12e89a] px-5 text-sm font-semibold text-[#062117] transition hover:bg-[#0fd98f] disabled:opacity-60">
              {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Creando tu tienda…</> : <>Crear mi tienda<ArrowRight className="size-4" /></>}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
