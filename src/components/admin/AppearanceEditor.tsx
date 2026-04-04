'use client'

import { useState } from 'react'
import { Layers3, LayoutDashboard, Palette, Type } from 'lucide-react'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { cn } from '@/lib/utils'
import type { StoreLayout, StoreTheme } from '@/types/store'

type AppTab = ThemeSection | 'secciones'

const TABS: Array<{ value: AppTab; label: string; icon: React.ElementType }> = [
  { value: 'fuentes', label: 'Fuentes', icon: Type },
  { value: 'colores', label: 'Colores', icon: Palette },
  { value: 'layout', label: 'Diseño', icon: Layers3 },
  { value: 'secciones', label: 'Secciones', icon: LayoutDashboard },
]

type Props = {
  theme: StoreTheme
  layout: StoreLayout
}

export function AppearanceEditor({ theme, layout }: Props) {
  const [tab, setTab] = useState<AppTab>('fuentes')
  const isThemeTab = tab !== 'secciones'

  return (
    <div className="space-y-5">
      {/* Top-level nav */}
      <div className="surface-panel premium-ring flex gap-1 rounded-[28px] p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.value
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-[22px] px-3 py-3 text-sm font-medium transition',
                active
                  ? 'bg-emerald-400/12 text-white shadow-[inset_0_0_0_1px_rgba(74,222,128,0.2)]'
                  : 'text-neutral-400 hover:text-white',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden sm:block">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ThemeForm — always mounted to preserve form state, hidden when secciones */}
      <div className={isThemeTab ? '' : 'hidden'}>
        <ThemeForm theme={theme} activeSection={isThemeTab ? (tab as ThemeSection) : 'fuentes'} />
      </div>

      {/* Secciones */}
      {!isThemeTab ? <LayoutForm layout={layout} /> : null}
    </div>
  )
}
