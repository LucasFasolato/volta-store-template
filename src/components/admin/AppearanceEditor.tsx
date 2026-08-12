'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye, FileText, LayoutTemplate, Palette, Rows3, Save, Sparkles, SwatchBook, Type } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ContentForm } from '@/components/admin/ContentForm'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { QuickAppearanceForm } from '@/components/admin/QuickAppearanceForm'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { cn } from '@/lib/utils'
import type { Store, StoreContent, StoreLayout, StoreTheme } from '@/types/store'

type LegacyAdvancedTab = ThemeSection | 'avanzado'
type AppTab = ThemeSection | 'contenido' | 'estilos' | 'secciones' | 'avanzado'
export type AppearanceEditorTab = AppTab

type Props = {
  content: StoreContent
  theme: StoreTheme
  layout: StoreLayout
  store: Store
  initialTab?: AppTab
}

type SectionItem = {
  value: Exclude<AppTab, 'avanzado'>
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

function normalizeTab(tab: AppTab): Exclude<AppTab, 'avanzado'> {
  return tab === 'avanzado' ? 'secciones' : tab
}

export function AppearanceEditor({ content, theme, layout, store, initialTab = 'estilos' }: Props) {
  const [activeSection, setActiveSection] = useState<Exclude<AppTab, 'avanzado'>>(() => normalizeTab(initialTab))
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [isSubmittingChanges, setIsSubmittingChanges] = useState(false)
  const workspaceRef = useRef<HTMLElement | null>(null)
  const meta = SECTIONS.find((item) => item.value === activeSection) ?? SECTIONS[0]

  useEffect(() => {
    function handleFormFeedback(event: Event) {
      const detail = (event as CustomEvent<{ kind?: 'error' | 'success' }>).detail
      setIsSubmittingChanges(false)
      if (detail?.kind === 'success') setHasPendingChanges(false)
    }

    window.addEventListener('volta:form-feedback', handleFormFeedback)
    return () => window.removeEventListener('volta:form-feedback', handleFormFeedback)
  }, [])

  function selectSection(section: Exclude<AppTab, 'avanzado'>) {
    setActiveSection(section)
    setHasPendingChanges(false)
    setIsSubmittingChanges(false)
  }

  function openAdvanced(section: LegacyAdvancedTab) {
    selectSection(section === 'avanzado' ? 'secciones' : section)
  }

  function markPendingFromInteraction(event: React.SyntheticEvent) {
    const target = event.target as HTMLElement
    if (target.closest('a')) return
    if (target.closest('[data-appearance-no-dirty="true"]')) return
    setHasPendingChanges(true)
  }

  function submitActiveAppearanceForm() {
    const form = workspaceRef.current?.querySelector('form')
    if (!(form instanceof HTMLFormElement) || isSubmittingChanges) return

    setIsSubmittingChanges(true)
    form.requestSubmit()

    window.setTimeout(() => {
      setIsSubmittingChanges(false)
    }, 12000)
  }

  return (
    <div className="volta-admin-page appearance-editor space-y-4 p-3.5 sm:p-5 lg:p-6">
      <header>
        <p className="admin-label">Apariencia</p>
        <h1 className="mt-1 text-[1.8rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">
          Hacé que tu tienda se sienta propia
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
          Elegí una base sólida y ajustá solo lo que cambia el resultado. Siempre con una consecuencia visual clara.
        </p>
      </header>

      <nav
        aria-label="Secciones de apariencia"
        className="appearance-tabs rounded-[14px] border border-black/8 bg-white p-1.5 dark:border-white/10 dark:bg-[#111820]"
      >
        <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const active = section.value === activeSection
            return (
              <button
                key={section.value}
                type="button"
                data-appearance-no-dirty="true"
                onClick={() => selectSection(section.value)}
                className={cn(
                  'appearance-tab flex min-w-0 items-center justify-center gap-1.5 rounded-[9px] px-1.5 py-2.5 text-[10px] font-medium transition sm:gap-2 sm:px-2.5 sm:text-xs md:h-10 md:flex-none md:px-3.5 md:text-sm',
                  active ? 'appearance-tab-active shadow-sm' : 'appearance-tab-idle',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('size-3.5 shrink-0 sm:size-4', active && 'text-[#12e89a]')} />
                <span className="min-w-0 truncate">{section.label}</span>
              </button>
            )
          })}

          <a
            href="/admin/vista-previa"
            target="_blank"
            rel="noreferrer"
            className="appearance-tab appearance-tab-preview flex min-w-0 items-center justify-center gap-1.5 rounded-[9px] px-1.5 py-2.5 text-[10px] font-medium transition sm:gap-2 sm:px-2.5 sm:text-xs md:h-10 md:flex-none md:px-3.5 md:text-sm"
          >
            <Eye className="size-3.5 shrink-0 sm:size-4" />
            <span>Vista</span>
          </a>
        </div>
      </nav>

      <section
        ref={workspaceRef}
        className="appearance-workspace min-w-0 overflow-x-clip rounded-[18px] border border-black/8 bg-[#f7f8fa] p-3 dark:border-white/10 dark:bg-[#0d131b] sm:p-4 lg:p-5"
        onChangeCapture={markPendingFromInteraction}
        onInputCapture={markPendingFromInteraction}
        onClickCapture={(event) => {
          const target = event.target as HTMLElement
          const button = target.closest('button[type="button"]')
          if (button) markPendingFromInteraction(event)
        }}
      >
        <div className="appearance-section-header mb-4 flex items-center justify-between gap-3 rounded-[12px] bg-[#f7f8fa]/95 py-1.5 dark:bg-[#0d131b]/95">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-[-0.035em] text-foreground">{meta.label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
          </div>

          {hasPendingChanges ? (
            <button
              type="button"
              data-appearance-no-dirty="true"
              onClick={submitActiveAppearanceForm}
              disabled={isSubmittingChanges}
              className="appearance-context-save inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-[#12e89a] px-3 py-2 text-xs font-semibold text-[#062117] shadow-[0_8px_22px_rgba(18,232,154,.18)] transition hover:bg-[#0fd98f] disabled:cursor-wait disabled:opacity-65 sm:px-4 sm:text-sm"
            >
              <Save className="size-3.5" />
              <span className="hidden xs:inline">{isSubmittingChanges ? 'Guardando…' : 'Guardar cambios'}</span>
              <span className="xs:hidden">{isSubmittingChanges ? 'Guardando…' : 'Guardar'}</span>
            </button>
          ) : null}
        </div>

        {activeSection === 'estilos' ? <QuickAppearanceForm theme={theme} store={store} onOpenAdvanced={openAdvanced} /> : null}
        {activeSection === 'contenido' ? <ContentForm content={content} store={store} /> : null}
        {activeSection === 'secciones' ? (
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <LayoutForm layout={layout} />
            <SectionsSummary layout={layout} />
          </div>
        ) : null}
        {activeSection !== 'estilos' && activeSection !== 'contenido' && activeSection !== 'secciones' ? (
          <ThemeForm theme={theme} activeSection={activeSection} onNavigate={(section) => selectSection(section)} />
        ) : null}
      </section>
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
            <div
              key={section.key}
              className={cn(
                'flex items-center gap-2 rounded-[9px] border px-3 py-2.5 text-xs',
                active
                  ? 'border-black/8 bg-slate-50 text-foreground dark:border-white/10 dark:bg-white/5'
                  : 'border-dashed border-black/7 text-muted-foreground opacity-55 dark:border-white/8',
              )}
            >
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
