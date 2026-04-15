'use client'

import { useMemo, useState } from 'react'
import {
  FileText,
  LayoutTemplate,
  Palette,
  Rows3,
  Settings2,
  Sparkles,
  SwatchBook,
  Type,
} from 'lucide-react'
import { ContentForm } from '@/components/admin/ContentForm'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { QuickAppearanceForm } from '@/components/admin/QuickAppearanceForm'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { cn } from '@/lib/utils'
import type { Store, StoreContent, StoreLayout, StoreTheme } from '@/types/store'

type AppTab = ThemeSection | 'avanzado' | 'contenido' | 'estilos'
type MainSection = 'estilos' | 'contenido' | 'avanzado'
type AdvancedTab = ThemeSection | 'avanzado'

export type AppearanceEditorTab = AppTab

const MAIN_SECTIONS = [
  {
    value: 'estilos' as const,
    label: 'Inicio rapido',
    description: 'Preset, preview y pocos ajustes importantes.',
    icon: Sparkles,
  },
  {
    value: 'contenido' as const,
    label: 'Portada',
    description: 'Titulo, imagen y mensaje principal.',
    icon: FileText,
  },
  {
    value: 'avanzado' as const,
    label: 'Avanzado',
    description: 'Control fino para quien lo necesita.',
    icon: Settings2,
  },
]

const ADVANCED_SECTIONS = [
  { value: 'colores' as const, label: 'Colores', icon: Palette },
  { value: 'fuentes' as const, label: 'Fuentes', icon: Type },
  { value: 'productos' as const, label: 'Productos', icon: SwatchBook },
  { value: 'layout' as const, label: 'Diseno', icon: LayoutTemplate },
  { value: 'avanzado' as const, label: 'Secciones', icon: Rows3 },
]

const APPEARANCE_STEPS = [
  {
    title: 'Elige una direccion visual',
    detail: 'Parte desde un estilo base que ya se vea premium.',
  },
  {
    title: 'Mira el impacto al instante',
    detail: 'La preview responde primero a lo que mas cambia la percepcion.',
  },
  {
    title: 'Ajusta solo lo importante',
    detail: 'Color, tipografia, ritmo y tarjetas antes del detalle fino.',
  },
  {
    title: 'Abre avanzado solo si hace falta',
    detail: 'El control profundo sigue disponible, pero ya no manda al inicio.',
  },
]

type Props = {
  content: StoreContent
  theme: StoreTheme
  layout: StoreLayout
  store: Store
  initialTab?: AppTab
}

function resolveMainSection(initialTab: AppTab): MainSection {
  if (initialTab === 'contenido') return 'contenido'
  if (initialTab === 'estilos') return 'estilos'
  return 'avanzado'
}

function resolveAdvancedSection(initialTab: AppTab): AdvancedTab {
  if (initialTab === 'contenido' || initialTab === 'estilos') return 'colores'
  return initialTab
}

export function AppearanceEditor({
  content,
  theme,
  layout,
  store,
  initialTab = 'estilos',
}: Props) {
  const [mainSection, setMainSection] = useState<MainSection>(() => resolveMainSection(initialTab))
  const [advancedSection, setAdvancedSection] = useState<AdvancedTab>(() => resolveAdvancedSection(initialTab))

  const activeSectionMeta = useMemo(
    () => MAIN_SECTIONS.find((section) => section.value === mainSection) ?? MAIN_SECTIONS[0],
    [mainSection],
  )

  function openAdvanced(section: AdvancedTab) {
    setAdvancedSection(section)
    setMainSection('avanzado')
  }

  return (
    <div className="space-y-4">
      <section className="admin-surface rounded-[28px] p-5 sm:p-6 lg:p-7">
        <div className="max-w-3xl">
          <p className="admin-label">Tienda</p>
          <h1 className="mt-2 text-balance font-heading text-[2rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.5rem]">
            Elige un estilo solido y ajusta solo lo que cambia el resultado
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-[15px]">
            La idea no es disenar una web desde cero. Primero defines una direccion visual clara,
            ves la preview y haces unos pocos ajustes con impacto directo. El detalle fino queda
            disponible, pero ya no estorba al principio.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          {APPEARANCE_STEPS.map((step, index) => (
            <article
              key={step.title}
              className={cn(
                'rounded-[22px] border p-4',
                index === 0
                  ? 'border-emerald-300/18 bg-emerald-400/8'
                  : 'border-border bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03]',
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Paso {index + 1}
              </p>
              <p className="mt-3 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="admin-label">Editor visual</p>
          <h2 className="mt-1 text-[1.55rem] font-semibold tracking-[-0.04em] text-foreground">
            {activeSectionMeta.label}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{activeSectionMeta.description}</p>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          <div className="admin-surface flex min-w-max gap-1 rounded-[20px] p-1.5">
            {MAIN_SECTIONS.map((section) => {
              const Icon = section.icon
              const active = section.value === mainSection

              return (
                <button
                  key={section.value}
                  type="button"
                  onClick={() => setMainSection(section.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm font-medium transition duration-150 active:scale-[0.96]',
                    active ? 'admin-surface-selected text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className={cn('size-3.5', active && section.value === 'estilos' ? 'text-emerald-400' : '')} />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {mainSection === 'estilos' ? (
        <QuickAppearanceForm theme={theme} store={store} onOpenAdvanced={openAdvanced} />
      ) : null}

      {mainSection === 'contenido' ? <ContentForm content={content} store={store} /> : null}

      {mainSection === 'avanzado' ? (
        <AdvancedAppearanceView
          advancedSection={advancedSection}
          layout={layout}
          theme={theme}
          onChangeSection={setAdvancedSection}
        />
      ) : null}
    </div>
  )
}

function AdvancedAppearanceView({
  advancedSection,
  layout,
  theme,
  onChangeSection,
}: {
  advancedSection: AdvancedTab
  layout: StoreLayout
  theme: StoreTheme
  onChangeSection: (section: AdvancedTab) => void
}) {
  return (
    <div className="space-y-4">
      <section className="admin-surface rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Modo avanzado
            </p>
            <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">
              Control fino para afinar la tienda sin apurar decisiones
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aqui quedan las opciones mas tecnicas o menos urgentes. El flujo principal ya resuelve
              lo importante; esta capa existe para quien necesita empujar mas el detalle.
            </p>
          </div>

          <div className="rounded-[20px] border border-border bg-black/[0.04] p-1.5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-wrap gap-1">
              {ADVANCED_SECTIONS.map((section) => {
                const Icon = section.icon
                const active = section.value === advancedSection

                return (
                  <button
                    key={section.value}
                    type="button"
                    onClick={() => onChangeSection(section.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm font-medium transition duration-150 active:scale-[0.96]',
                      active ? 'admin-surface-selected text-white' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {advancedSection === 'avanzado' ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <LayoutForm layout={layout} />
          <div className="xl:sticky xl:top-6 xl:self-start">
            <SectionsDiagram layout={layout} />
          </div>
        </section>
      ) : (
        <ThemeForm theme={theme} activeSection={advancedSection} onNavigate={onChangeSection} />
      )}
    </div>
  )
}

const SECTIONS_META = [
  { key: 'show_hero' as const, label: 'Portada', hint: 'Mensaje principal con imagen' },
  { key: 'show_featured' as const, label: 'Destacados', hint: 'Una seleccion breve al inicio' },
  { key: 'show_categories' as const, label: 'Categorias', hint: 'Ordena el recorrido cuando hay mas productos' },
  { key: 'show_catalog' as const, label: 'Catalogo', hint: 'La grilla principal de venta' },
  { key: 'show_footer' as const, label: 'Footer', hint: 'Cierre con contacto y datos utiles' },
]

function SectionsDiagram({ layout }: { layout: StoreLayout }) {
  return (
    <div className="admin-surface rounded-[24px] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Composicion general
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Una vista simple de que bloques aparecen hoy en la tienda.
      </p>

      <div className="mt-5 space-y-1.5">
        <div className="flex items-center justify-between rounded-[12px] border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <div className="h-[5px] w-14 rounded-full bg-white/25" />
          <div className="h-3 w-10 rounded-full bg-emerald-400/25" />
        </div>

        {SECTIONS_META.map((section) => {
          const active = layout[section.key]

          return (
            <div
              key={section.key}
              className={cn(
                'rounded-[12px] border px-3 py-2.5 transition',
                active
                  ? 'border-white/8 bg-white/[0.04]'
                  : 'border-dashed border-white/[0.06] bg-transparent opacity-45',
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn('size-1.5 rounded-full', active ? 'bg-emerald-400/70' : 'bg-white/20')} />
                <p className={cn('flex-1 text-sm', active ? 'text-foreground' : 'text-muted-foreground')}>
                  {section.label}
                </p>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {active ? 'visible' : 'oculto'}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{section.hint}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
