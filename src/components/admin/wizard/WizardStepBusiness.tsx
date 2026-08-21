'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Store, TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { checkStoreSlugAvailability, updateStoreConfig } from '@/lib/actions/store-config'
import { slugify } from '@/lib/utils/format'
import type { Store as StoreType } from '@/types/store'

export function WizardStepBusiness({ store }: { store: StoreType }) {
  const router = useRouter()
  const [name, setName] = useState(store.name)
  const [slug, setSlug] = useState(store.slug)
  const [whatsapp, setWhatsapp] = useState(store.whatsapp)
  const [slugState, setSlugState] = useState<'current' | 'checking' | 'available' | 'unavailable'>('current')
  const [slugMessage, setSlugMessage] = useState('Este es tu enlace actual.')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const normalizedSlug = useMemo(() => slugify(slug).slice(0, 48), [slug])

  useEffect(() => {
    if (!normalizedSlug || normalizedSlug === store.slug) {
      setSlugState('current')
      setSlugMessage(normalizedSlug ? 'Este es tu enlace actual.' : 'El enlace necesita al menos 3 caracteres.')
      return
    }

    if (normalizedSlug.length < 3) {
      setSlugState('unavailable')
      setSlugMessage('Usá al menos 3 caracteres.')
      return
    }

    setSlugState('checking')
    setSlugMessage('Validando disponibilidad…')
    const timeoutId = window.setTimeout(async () => {
      const result = await checkStoreSlugAvailability(normalizedSlug)
      setSlugState(result.available ? 'available' : 'unavailable')
      setSlugMessage(result.message)
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [normalizedSlug, store.slug])

  function save() {
    setError(null)
    const nextSlug = normalizedSlug

    if (name.trim().length < 2) {
      setError('Escribí el nombre de tu negocio.')
      return
    }
    if (nextSlug.length < 3 || slugState === 'unavailable') {
      setError('Revisá el enlace público antes de continuar.')
      return
    }
    if (whatsapp.trim().length < 8) {
      setError('Agregá el WhatsApp que va a recibir los pedidos.')
      return
    }

    startTransition(async () => {
      const result = await updateStoreConfig({
        name: name.trim(),
        slug: nextSlug,
        whatsapp: whatsapp.trim(),
        instagram: store.instagram ?? '',
        address: store.address ?? '',
        hours: store.hours ?? '',
      })

      if (result?.error) {
        setError(
          result.error.fieldErrors?.slug?.[0]
            ?? result.error.fieldErrors?.whatsapp?.[0]
            ?? result.error.fieldErrors?.name?.[0]
            ?? result.error.formErrors?.[0]
            ?? 'No pudimos guardar los datos del negocio.',
        )
        return
      }

      toast.success('Negocio listo. Seguimos con tu tienda.')
      router.refresh()
    })
  }

  const slugOk = slugState === 'current' || slugState === 'available'

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-black/7 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.025]">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-emerald-600 shadow-sm dark:bg-white/7 dark:text-[#12e89a]">
            <Store className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Lo mínimo para poder vender</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Nombre, enlace y WhatsApp. El resto lo podés completar después.</p>
          </div>
        </div>
      </div>

      <label className="block text-xs font-medium text-foreground">
        Nombre del negocio
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          placeholder="Casa Olivia"
          className="mt-1.5 h-11 w-full rounded-[10px] border border-black/9 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
        />
      </label>

      <label className="block text-xs font-medium text-foreground">
        Enlace de tu tienda
        <div className="mt-1.5 flex h-11 items-center rounded-[10px] border border-black/9 bg-white px-3 focus-within:border-emerald-400 dark:border-white/10 dark:bg-white/5">
          <span className="shrink-0 text-xs text-muted-foreground">voltastore.app/tienda/</span>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            onBlur={() => setSlug(normalizedSlug)}
            maxLength={48}
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent pl-0.5 font-mono text-xs text-foreground outline-none"
          />
        </div>
        <span className={`mt-1.5 flex items-center gap-1.5 text-xs ${slugState === 'unavailable' ? 'text-amber-600 dark:text-amber-300' : 'text-muted-foreground'}`}>
          {slugState === 'checking' ? <Loader2 className="size-3.5 animate-spin" /> : slugOk ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <TriangleAlert className="size-3.5" />}
          {slugMessage}
        </span>
      </label>

      <label className="block text-xs font-medium text-foreground">
        WhatsApp para recibir pedidos
        <input
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
          inputMode="tel"
          autoComplete="tel"
          placeholder="+54 9 341 123 4567"
          className="mt-1.5 h-11 w-full rounded-[10px] border border-black/9 bg-white px-3 font-mono text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
        />
        <span className="mt-1.5 block text-xs text-muted-foreground">Usá código de país. Este número recibe el pedido final.</span>
      </label>

      {error ? <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{error}</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={pending || slugState === 'checking'}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] transition hover:brightness-105 disabled:opacity-50 sm:w-auto"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {pending ? 'Guardando…' : 'Guardar y continuar'}
      </button>
    </div>
  )
}
