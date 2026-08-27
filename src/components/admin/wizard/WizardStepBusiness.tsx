'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { checkStoreSlugAvailability, updateStoreConfig } from '@/lib/actions/store-config'
import { slugify } from '@/lib/utils/format'
import type { Store as StoreType } from '@/types/store'

export function WizardStepBusiness({
  store,
  onContinue,
}: {
  store: StoreType
  onContinue: (identity: { name: string; slug: string }) => void
}) {
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
      setSlugMessage(normalizedSlug ? 'Este es tu enlace actual.' : 'Usá al menos 3 caracteres.')
      return
    }

    if (normalizedSlug.length < 3) {
      setSlugState('unavailable')
      setSlugMessage('Usá al menos 3 caracteres.')
      return
    }

    setSlugState('checking')
    setSlugMessage('Validando…')
    const timeoutId = window.setTimeout(async () => {
      const result = await checkStoreSlugAvailability(normalizedSlug)
      setSlugState(result.available ? 'available' : 'unavailable')
      setSlugMessage(result.message)
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [normalizedSlug, store.slug])

  function save() {
    setError(null)
    const nextSlug = normalizedSlug
    const nextName = name.trim()

    if (nextName.length < 2) return setError('Escribí el nombre de tu negocio.')
    if (nextSlug.length < 3 || slugState === 'unavailable') return setError('Revisá el enlace antes de continuar.')
    if (whatsapp.trim().length < 8) return setError('Agregá el WhatsApp que va a recibir los pedidos.')

    startTransition(async () => {
      const result = await updateStoreConfig({
        name: nextName,
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
            ?? 'No pudimos guardar los datos.',
        )
        return
      }

      onContinue({ name: nextName, slug: nextSlug })
    })
  }

  const slugOk = slugState === 'current' || slugState === 'available'

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium text-foreground">
        Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Casa Olivia" className="mt-2 h-12 w-full rounded-[12px] border border-black/9 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-white/5" />
      </label>

      <label className="block text-xs font-medium text-foreground">
        Enlace
        <div className="mt-2 flex h-12 items-center rounded-[12px] border border-black/9 bg-white px-3.5 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/10 dark:border-white/10 dark:bg-white/5">
          <span className="shrink-0 text-[11px] text-muted-foreground">voltastore.app/tienda/</span>
          <input value={slug} onChange={(event) => setSlug(event.target.value)} onBlur={() => setSlug(normalizedSlug)} maxLength={48} spellCheck={false} className="min-w-0 flex-1 bg-transparent pl-0.5 font-mono text-xs text-foreground outline-none" />
        </div>
        <span className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${slugState === 'unavailable' ? 'text-amber-600 dark:text-amber-300' : 'text-muted-foreground'}`}>
          {slugState === 'checking' ? <Loader2 className="size-3 animate-spin" /> : slugOk ? <CheckCircle2 className="size-3 text-emerald-500" /> : <TriangleAlert className="size-3" />}
          {slugMessage}
        </span>
      </label>

      <label className="block text-xs font-medium text-foreground">
        WhatsApp
        <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="+54 9 341 123 4567" className="mt-2 h-12 w-full rounded-[12px] border border-black/9 bg-white px-3.5 font-mono text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-white/5" />
      </label>

      {error ? <p role="alert" className="rounded-[11px] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{error}</p> : null}

      <button type="button" onClick={save} disabled={pending || slugState === 'checking'} className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] shadow-[0_12px_28px_rgba(18,232,154,.18)] transition hover:brightness-105 disabled:shadow-none disabled:opacity-50">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {pending ? 'Guardando…' : 'Continuar'}
      </button>
    </div>
  )
}
