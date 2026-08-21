'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CheckCircle2, ExternalLink, Loader2, Rocket, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShareActions } from '@/components/admin/ShareActions'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { applyThemePreset } from '@/lib/actions/store'
import { buildStoreShareMessage } from '@/lib/sharing/links'
import { publishStore } from '@/lib/store/publication-actions'
import { cn } from '@/lib/utils'

const ACTIVATION_PRESETS = THEME_PRESETS.filter((preset) => ['minimal', 'fashion', 'organic'].includes(preset.id))

export function WizardStepStyle({
  publicPath,
  publicUrl,
  storeName,
  hasExistingStyle,
}: {
  publicPath: string
  publicUrl: string
  storeName: string
  hasExistingStyle: boolean
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(hasExistingStyle ? null : (ACTIVATION_PRESETS[0]?.id ?? 'minimal'))
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleFinish() {
    setError(null)
    startTransition(async () => {
      if (selectedId) {
        const themeResult = await applyThemePreset(selectedId)
        if (themeResult?.error) {
          setError(themeResult.error.formErrors?.[0] ?? 'No pudimos aplicar el estilo.')
          return
        }
      }

      const publishResult = await publishStore()
      if (publishResult.error) {
        setError(publishResult.error)
        return
      }

      setPublished(true)
      toast.success('Tu tienda ya está publicada.')
      router.prefetch('/admin/compartir')
    })
  }

  if (published) {
    const shareMessage = buildStoreShareMessage(storeName, publicUrl)
    return (
      <div className="space-y-5" aria-live="polite">
        <section className="overflow-hidden rounded-[18px] border border-emerald-200 bg-[linear-gradient(135deg,#effff8,#ffffff)] p-5 dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(18,232,154,.11),rgba(17,24,32,.98))] sm:p-6">
          <div className="flex size-11 items-center justify-center rounded-full bg-[#12e89a] text-[#062117] shadow-[0_12px_30px_rgba(18,232,154,.24)]">
            <Check className="size-5" />
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-[#75f5c5]">Publicada</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">Tu tienda ya está lista para recibir gente.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">El link ya es público. Compartilo ahora en el canal donde ya vendés y hacé que la primera visita llegue mientras todo está fresco.</p>

          <div className="mt-5 rounded-[12px] border border-black/7 bg-white px-3 py-3 dark:border-white/9 dark:bg-white/[0.045]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tu enlace</p>
            <p className="mt-1 truncate font-mono text-xs font-medium text-foreground">{publicUrl}</p>
          </div>

          <div className="mt-3">
            <ShareActions url={publicUrl} text={shareMessage} title={storeName} />
          </div>
        </section>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            'Tienda publicada',
            'Link público activo',
            'Pedidos por WhatsApp',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-[11px] border border-black/7 bg-slate-50 px-3 py-2.5 text-xs font-medium text-foreground dark:border-white/8 dark:bg-white/[0.03]">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-black/8 bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8">
            Ver mi tienda <ExternalLink className="size-4" />
          </Link>
          <Link href="/admin/compartir" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-black/8 bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8">
            Más opciones para compartir <ArrowRight className="size-4" />
          </Link>
          <button type="button" onClick={() => router.refresh()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0d151b] px-4 text-sm font-semibold text-white transition hover:bg-[#17202a] dark:bg-[#12e89a] dark:text-[#062117]">
            Ir a mi panel <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasExistingStyle ? (
        <div className="rounded-[13px] border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-400/8">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Tu estilo ya está definido.</p>
          <p className="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-200/70">Podés publicar así como está o elegir otra base antes de salir al aire.</p>
        </div>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-3">
        {ACTIVATION_PRESETS.map((preset) => {
          const selected = selectedId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(preset.id)}
              className={cn(
                'overflow-hidden rounded-[14px] border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                selected
                  ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/8'
                  : 'border-black/8 bg-white dark:border-white/10 dark:bg-white/[0.02]',
              )}
            >
              <PresetPreview preset={preset} />
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">{preset.name}</span>
                {selected ? <Sparkles className="size-4 text-emerald-500" /> : null}
              </div>
            </button>
          )
        })}
      </div>

      {hasExistingStyle && selectedId ? (
        <button type="button" onClick={() => setSelectedId(null)} className="text-xs font-semibold text-muted-foreground underline decoration-black/20 underline-offset-4 dark:decoration-white/20">Mantener mi estilo actual</button>
      ) : null}

      <div className="rounded-[13px] border border-black/7 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.025]">
        <div className="flex items-start gap-3">
          <Rocket className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-[#12e89a]" />
          <div>
            <p className="text-sm font-semibold text-foreground">El siguiente click publica tu tienda</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Después vas a ver el link público y botones listos para compartir. Nada más que configurar.</p>
          </div>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button type="button" onClick={handleFinish} disabled={isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] transition hover:brightness-105 disabled:opacity-50 sm:w-auto">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
          {isPending ? 'Publicando tu tienda…' : 'Publicar mi tienda'}
        </button>
        <Link href={publicPath} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 px-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          Ver vista previa <ExternalLink className="size-4" />
        </Link>
      </div>
    </div>
  )
}

function PresetPreview({ preset }: { preset: ThemePreset }) {
  const [c1, c2, c3] = preset.previewColors
  const isDark = preset.theme.visual_mode === 'dark'
  return (
    <div className="relative h-20 overflow-hidden" style={{ background: isDark ? `linear-gradient(135deg, ${c1}, ${c2}44)` : `linear-gradient(135deg, ${c1}, ${c2}22)` }}>
      <div className="absolute left-3 top-3 h-2 w-12 rounded-full" style={{ background: isDark ? '#fff' : c3, opacity: .75 }} />
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((item) => <div key={item} className="h-7 rounded-md" style={{ background: isDark ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.65)', border: '1px solid rgba(0,0,0,.06)' }} />)}
      </div>
    </div>
  )
}
