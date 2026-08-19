'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Eye, FileText, LayoutTemplate, Palette, Rows3, Save, Sparkles, SwatchBook, Type } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FontStylePanel } from '@/components/admin/FontStylePanel'
import { HeroStudio } from '@/components/admin/HeroStudio'
import { HumanSectionsForm } from '@/components/admin/HumanSectionsForm'
import { QuickAppearanceForm } from '@/components/admin/QuickAppearanceForm'
import { SimpleThemeForm, type SimpleThemeSection } from '@/components/admin/SimpleThemeForm'
import { cn } from '@/lib/utils'
import type { Store, StoreContent, StoreLayout, StoreTheme } from '@/types/store'

type AppTab = SimpleThemeSection | 'contenido' | 'estilos' | 'secciones' | 'avanzado'
export type AppearanceEditorTab = AppTab

type Props = { content: StoreContent; theme: StoreTheme; layout: StoreLayout; store: Store; initialTab?: AppTab }
type Item = { value: Exclude<AppTab, 'avanzado'>; label: string; icon: LucideIcon }
const ESSENTIAL: Item[] = [
  { value: 'estilos', label: 'Estilo', icon: Sparkles },
  { value: 'contenido', label: 'Portada', icon: FileText },
  { value: 'colores', label: 'Colores', icon: Palette },
  { value: 'productos', label: 'Productos', icon: SwatchBook },
]
const ADVANCED: Item[] = [
  { value: 'layout', label: 'Espaciado', icon: LayoutTemplate },
  { value: 'fuentes', label: 'Letras', icon: Type },
  { value: 'secciones', label: 'Qué mostrar', icon: Rows3 },
]
const ALL = [...ESSENTIAL, ...ADVANCED]
const normalize = (tab: AppTab): Exclude<AppTab, 'avanzado'> => tab === 'avanzado' ? 'secciones' : tab

export function AppearanceEditor({ content, theme, layout, store, initialTab = 'estilos' }: Props) {
  const [active, setActive] = useState<Exclude<AppTab, 'avanzado'>>(() => normalize(initialTab))
  const [more, setMore] = useState(() => ADVANCED.some((item) => item.value === normalize(initialTab)))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const workspaceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: 'error' | 'success' }>).detail
      setSaving(false)
      if (detail?.kind === 'success') setDirty(false)
    }
    window.addEventListener('volta:form-feedback', handler)
    return () => window.removeEventListener('volta:form-feedback', handler)
  }, [])

  function select(section: Exclude<AppTab, 'avanzado'>) {
    setActive(section); setDirty(false); setSaving(false); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function openAdvanced(section: SimpleThemeSection | 'avanzado') { setMore(true); select(section === 'avanzado' ? 'secciones' : section) }
  function markDirty(event: React.SyntheticEvent) {
    const target = event.target as HTMLElement
    if (target.closest('a') || target.closest('[data-appearance-no-dirty="true"]')) return
    setDirty(true)
  }
  function save() {
    const form = workspaceRef.current?.querySelector('form')
    if (!(form instanceof HTMLFormElement) || saving) return
    setSaving(true); form.requestSubmit(); window.setTimeout(() => setSaving(false), 12000)
  }
  function tabs(items: Item[]) {
    return items.map((item) => { const Icon = item.icon; const selected = active === item.value; return <button key={item.value} type="button" data-appearance-no-dirty="true" onClick={() => select(item.value)} className={cn('appearance-tab flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] px-2 text-xs font-semibold', selected ? 'appearance-tab-active' : 'appearance-tab-idle')}><Icon className={cn('size-4', selected && 'text-[#12e89a]')} />{item.label}</button> })
  }
  const label = ALL.find((item) => item.value === active)?.label ?? 'Diseño'

  return (
    <div className="volta-admin-page appearance-editor space-y-3 p-3.5 sm:p-5 lg:p-6">
      <header className="flex items-start justify-between gap-3"><div><p className="admin-label">Diseño</p><h1 className="mt-1 text-[1.65rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Cómo se ve tu tienda</h1></div><a href="/admin/vista-previa" className="ux-dark-button hidden min-h-10 shrink-0 items-center gap-2 rounded-[10px] bg-[#10161d] px-3.5 text-xs font-semibold lg:inline-flex"><Eye className="size-4 text-[#12e89a]" />Ver mi tienda</a></header>
      <nav className="appearance-tabs rounded-[14px] border border-black/8 bg-white p-1.5 dark:border-white/10 dark:bg-[#111820]" aria-label="Opciones de diseño"><div className="grid grid-cols-2 gap-1 sm:grid-cols-4">{tabs(ESSENTIAL)}</div><button type="button" data-appearance-no-dirty="true" onClick={() => setMore((value) => !value)} className="mt-1 flex min-h-9 w-full items-center justify-center gap-2 rounded-[9px] text-[11px] font-medium text-muted-foreground">Más opciones <ChevronDown className={cn('size-3.5 transition', more && 'rotate-180')} /></button>{more ? <div className="mt-1 grid grid-cols-3 gap-1 border-t border-black/7 pt-1.5 dark:border-white/8">{tabs(ADVANCED)}</div> : null}</nav>
      <section ref={workspaceRef} className="appearance-workspace min-w-0 overflow-x-clip rounded-[18px] border border-black/8 bg-[#f7f8fa] p-2.5 dark:border-white/10 dark:bg-[#0d131b] sm:p-4" onChangeCapture={markDirty} onInputCapture={markDirty} onClickCapture={(event) => { if ((event.target as HTMLElement).closest('button[type="button"]')) markDirty(event) }}>
        <div className="appearance-section-header mb-2.5 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-foreground sm:text-lg">{label}</h2>{dirty ? <button type="button" data-appearance-no-dirty="true" onClick={save} disabled={saving} className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] bg-[#12e89a] px-3 text-xs font-semibold text-[#062117]"><Save className="size-3.5" />{saving ? 'Guardando…' : 'Guardar'}</button> : null}</div>
        {active === 'estilos' ? <QuickAppearanceForm theme={theme} store={store} onOpenAdvanced={openAdvanced} /> : null}
        {active === 'contenido' ? <HeroStudio content={content} store={store} theme={theme} showHero={layout.show_hero} /> : null}
        {active === 'fuentes' ? <FontStylePanel theme={theme} /> : null}
        {active === 'secciones' ? <HumanSectionsForm layout={layout} /> : null}
        {active !== 'estilos' && active !== 'contenido' && active !== 'fuentes' && active !== 'secciones' ? <SimpleThemeForm theme={theme} activeSection={active} /> : null}
      </section>
    </div>
  )
}
