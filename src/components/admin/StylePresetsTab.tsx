'use client'

import { useState } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { applyThemePreset } from '@/lib/actions/store'

export function StylePresetsTab() {
  const [applying, setApplying] = useState<string | null>(null)
  const [appliedId, setAppliedId] = useState<string | null>(null)

  async function handleApply(preset: ThemePreset) {
    setApplying(preset.id)
    const result = await applyThemePreset(preset.id)

    if (result?.error) {
      toast.error('No se pudo aplicar el estilo. Intentá de nuevo.')
    } else {
      setAppliedId(preset.id)
      toast.success(`Estilo "${preset.name}" aplicado. Podés personalizar cualquier detalle después.`)
      // Reset after a moment to allow re-apply
      setTimeout(() => setAppliedId(null), 3000)
    }

    setApplying(null)
  }

  return (
    <div className="space-y-5">
      {/* Header note */}
      <div className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-white/3 px-4 py-3.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-400" />
        <p className="text-sm text-neutral-300">
          Elegí un estilo base para arrancar. Podés cambiar colores, fuentes y detalles después desde las otras pestañas.
        </p>
      </div>

      {/* Preset grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {THEME_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isApplying={applying === preset.id}
            justApplied={appliedId === preset.id}
            onApply={() => handleApply(preset)}
          />
        ))}
      </div>
    </div>
  )
}

function PresetCard({
  preset,
  isApplying,
  justApplied,
  onApply,
}: {
  preset: ThemePreset
  isApplying: boolean
  justApplied: boolean
  onApply: () => void
}) {
  const [c1, c2, c3] = preset.previewColors
  const isDark = preset.theme.visual_mode === 'dark'

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-white/8 transition duration-200 hover:border-white/16 hover:-translate-y-0.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      {/* Visual preview strip */}
      <div
        className="relative h-28 w-full overflow-hidden"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${c1} 0%, ${c1} 60%, ${c2}22 100%)`
            : `linear-gradient(135deg, ${c1} 0%, color-mix(in srgb, ${c1} 92%, white 8%) 100%)`,
        }}
      >
        {/* Simulated nav bar */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3"
        >
          <div className="h-2 w-10 rounded-full opacity-60" style={{ backgroundColor: isDark ? '#fff' : c3 }} />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 w-5 rounded-full opacity-30" style={{ backgroundColor: isDark ? '#fff' : '#000' }} />
            ))}
          </div>
        </div>

        {/* Simulated hero text */}
        <div className="absolute left-4 top-8 space-y-1.5">
          <div className="h-3 w-20 rounded-full opacity-80" style={{ backgroundColor: isDark ? '#fff' : c3 }} />
          <div className="h-2 w-28 rounded-full opacity-40" style={{ backgroundColor: isDark ? '#fff' : '#000' }} />
        </div>

        {/* Simulated product cards */}
        <div className="absolute bottom-2 left-4 right-4 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 flex-1 rounded-lg"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.08)'
                  : `color-mix(in srgb, ${c2} 12%, white 88%)`,
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
              }}
            />
          ))}
        </div>

        {/* Color accent dot */}
        <div
          className="absolute right-4 top-4 size-5 rounded-full"
          style={{ backgroundColor: c3, boxShadow: `0 4px 12px ${c3}55` }}
        />
      </div>

      {/* Info + action */}
      <div className="flex flex-1 flex-col p-4">
        {/* Color swatches */}
        <div className="mb-3 flex items-center gap-1.5">
          {preset.previewColors.map((color, i) => (
            <span
              key={i}
              className="inline-block size-4 rounded-full ring-1 ring-white/10"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="ml-1 text-[10px] uppercase tracking-[0.16em] text-neutral-600">
            {preset.theme.visual_mode === 'dark' ? 'Oscuro' : 'Claro'}
          </span>
        </div>

        <p className="text-sm font-semibold text-white">{preset.name}</p>
        <p className="mt-1 text-xs leading-5 text-neutral-400">{preset.description}</p>

        {/* Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {preset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-500"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] py-2.5 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed"
          style={
            justApplied
              ? { backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
              : { backgroundColor: 'rgba(255,255,255,0.07)', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.08)' }
          }
        >
          {justApplied ? (
            <>
              <CheckCircle2 className="size-4" />
              Aplicado
            </>
          ) : isApplying ? (
            'Aplicando...'
          ) : (
            'Aplicar estilo'
          )}
        </button>
      </div>
    </div>
  )
}
