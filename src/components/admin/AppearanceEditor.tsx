'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  FileText,
  ImageIcon,
  LayoutGrid,
  Layers3,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  Palette,
  Settings2,
  Smartphone,
  Sparkles,
  Type,
} from 'lucide-react'
import Link from 'next/link'
import { ContentForm } from '@/components/admin/ContentForm'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LayoutForm } from '@/components/admin/LayoutForm'
import { ThemeForm, type ThemeSection } from '@/components/admin/ThemeForm'
import { THEME_PRESETS, type ThemePreset } from '@/data/theme-presets'
import { applyThemePreset, uploadLogo } from '@/lib/actions/store'
import { buildThemeVars } from '@/lib/utils/theme'
import { cn } from '@/lib/utils'
import type { Store, StoreContent, StoreLayout, StoreTheme } from '@/types/store'

type AppTab = ThemeSection | 'avanzado' | 'contenido' | 'estilos'
type PreviewDevice = 'desktop' | 'mobile'
export type AppearanceEditorTab = AppTab

const TABS: Array<{ value: AppTab; label: string; icon: React.ElementType }> = [
  { value: 'estilos',   label: 'Estilos',   icon: Sparkles },
  { value: 'contenido', label: 'Portada',   icon: FileText },
  { value: 'colores',   label: 'Colores',   icon: Palette },
  { value: 'productos', label: 'Productos', icon: LayoutGrid },
  { value: 'layout',    label: 'Diseño',    icon: Layers3 },
  { value: 'fuentes',   label: 'Fuentes',   icon: Type },
  { value: 'avanzado',  label: 'Avanzado',  icon: Settings2 },
]

type Props = {
  content: StoreContent
  theme: StoreTheme
  layout: StoreLayout
  store: Store
  initialTab?: AppTab
}

export function AppearanceEditor({
  content,
  theme,
  layout,
  store,
  initialTab = 'estilos',
}: Props) {
  const [tab, setTab] = useState<AppTab>(initialTab)

  return (
    <div className="space-y-4">
      <section className="admin-surface rounded-[24px] p-4 sm:p-6">
        <div className="max-w-3xl">
          <p className="admin-label">Tienda</p>
          <h1 className="mt-2 text-balance font-heading text-[2rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.5rem]">
            La parte visible de tu marca y de tu tienda
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Aqui decides como se ve la portada, que estilo transmite tu tienda y como se ordena la experiencia antes del clic en WhatsApp.
          </p>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.9fr)]">
          <button
            type="button"
            onClick={() => setTab('contenido')}
            className="rounded-[22px] border border-border bg-black/[0.04] p-4 text-left transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-300">
                <FileText className="size-4" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                Prioridad
              </span>
            </div>
            <p className="mt-6 text-sm font-semibold text-foreground">Ajustar portada</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Define titulo, subtitulo e imagen para que la tienda explique rapido que vendes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab('estilos')}
            className="rounded-[22px] border border-border bg-black/[0.04] p-4 text-left transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-black/[0.06] text-muted-foreground dark:bg-white/[0.06]">
              <Sparkles className="size-4" />
            </div>
            <p className="mt-6 text-sm font-semibold text-foreground">Elegir estilo base</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Elige un preset de arranque y luego afina colores, fuentes y tarjetas segun tu marca.
            </p>
          </button>

          <div id="branding" className="rounded-[22px] border border-border bg-black/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-black/[0.06] text-muted-foreground dark:bg-white/[0.06]">
                <ImageIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Branding</p>
                <p className="text-xs text-muted-foreground">Logo y presencia visual</p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sube tu logo aqui para que la identidad visual quede junto al resto de la tienda y no mezclada con datos operativos.
            </p>

            <div className="mt-4 max-w-[220px]">
              <ImageUpload
                currentUrl={store.logo_url}
                onUpload={uploadLogo}
                fieldName="logo"
                aspectHint="1:1"
                label="Subir logo"
              />
            </div>

            <Link
              href="/admin/vista-previa"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-emerald-300"
            >
              Ver vista previa
              <CheckCircle2 className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <p className="admin-label">Editor de tienda</p>
          <h2 className="mt-1 font-heading text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
            Ajusta lo que conviene tocar ahora
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Empieza por portada o estilo, y deja los ajustes finos para despues.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            <button type="button" onClick={() => setTab('contenido')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:text-white">
              Portada
            </button>
            <button type="button" onClick={() => setTab('estilos')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:text-white">
              Estilo
            </button>
            <button type="button" onClick={() => setTab('layout')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:text-white">
              Layout
            </button>
          </div>
        </div>

        <div className="ml-auto flex gap-1 overflow-x-auto">
          <div className="admin-surface flex min-w-max gap-0.5 rounded-[20px] p-1.5">
            {TABS.map((item) => {
              const Icon = item.icon
              const active = tab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-sm font-medium transition duration-150 active:scale-[0.96]',
                    active ? 'admin-surface-selected text-white' : 'text-neutral-400 hover:text-white',
                    active && item.value === 'estilos' ? 'text-emerald-300' : '',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-3.5 shrink-0',
                      active && item.value === 'estilos' ? 'text-emerald-400' : '',
                    )}
                  />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {tab === 'estilos' ? (
        <EstilosEditorView theme={theme} />
      ) : tab === 'contenido' ? (
        <ContentForm content={content} store={store} />
      ) : tab === 'avanzado' ? (
        <AvanzadoEditorView layout={layout} />
      ) : (
        <ThemeForm
          theme={theme}
          activeSection={tab as ThemeSection}
          onNavigate={(s) => setTab(s)}
        />
      )}
    </div>
  )
}

// ─── Shared preview controls ──────────────────────────────────────────────────

function DeviceToggle({
  device,
  onChange,
}: {
  device: PreviewDevice
  onChange: (d: PreviewDevice) => void
}) {
  return (
    <div className="flex rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-0.5">
      {([
        { value: 'desktop' as const, Icon: Monitor,    label: 'Desktop' },
        { value: 'mobile'  as const, Icon: Smartphone, label: 'Mobile'  },
      ] as const).map(({ value, Icon, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => onChange(value)}
          className={cn(
            'flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition duration-150 active:scale-[0.96]',
            device === value
              ? 'admin-surface-selected text-white'
              : 'text-neutral-500 hover:text-neutral-300',
          )}
        >
          <Icon className="size-3" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

function FocusButton({
  focused,
  onToggle,
}: {
  focused: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      title={focused ? 'Salir del modo foco' : 'Modo foco: solo preview'}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-medium transition duration-150 active:scale-[0.96]',
        focused
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
          : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white',
      )}
    >
      {focused ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
      <span className="hidden sm:inline">{focused ? 'Salir' : 'Expandir'}</span>
    </button>
  )
}

function PreviewWrapper({
  device,
  children,
}: {
  device: PreviewDevice
  children: React.ReactNode
}) {
  if (device === 'mobile') {
    return (
      <div className="flex justify-center">
        <div
          className="w-full overflow-hidden rounded-[32px] shadow-[0_0_0_6px_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.5)]"
          style={{ maxWidth: 390 }}
        >
          {children}
        </div>
      </div>
    )
  }
  return <>{children}</>
}

// ─── Estilos tab ──────────────────────────────────────────────────────────────

function EstilosEditorView({ theme }: { theme: StoreTheme }) {
  const [applying, setApplying]   = useState<string | null>(null)
  const [appliedId, setAppliedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [focused,   setFocused]   = useState(false)
  const [device,    setDevice]    = useState<PreviewDevice>('desktop')
  const [glowing,   setGlowing]   = useState(false)

  const activePresetId = hoveredId ?? appliedId
  const activePreset   = THEME_PRESETS.find((p) => p.id === activePresetId)

  const previewTheme: StoreTheme = useMemo(
    () =>
      activePreset
        ? { ...theme, ...(activePreset.theme as Partial<StoreTheme>) }
        : theme,
    [theme, activePreset],
  )

  const resolvedMode: 'light' | 'dark' = previewTheme.visual_mode === 'dark' ? 'dark' : 'light'

  const previewVars = useMemo(
    () => buildThemeVars(previewTheme, resolvedMode),
    [previewTheme, resolvedMode],
  )

  async function handleApply(preset: ThemePreset) {
    setApplying(preset.id)
    const result = await applyThemePreset(preset.id)
    if (result?.error) {
      toast.error('No se pudo aplicar el estilo.')
    } else {
      setAppliedId(preset.id)
      setGlowing(true)
      setTimeout(() => setGlowing(false), 1200)
      toast.success(`Estilo "${preset.name}" aplicado. Podés personalizar cualquier detalle.`)
    }
    setApplying(null)
  }

  return (
    <section
      className={cn(
        'grid gap-4',
        focused ? '' : 'xl:grid-cols-[340px_minmax(0,1fr)]',
      )}
    >
      {/* Preset sidebar — hidden in focus mode */}
      {!focused && (
        <div className="admin-surface rounded-[24px] p-3">
          <div className="px-2 pb-2.5 pt-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Estilos predefinidos
            </p>
            <p className="mt-1 text-[11px] text-neutral-600">
              Pasá el cursor para previsualizar. Elegí una base y ajustá después.
            </p>
          </div>
          <div className="space-y-0.5">
            {THEME_PRESETS.map((preset) => (
              <PresetSidebarCard
                key={preset.id}
                preset={preset}
                isApplying={applying === preset.id}
                justApplied={appliedId === preset.id}
                isHovered={hoveredId === preset.id}
                onHover={() => setHoveredId(preset.id)}
                onLeave={() => setHoveredId(null)}
                onApply={() => handleApply(preset)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview column */}
      <div className="space-y-3 xl:sticky xl:top-6 xl:self-start">
        {/* Preview header */}
        <div className="admin-surface rounded-[18px] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400/80" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Preview en vivo
              </p>
              {activePreset ? (
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 transition-all duration-200">
                  {activePreset.name}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-600">Tu estilo actual</span>
              )}
            </div>
            <a
              href="/admin/vista-previa"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-neutral-300 transition hover:border-white/20 hover:text-white active:scale-[0.97]"
            >
              Ver tienda
              <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 10L10 2M10 2H4.5M10 2V7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Preview controls bar */}
        <div className="flex items-center justify-between px-0.5">
          <DeviceToggle device={device} onChange={setDevice} />
          <FocusButton focused={focused} onToggle={() => setFocused((f) => !f)} />
        </div>

        {/* Mockup with optional glow ring on apply */}
        <div
          className="overflow-hidden rounded-[24px] transition-all duration-300"
          style={
            glowing
              ? { animation: 'preview-glow-pulse 1.2s ease forwards' }
              : undefined
          }
        >
          <PreviewWrapper device={device}>
            <PresetsStoreMockup previewVars={previewVars} />
          </PreviewWrapper>
        </div>
      </div>
    </section>
  )
}

function PresetSidebarCard({
  preset,
  isApplying,
  justApplied,
  isHovered,
  onHover,
  onLeave,
  onApply,
}: {
  preset: ThemePreset
  isApplying: boolean
  justApplied: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onApply: () => void
}) {
  const [c1, , c3] = preset.previewColors
  const isDark = preset.theme.visual_mode === 'dark'

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-[16px] p-3 transition duration-150 active:scale-[0.99]',
        isHovered ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
        justApplied ? 'ring-1 ring-emerald-400/20' : '',
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Color swatch */}
      <div
        className="relative size-10 shrink-0 overflow-hidden rounded-[10px]"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${c1}cc, ${c1}33)`
            : `linear-gradient(135deg, ${c1}, color-mix(in srgb, ${c1} 88%, white 12%))`,
        }}
      >
        <div className="flex h-full items-end p-1.5">
          <div className="h-1.5 w-full rounded-full opacity-60" style={{ backgroundColor: c3 }} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-white">{preset.name}</p>
          <span className="text-[9px] uppercase tracking-[0.14em] text-neutral-600">
            {isDark ? 'Oscuro' : 'Claro'}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-neutral-500">{preset.description}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onApply()
        }}
        disabled={isApplying}
        className={cn(
          'shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition duration-150 active:scale-[0.95] disabled:opacity-50',
          justApplied
            ? 'bg-emerald-400/15 text-emerald-300'
            : 'bg-white/[0.07] text-neutral-300 hover:bg-white/[0.12] hover:text-white',
        )}
      >
        {justApplied ? (
          <>
            <CheckCircle2 className="size-3" />
            Aplicado
          </>
        ) : isApplying ? (
          <>
            <Loader2 className="size-3 animate-spin" />
            Aplicando
          </>
        ) : (
          'Aplicar'
        )}
      </button>
    </div>
  )
}

function PresetsStoreMockup({
  previewVars,
}: {
  previewVars: React.CSSProperties
}) {
  return (
    <div
      className="preview-live overflow-hidden rounded-[24px]"
      style={{ ...previewVars, background: 'var(--store-bg-gradient)' }}
    >
      {/* Nav */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-nav-bg)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-[6px]"
            style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-accent) 50%, var(--store-primary) 50%))' }}
          />
          <span className="store-heading text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
            Mi Tienda
          </span>
        </div>
        <button
          type="button"
          className="rounded-[var(--store-button-radius)] px-3 py-1.5 text-[10px] font-semibold"
          style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}
        >
          Carrito
        </button>
      </div>

      {/* Hero */}
      <div
        className="pb-6 pt-7"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--store-accent) 12%, transparent), transparent 52%), radial-gradient(circle at left 70%, color-mix(in srgb, var(--store-secondary) 13%, transparent), transparent 42%), var(--store-bg-gradient)',
        }}
      >
        <div className="pl-5 pr-2">
          <span
            className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{
              color: 'var(--store-secondary)',
              backgroundColor: 'color-mix(in srgb, var(--store-secondary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)',
            }}
          >
            Colección
          </span>
          <h4 className="store-heading mt-2.5 text-2xl leading-tight" style={{ color: 'var(--store-text)' }}>
            Tu tienda, premium.
          </h4>
          <p className="mt-1.5 text-[11px] leading-5" style={{ color: 'var(--store-soft-text)' }}>
            Contraste, color y personalidad desde el primer scroll.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="rounded-[var(--store-button-radius)] px-4 py-2 text-[11px] font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                color: 'var(--store-primary-contrast)',
                boxShadow: '0 8px 20px color-mix(in srgb, var(--store-primary) 24%, transparent)',
              }}
            >
              Ver catálogo
            </button>
            <button
              type="button"
              className="rounded-[var(--store-button-radius)] border px-4 py-2 text-[11px] font-medium"
              style={{ borderColor: 'var(--store-border-strong)', color: 'var(--store-text)' }}
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-3">
        {(['Producto 1', 'Producto 2', 'Producto 3'] as const).map((label) => (
          <div
            key={label}
            className="overflow-hidden rounded-[var(--store-card-radius)] border"
            style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-card-background)', boxShadow: 'var(--store-card-shadow)' }}
          >
            <div
              className="aspect-[3/4]"
              style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-accent) 18%, transparent), color-mix(in srgb, var(--store-secondary) 14%, transparent))' }}
            />
            <div className="p-2">
              <p className="store-heading text-[10px] font-semibold" style={{ color: 'var(--store-text)' }}>
                {label}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold" style={{ color: 'var(--store-primary)' }}>
                $12.900
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="border-t px-5 py-3.5"
        style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-footer-bg-gradient)' }}
      >
        <div className="flex items-center justify-between">
          <p className="store-heading text-sm font-semibold" style={{ color: 'var(--store-text)' }}>
            Mi Tienda
          </p>
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full" style={{ backgroundColor: 'var(--store-primary)' }} />
            <div className="size-2 rounded-full" style={{ backgroundColor: 'var(--store-accent)' }} />
            <div className="size-2 rounded-full" style={{ backgroundColor: 'var(--store-secondary)' }} />
          </div>
        </div>
        <p className="mt-0.5 text-[10px]" style={{ color: 'var(--store-muted-text)' }}>
          Powered by Volta Store
        </p>
      </div>
    </div>
  )
}

// ─── Avanzado tab ─────────────────────────────────────────────────────────────

function AvanzadoEditorView({ layout }: { layout: StoreLayout }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <LayoutForm layout={layout} />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <SectionsDiagram layout={layout} />
      </div>
    </section>
  )
}

const SECTIONS_META = [
  { key: 'show_hero' as const,       label: 'Portada',      hint: 'Hero con imagen y CTA' },
  { key: 'show_featured' as const,   label: 'Destacados',   hint: 'Selección curada al inicio' },
  { key: 'show_categories' as const, label: 'Categorías',   hint: 'Filtros de navegación' },
  { key: 'show_catalog' as const,    label: 'Catálogo',     hint: 'Grilla completa de productos' },
  { key: 'show_footer' as const,     label: 'Footer',       hint: 'Contacto y datos al cierre' },
]

function SectionsDiagram({ layout }: { layout: StoreLayout }) {
  return (
    <div className="admin-surface rounded-[24px] p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        Composición de la tienda
      </p>
      <p className="mb-4 text-[11px] text-neutral-600">Vista general de las secciones.</p>

      <div className="space-y-1.5">
        {/* Nav — always visible */}
        <div
          className="flex items-center justify-between rounded-[10px] border px-3 py-2.5"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="h-[5px] w-12 rounded-full bg-white/25" />
          <div className="h-[12px] w-10 rounded-full bg-emerald-400/25" />
        </div>

        {SECTIONS_META.map((section) => {
          const active = layout[section.key]
          return (
            <div
              key={section.key}
              className={cn(
                'rounded-[10px] border px-3 py-2.5 transition duration-150',
                active
                  ? 'border-white/[0.07] bg-white/[0.03]'
                  : 'border-dashed border-white/[0.05] opacity-40',
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn('size-1.5 shrink-0 rounded-full', active ? 'bg-emerald-400/60' : 'bg-white/20')}
                />
                <p className={cn('flex-1 text-[11px] font-medium', active ? 'text-neutral-300' : 'text-neutral-600')}>
                  {section.label}
                </p>
                {active ? (
                  <p className="text-[10px] text-neutral-600">{section.hint}</p>
                ) : (
                  <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-600">oculto</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
