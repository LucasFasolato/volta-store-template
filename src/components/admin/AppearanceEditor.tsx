'use client'

import { useState } from 'react'
import { Layers3, LayoutDashboard, Palette, Type } from 'lucide-react'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { cn } from '@/lib/utils'
import type { StoreLayout, StoreTheme } from '@/types/store'

type AppTab = ThemeSection | 'secciones'

const TABS: Array<{ value: AppTab; label: string; icon: React.ElementType; hint: string }> = [
  { value: 'fuentes', label: 'Fuentes', icon: Type, hint: 'Jerarquia y lectura' },
  { value: 'colores', label: 'Colores', icon: Palette, hint: 'Paleta y contraste' },
  { value: 'layout', label: 'Diseno', icon: Layers3, hint: 'Componentes y catalogo' },
  { value: 'secciones', label: 'Secciones', icon: LayoutDashboard, hint: 'Que se ve en la tienda' },
]

type Props = {
  theme: StoreTheme
  layout: StoreLayout
}

export function AppearanceEditor({ theme, layout }: Props) {
  const [tab, setTab] = useState<AppTab>('fuentes')
  const isThemeTab = tab !== 'secciones'

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="admin-surface rounded-[28px] p-3">
          <div className="px-3 pb-3 pt-2">
            <p className="admin-label">Editor visual</p>
            <h2 className="mt-3 text-lg font-semibold text-white">Ajustes de marca</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Edita una categoria por vez con preview inmediato.
            </p>
          </div>

          <div className="space-y-1">
            {TABS.map((item) => {
              const Icon = item.icon
              const active = tab === item.value

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition',
                    active ? 'admin-surface-selected text-white' : 'admin-button-soft text-neutral-400 hover:text-white',
                  )}
                >
                  <div className={cn('flex size-10 items-center justify-center rounded-2xl', active ? 'bg-black/15 text-emerald-100' : 'bg-white/[0.04] text-neutral-500')}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-neutral-500">{item.hint}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      <div>
        {isThemeTab ? (
          <ThemeForm theme={theme} activeSection={tab as ThemeSection} />
        ) : (
          <LayoutForm layout={layout} />
        )}
      </div>
    </div>
  )
}
