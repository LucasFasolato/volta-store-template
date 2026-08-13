'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { applyThemePreset } from '@/lib/actions/store'
import { publishStore } from '@/lib/store/publication-actions'
import { cn } from '@/lib/utils'

const ACTIVATION_PRESETS = THEME_PRESETS.filter((preset) => ['minimal', 'fashion', 'organic'].includes(preset.id))

export function WizardStepStyle({ publicPath }: { publicPath: string }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string>(ACTIVATION_PRESETS[0]?.id ?? 'minimal')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFinish() {
    setError(null)
    startTransition(async () => {
      const themeResult = await applyThemePreset(selectedId)
      if (themeResult?.error) {
        setError(themeResult.error.formErrors?.[0] ?? 'No pudimos aplicar el estilo.')
        return
      }

      const publishResult = await publishStore()
      if (publishResult.error) {
        setError(publishResult.error)
        return
      }

      toast.success('Tu tienda ya está lista.')
      router.refresh()
      window.open(publicPath, '_blank', 'noopener,noreferrer')
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-3">
        {ACTIVATION_PRESETS.map((preset) => {
          const selected = selectedId === preset.id
          return (
            <button key={preset.id} type="button" onClick={() => setSelectedId(preset.id)} className={cn('overflow-hidden rounded-[14px] border text-left transition', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/8' : 'border-black/8 bg-white dark:border-white/10 dark:bg-white/[0.02]')}>
              <PresetPreview preset={preset} />
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">{preset.name}</span>
                {selected ? <Sparkles className="size-4 text-emerald-500" /> : null}
              </div>
            </button>
          )
        })}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button type="button" onClick={handleFinish} disabled={isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] disabled:opacity-50 sm:w-auto">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {isPending ? 'Preparando tu tienda…' : 'Usar este estilo'}
      </button>
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
        {[1,2,3].map((item) => <div key={item} className="h-7 rounded-md" style={{ background: isDark ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.65)', border: '1px solid rgba(0,0,0,.06)' }} />)}
      </div>
    </div>
  )
}
