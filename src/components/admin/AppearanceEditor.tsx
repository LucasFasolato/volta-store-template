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
      {/* Horizontal tab bar */}
      <div className="admin-surface flex gap-1 rounded-[24px] p-1.5">
        {TABS.map((item) => {
          const Icon = item.icon
          const active = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-[18px] px-4 py-2.5 text-sm font-medium transition duration-150',
                active ? 'admin-surface-selected text-white' : 'text-neutral-400 hover:text-white',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Editor content */}
      {isThemeTab ? (
        <ThemeForm theme={theme} activeSection={tab as ThemeSection} />
      ) : (
        <LayoutForm layout={layout} />
      )}
    </div>
  )
}
