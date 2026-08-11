'use client'

import { useState } from 'react'
import { FileText, LayoutTemplate, Palette, Rows3, Sparkles, SwatchBook, Type } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ContentForm } from '@/components/admin/ContentForm'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { QuickAppearanceForm } from '@/components/admin/QuickAppearanceForm'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { cn } from '@/lib/utils'
import type { Store, StoreContent, StoreLayout, StoreTheme } from '@/types/store'

type AppTab = ThemeSection | 'contenido' | 'estilos' | 'secciones'
export type AppearanceEditorTab = AppTab

type Props = {
  content: StoreContent
  theme: StoreTheme
  layout: StoreLayout
  store: Store
  initialTab?: AppTab
}

type SectionItem = {
  value: AppTab
  label: string
  description: string
  icon: LucideIcon
}

const SECTIONS: SectionItem[] = [
  { value: 'estilos', label: 'Estilos', description: 'Elegí una dirección visual.', icon: Sparkles },
  { value: 'contenido', label: 'Portada', description: 'Imagen y mensaje principal.', icon: FileText },
  { value: 'colores', label: 'Colores', description: 'Marca, fondo y contraste.', icon: Palette },
  { value: 'productos', label: 'Productos', description: 'Cards, grilla e imágenes.', icon: SwatchBook },
  { value: 'layout', label: 'Diseño', description: 'Ritmo, espacios y composición.', icon: LayoutTemplate },
  { value: 'fuentes', label: 'Fuentes', description: 'Jerarquía y personalidad.', icon: Type },
  { value: 'secciones', label: 'Secciones', description: 'Qué bloques aparecen.', icon: Rows3 },
]

function normalizeInitialTab(initialTab: AppTab): AppTab {
  if (initialTab === 'avanzado') return 'secciones'
  return initialTab
}

export function AppearanceEditor({ content, theme, layout, store, initialTab = 'estilos' }: Props) {
  const [activeSection, setActiveSection] = useState<AppTab>(() => normalizeInitialTab(initialTab))
  const meta = SECTIONS.find((item) => item.value === activeSection) ?? SECTIONS[0]

  function openAdvanced(section: ThemeSection) {
    setActiveSection(section)
  }

  return (
    <div className="volta-admin-page space-y-4 p-3.5 sm:p-5 lg:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-label">Apariencia</p>
          <h1 className="mt-1 text-[1.8rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Hacé que tu tienda se sienta propia</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">Elegí una base sólida y ajustá solo lo que cambia el resultado. Siempre con una consecuencia visual clara.</p>
        </div>
      </header>

      <div className="grid min-h-[680px] overflow-hidden rounded-[18px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820] lg:grid-cols-[196px_minmax(0,1fr)]">
        <aside className="border-b border-black/7 bg-[#fbfcfd] p-2.5 dark:border-white/8 dark:bg-white/[0.025] lg:border-b-0 lg:border-r">
          <div className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const active = section.value === activeSection
              return (
                <button
                  key={section.value}
                  type="button"
                  onClick={() => setActiveSection(section.value)}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-left text-xs font-medium transition lg:w-full',
                    active
                      ? 'bg-[#10161d] text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-500 hover:bg-black/[0.035] hover:text-slate-900 dark:text-white/48 dark:hover:bg-white/5 dark:hover:text-white',
                  )}
                >
                  <Icon className={cn('size-4', active && 'text-[#12e89a]')} />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <main className="min-w-0 bg-[#f7f8fa] p-3 dark:bg-[#0d131b] sm:p-4 lg:p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.035em] text-foreground">{meta.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </div>

          {activeSection === 'estilos' ? <QuickAppearanceForm theme={theme} store={store} onOpenAdvanced={openAdvanced} /> : null}
          {activeSection === 'contenido' ? <ContentForm content={content} store={store} /> : null}
          {activeSection === 'secciones' ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <LayoutForm layout={layout} />
              <SectionsSummary layout={layout} />
            </div>
          ) : null}
          {activeSection !== 'estilos' && activeSection !== 'contenido' && activeSection !== 'secciones' ? (
            <ThemeForm theme={theme} activeSection={activeSection as ThemeSection} onNavigate={(section) => setActiveSection(section)} />
          ) : null}
        </main>
      </div>
    </div>
  )
}

const SECTIONS_META = [
  { key: 'show_hero' as const, label: 'Portada' },
  { key: 'show_featured' as const, label: 'Destacados' },
  { key: 'show_categories' as const, label: 'Categorías' },
  { key: 'show_catalog' as const, label: 'Catálogo' },
  { key: 'show_footer' as const, label: 'Footer' },
]

function SectionsSummary({ layout }: { layout: StoreLayout }) {
  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] xl:sticky xl:top-6 xl:self-start">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Vista de estructura</p>
      <div className="mt-4 space-y-2">
        {SECTIONS_META.map((section) => {
          const active = layout[section.key]
          return (
            <div key={section.key} className={cn('flex items-center gap-2 rounded-[9px] border px-3 py-2.5 text-xs', active ? 'border-black/8 bg-slate-50 text-foreground dark:border-white/10 dark:bg-white/5' : 'border-dashed border-black/7 text-muted-foreground opacity-55 dark:border-white/8')}>
              <span className={cn('size-1.5 rounded-full', active ? 'bg-[#12e89a]' : 'bg-slate-300 dark:bg-white/20')} />
              <span className="flex-1">{section.label}</span>
              <span className="text-[9px] uppercase tracking-[0.12em]">{active ? 'visible' : 'oculto'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
