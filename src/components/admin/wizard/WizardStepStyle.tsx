'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ExternalLink, Loader2, Rocket, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ShareActions } from '@/components/admin/ShareActions'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { applyThemePreset } from '@/lib/actions/store'
import { buildStoreShareMessage } from '@/lib/sharing/links'
import { publishStore } from '@/lib/store/publication-actions'
import { cn } from '@/lib/utils'

const ACTIVATION_PRESETS = THEME_PRESETS.filter((preset) => ['minimal', 'fashion', 'organic'].includes(preset.id))

export function WizardStepStyle({
  previewPath,
  publicUrl,
  storeName,
  hasExistingStyle,
}: {
  previewPath: string
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
      router.prefetch('/admin/compartir')
    })
  }

  if (published) {
    const shareMessage = buildStoreShareMessage(storeName, publicUrl)
    return (
      <div className="space-y-4" aria-live="polite">
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-5 shadow-[0_14px_34px_rgba(18,232,154,.08)] dark:border-emerald-400/20 dark:bg-emerald-400/8">
          <div className="flex items-center gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#12e89a] text-[#062117]"><Check className="size-4.5" /></span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-emerald-900 dark:text-emerald-100">Tu tienda está publicada</p>
              <p className="mt-0.5 truncate text-xs text-emerald-800/70 dark:text-emerald-100/65">{publicUrl}</p>
            </div>
          </div>
          <div className="mt-4"><ShareActions url={publicUrl} text={shareMessage} title={storeName} /></div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-black/8 bg-white px-3 text-sm font-semibold text-foreground dark:border-white/10 dark:bg-white/5">Ver tienda <ExternalLink className="size-4" /></Link>
          <button type="button" onClick={() => router.refresh()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#10161d] px-3 text-sm font-semibold text-white dark:bg-[#12e89a] dark:text-[#062117]">Ir al panel <ArrowRight className="size-4" /></button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4.5">
      <div className="grid grid-cols-3 gap-2.5">
        {ACTIVATION_PRESETS.map((preset) => {
          const selected = selectedId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(preset.id)}
              className={cn(
                'overflow-hidden rounded-[16px] border text-left shadow-[0_10px_30px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                selected ? 'border-[#12e89a] bg-emerald-50 ring-1 ring-[#12e89a]/20 dark:bg-emerald-400/8' : 'border-black/8 bg-white dark:border-white/10 dark:bg-white/[0.02]',
              )}
            >
              <PresetPreview preset={preset} />
              <div className="flex items-center justify-between gap-1 px-3 py-2.5">
                <span className="truncate text-xs font-semibold text-foreground">{preset.name}</span>
                {selected ? <Sparkles className="size-3.5 shrink-0 text-emerald-500" /> : null}
              </div>
            </button>
          )
        })}
      </div>

      {hasExistingStyle && selectedId ? <button type="button" onClick={() => setSelectedId(null)} className="text-xs font-semibold text-muted-foreground underline underline-offset-4">Mantener mi estilo</button> : null}

      {error ? <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{error}</p> : null}

      <button type="button" onClick={handleFinish} disabled={isPending} className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] shadow-[0_14px_32px_rgba(18,232,154,.2)] transition hover:brightness-105 disabled:shadow-none disabled:opacity-50">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
        {isPending ? 'Publicando…' : 'Publicar mi tienda'}
      </button>

      <Link href={previewPath} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">Ver vista previa <ExternalLink className="size-4" /></Link>
    </div>
  )
}

function PresetPreview({ preset }: { preset: ThemePreset }) {
  const [c1, c2, c3] = preset.previewColors
  const isDark = preset.theme.visual_mode === 'dark'
  return (
    <div className="relative h-[76px] overflow-hidden" style={{ background: isDark ? `linear-gradient(135deg, ${c1}, ${c2}44)` : `linear-gradient(135deg, ${c1}, ${c2}22)` }}>
      <div className="absolute left-3 top-3 h-2 w-9 rounded-full" style={{ background: isDark ? '#fff' : c3, opacity: .78 }} />
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((item) => <div key={item} className="h-6 rounded-md" style={{ background: isDark ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.72)', border: '1px solid rgba(0,0,0,.05)' }} />)}
      </div>
    </div>
  )
}
