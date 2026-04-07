'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { applyThemePreset } from '@/lib/actions/store'
import { cn } from '@/lib/utils'

const ACTIVATION_PRESETS = THEME_PRESETS.filter((preset) =>
  ['minimal', 'fashion', 'organic'].includes(preset.id),
)

export function WizardStepStyle({ publicPath }: { publicPath: string }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string>(ACTIVATION_PRESETS[0]?.id ?? 'minimal')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApply() {
    setError(null)
    const previewWindow = window.open('', '_blank', 'noopener,noreferrer')

    startTransition(async () => {
      const result = await applyThemePreset(selectedId)

      if (result?.error) {
        const message = result.error.formErrors?.[0] ?? 'No se pudo aplicar el estilo.'
        previewWindow?.close()
        setError(message)
        return
      }

      if (previewWindow) {
        previewWindow.location.href = publicPath
      } else {
        window.open(publicPath, '_blank', 'noopener,noreferrer')
      }
      toast.success('Tu tienda ya se puede mostrar.')
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-black/[0.04] px-4 py-3 text-sm text-muted-foreground dark:border-white/8 dark:bg-white/[0.03]">
        Despues puedes cambiar todo desde Apariencia. Aqui solo estamos eligiendo una base visual fuerte para lanzar la tienda.
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {ACTIVATION_PRESETS.map((preset) => {
          const selected = selectedId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedId(preset.id)}
              className={cn(
                'overflow-hidden rounded-2xl border text-left transition duration-150',
                selected
                  ? 'border-emerald-400/25 bg-emerald-400/8'
                  : 'border-border bg-black/[0.03] hover:bg-black/[0.05] dark:border-white/8 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]',
              )}
            >
              <PresetPreview preset={preset} />
              <div className="space-y-2 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                  {selected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
                      <Sparkles className="size-3" />
                      Elegido
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{preset.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        onClick={handleApply}
        disabled={isPending}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-6 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(16,185,129,0.2)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {isPending ? 'Aplicando...' : 'Aplicar estilo y abrir mi tienda'}
        {!isPending ? <ExternalLink className="size-4" /> : null}
      </button>
    </div>
  )
}

function PresetPreview({ preset }: { preset: ThemePreset }) {
  const [c1, c2, c3] = preset.previewColors
  const isDark = preset.theme.visual_mode === 'dark'

  return (
    <div
      className="relative h-28 overflow-hidden"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${c1} 0%, ${c1} 60%, ${c2}22 100%)`
          : `linear-gradient(135deg, ${c1} 0%, color-mix(in srgb, ${c1} 92%, white 8%) 100%)`,
      }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3">
        <div className="h-2 w-10 rounded-full opacity-65" style={{ backgroundColor: isDark ? '#fff' : c3 }} />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-1.5 w-5 rounded-full opacity-30"
              style={{ backgroundColor: isDark ? '#fff' : '#000' }}
            />
          ))}
        </div>
      </div>

      <div className="absolute left-4 top-8 space-y-1.5">
        <div className="h-3 w-20 rounded-full opacity-80" style={{ backgroundColor: isDark ? '#fff' : c3 }} />
        <div className="h-2 w-28 rounded-full opacity-40" style={{ backgroundColor: isDark ? '#fff' : '#000' }} />
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-10 flex-1 rounded-lg"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `color-mix(in srgb, ${c2} 12%, white 88%)`,
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
