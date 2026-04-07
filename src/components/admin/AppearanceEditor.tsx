'use client'

import { useState } from 'react'
import { Layers3, LayoutDashboard, Palette, Sparkles, Type } from 'lucide-react'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { StylePresetsTab } from '@/components/admin/StylePresetsTab'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { cn } from '@/lib/utils'
import type { StoreLayout, StoreTheme } from '@/types/store'

type AppTab = ThemeSection | 'secciones' | 'estilos'

const TABS: Array<{ value: AppTab; label: string; icon: React.ElementType }> = [
  { value: 'estilos', label: 'Estilos', icon: Sparkles },
  { value: 'fuentes', label: 'Fuentes', icon: Type },
  { value: 'colores', label: 'Colores', icon: Palette },
  { value: 'layout', label: 'Diseño', icon: Layers3 },
  { value: 'secciones', label: 'Secciones', icon: LayoutDashboard },
]

type Props = {
  theme: StoreTheme
  layout: StoreLayout
  storeSlug: string
}

export function AppearanceEditor({ theme, layout, storeSlug }: Props) {
  const [tab, setTab] = useState<AppTab>('estilos')
  const isThemeTab = tab !== 'secciones' && tab !== 'estilos'

  return (
    <div className="space-y-4">
      {/* Compact header + tab bar in one row */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <p className="admin-label">Volta Admin</p>
          <h1 className="mt-1 font-heading text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
            Apariencia
          </h1>
        </div>

        <div className="ml-auto flex gap-1 overflow-x-auto">
          <div className="admin-surface flex min-w-max gap-1 rounded-[20px] p-1.5">
            {TABS.map((item) => {
              const Icon = item.icon
              const active = tab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[14px] px-3.5 py-2 text-sm font-medium transition duration-150',
                    active ? 'admin-surface-selected text-white' : 'text-neutral-400 hover:text-white',
                    // Highlight the Estilos tab with a subtle emerald tint when active
                    active && item.value === 'estilos' ? 'text-emerald-300' : '',
                  )}
                >
                  <Icon className={cn('size-3.5 shrink-0', active && item.value === 'estilos' ? 'text-emerald-400' : '')} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Editor content */}
      {tab === 'estilos' ? (
        <StylePresetsTab />
      ) : isThemeTab ? (
        <ThemeForm theme={theme} activeSection={tab as ThemeSection} storeSlug={storeSlug} />
      ) : (
        <LayoutForm layout={layout} />
      )}
    </div>
  )
}
