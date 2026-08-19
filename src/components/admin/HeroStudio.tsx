'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { CharCounter } from '@/components/common/CharCounter'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CONTENT_LIMITS, FONT_FAMILY_MAP } from '@/data/defaults'
import { updateHeroContent } from '@/lib/actions/hero-content'
import { uploadHeroImage } from '@/lib/actions/store'
import { storeContentSchema, type StoreContentInput } from '@/lib/validations/store'
import { cn } from '@/lib/utils'
import type { BannerMode, BannerSpeed, HeroImageLayout, HeroTitleFont, HeroTitleScale, Store, StoreContent, StoreTheme } from '@/types/store'

type Props = {
  content: StoreContent
  store: Store
  theme: StoreTheme
}

type PreviewDevice = 'desktop' | 'mobile'

const FONT_OPTIONS: Array<{ value: HeroTitleFont; label: string; hint: string }> = [
  { value: 'inherit', label: 'De la tienda', hint: 'Mantiene el estilo general' },
  { value: 'plus-jakarta', label: 'Con presencia', hint: 'Moderna y comercial' },
  { value: 'geist', label: 'Minimal', hint: 'Limpia y directa' },
  { value: 'playfair', label: 'Editorial', hint: 'Elegante y expresiva' },
]

const SCALE_OPTIONS: Array<{ value: HeroTitleScale; label: string }> = [
  { value: 'subtle', label: 'Discreto' },
  { value: 'balanced', label: 'Equilibrado' },
  { value: 'impact', label: 'Impactante' },
]

const BANNER_SPEED_OPTIONS: Array<{ value: BannerSpeed; label: string; duration: string }> = [
  { value: 'slow', label: 'Lento', duration: '28s' },
  { value: 'normal', label: 'Normal', duration: '20s' },
  { value: 'fast', label: 'Rápido', duration: '14s' },
]

export function HeroStudio({ content, store, theme }: Props) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StoreContentInput>({
    resolver: zodResolver(storeContentSchema),
    defaultValues: {
      banner_mode: content.banner_mode === 'animated' ? 'animated' : 'static',
      banner_speed: content.banner_speed === 'slow' || content.banner_speed === 'fast' ? content.banner_speed : 'normal',
      hero_image_layout: content.hero_image_layout === 'background' ? 'background' : 'side',
      hero_overlay_opacity: typeof content.hero_overlay_opacity === 'number' ? content.hero_overlay_opacity : 55,
      hero_title_font: content.hero_title_font ?? 'inherit',
      hero_title_scale: content.hero_title_scale ?? 'balanced',
      hero_title: content.hero_title,
      hero_subtitle: content.hero_subtitle,
      support_text: content.support_text,
    },
  })

  const heroTitle = useWatch({ control, name: 'hero_title' }) ?? ''
  const heroSubtitle = useWatch({ control, name: 'hero_subtitle' }) ?? ''
  const supportText = useWatch({ control, name: 'support_text' }) ?? ''
  const heroImageLayout = (useWatch({ control, name: 'hero_image_layout' }) ?? 'side') as HeroImageLayout
  const heroOverlayOpacity = useWatch({ control, name: 'hero_overlay_opacity' }) ?? 55
  const heroTitleFont = (useWatch({ control, name: 'hero_title_font' }) ?? 'inherit') as HeroTitleFont
  const heroTitleScale = (useWatch({ control, name: 'hero_title_scale' }) ?? 'balanced') as HeroTitleScale
  const bannerMode = (useWatch({ control, name: 'banner_mode' }) ?? 'static') as BannerMode
  const bannerSpeed = (useWatch({ control, name: 'banner_speed' }) ?? 'normal') as BannerSpeed

  const bannerPreviewItems = useMemo(() => buildBannerPreviewItems(store), [store])
  const activeSpeed = BANNER_SPEED_OPTIONS.find((option) => option.value === bannerSpeed) ?? BANNER_SPEED_OPTIONS[1]

  async function onSubmit(data: StoreContentInput) {
    setSubmitError(null)
    const result = await updateHeroContent(data)
    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? 'No pudimos guardar la portada.'
      setSubmitError(message)
      toast.error(message)
      return
    }
    setSaved(true)
    toast.success('Portada actualizada.')
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(340px,430px)_minmax(0,1fr)] xl:items-start">
        <div className="space-y-4">
          <Panel title="Imagen principal" description="Subí una imagen y elegí si querés verla al costado o como fondo.">
            <ImageUpload
              currentUrl={content.hero_image_url}
              onUpload={uploadHeroImage}
              fieldName="hero"
              aspectHint="16:9"
              label="Elegir imagen"
              className="max-w-none"
            />
          </Panel>

          <Panel title="Cómo usar la imagen" description="Dos opciones. Podés cambiar cuando quieras.">
            <div className="grid grid-cols-2 gap-2">
              <Choice selected={heroImageLayout === 'side'} onClick={() => setValue('hero_image_layout', 'side', { shouldDirty: true })}>
                <span className="block font-semibold">A un costado</span>
                <span className="mt-1 block text-[10px] font-normal opacity-65">Texto e imagen separados</span>
              </Choice>
              <Choice selected={heroImageLayout === 'background'} onClick={() => setValue('hero_image_layout', 'background', { shouldDirty: true })}>
                <span className="block font-semibold">De fondo</span>
                <span className="mt-1 block text-[10px] font-normal opacity-65">Foto detrás del contenido</span>
              </Choice>
            </div>

            {heroImageLayout === 'background' ? (
              <div className="mt-3 rounded-[10px] border border-black/7 bg-slate-50 p-3 dark:border-white/8 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Legibilidad</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Más contraste si la foto compite con el texto.</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-foreground dark:bg-white/8">{heroOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  step={5}
                  value={heroOverlayOpacity}
                  onChange={(event) => setValue('hero_overlay_opacity', Number(event.target.value), { shouldDirty: true })}
                  className="mt-3 w-full accent-[#12e89a]"
                  aria-label="Legibilidad de la portada"
                />
                <div className="mt-1 flex justify-between text-[9px] text-muted-foreground"><span>Más foto</span><span>Más contraste</span></div>
              </div>
            ) : null}
          </Panel>
        </div>

        <div className="space-y-4">
          <section className="rounded-[14px] border border-black/8 bg-white p-3.5 dark:border-white/10 dark:bg-[#111820] sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Vista previa</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Ajustá el título viendo cómo queda.</p>
              </div>
              <div className="flex rounded-[9px] border border-black/8 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.03]">
                <PreviewButton active={previewDevice === 'desktop'} onClick={() => setPreviewDevice('desktop')} label="Desktop"><Monitor className="size-3.5" /></PreviewButton>
                <PreviewButton active={previewDevice === 'mobile'} onClick={() => setPreviewDevice('mobile')} label="Mobile"><Smartphone className="size-3.5" /></PreviewButton>
              </div>
            </div>
            <HeroPreview
              content={content}
              theme={theme}
              title={heroTitle}
              subtitle={heroSubtitle}
              supportText={supportText}
              layout={heroImageLayout}
              overlayOpacity={heroOverlayOpacity}
              titleFont={heroTitleFont}
              titleScale={heroTitleScale}
              device={previewDevice}
            />
          </section>

          <Panel title="Texto de la portada" description="Que se entienda qué vendés en pocos segundos.">
            <div className="space-y-4">
              <FieldBlock label="Título" current={heroTitle.length} max={CONTENT_LIMITS.hero_title}>
                <Input {...register('hero_title')} placeholder="Ej: Strong Protein" maxLength={CONTENT_LIMITS.hero_title} className="h-11 bg-white dark:bg-white/5" />
                {errors.hero_title ? <FieldError>{errors.hero_title.message}</FieldError> : null}
              </FieldBlock>
              <FieldBlock label="Descripción corta" current={heroSubtitle.length} max={CONTENT_LIMITS.hero_subtitle}>
                <Textarea {...register('hero_subtitle')} placeholder="Ej: Suplementos para llevar tu entrenamiento más lejos" maxLength={CONTENT_LIMITS.hero_subtitle} className="min-h-20 bg-white dark:bg-white/5" />
                {errors.hero_subtitle ? <FieldError>{errors.hero_subtitle.message}</FieldError> : null}
              </FieldBlock>
              <FieldBlock label="Texto superior (opcional)" current={supportText.length} max={CONTENT_LIMITS.support_text}>
                <Input {...register('support_text')} placeholder="Ej: Envíos a todo el país" maxLength={CONTENT_LIMITS.support_text} className="h-11 bg-white dark:bg-white/5" />
              </FieldBlock>
            </div>
          </Panel>

          <Panel title="Estilo del título" description="Elegí por cómo se ve, no por el nombre técnico de la fuente.">
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((option) => {
                const family = resolvePreviewFont(option.value, theme)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('hero_title_font', option.value, { shouldDirty: true })}
                    className={cn('rounded-[11px] border p-3 text-left transition active:scale-[0.99]', heroTitleFont === option.value ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}
                  >
                    <span className="block truncate text-lg leading-none text-foreground" style={{ fontFamily: family, fontWeight: option.value === 'plus-jakarta' ? 700 : 600 }}>Aa</span>
                    <span className="mt-2 block text-xs font-semibold text-foreground">{option.label}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{option.hint}</span>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel title="Tamaño del título" description="Tres niveles claros. VOLTA adapta el tamaño a cada pantalla.">
            <div className="grid grid-cols-3 gap-2">
              {SCALE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('hero_title_scale', option.value, { shouldDirty: true })}
                  className={cn('min-h-11 rounded-[10px] border px-2 text-xs font-semibold text-foreground', heroTitleScale === option.value ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <details className="group rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820]">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-foreground sm:px-5">
          Mensajes debajo de la portada
          <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-black/7 p-4 dark:border-white/8 sm:p-5">
          <p className="text-xs leading-5 text-muted-foreground">VOLTA los arma con los datos del negocio. Elegí si quedan fijos o en movimiento.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Choice selected={bannerMode === 'static'} onClick={() => setValue('banner_mode', 'static', { shouldDirty: true })}>Fijos</Choice>
            <Choice selected={bannerMode === 'animated'} onClick={() => setValue('banner_mode', 'animated', { shouldDirty: true })}>En movimiento</Choice>
          </div>
          {bannerMode === 'animated' ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {BANNER_SPEED_OPTIONS.map((option) => (
                <Choice key={option.value} selected={bannerSpeed === option.value} onClick={() => setValue('banner_speed', option.value, { shouldDirty: true })}>{option.label}</Choice>
              ))}
            </div>
          ) : null}
          <div className="mt-4 overflow-hidden rounded-[10px] border border-black/8 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            {bannerMode === 'animated' ? (
              <div className="store-marquee-track" style={{ ['--marquee-duration' as string]: activeSpeed.duration }}>
                <BannerPreviewGroup items={bannerPreviewItems} />
                <BannerPreviewGroup items={bannerPreviewItems} ariaHidden />
              </div>
            ) : <BannerPreviewGroup items={bannerPreviewItems} staticLayout />}
          </div>
        </div>
      </details>

      {submitError ? <FormFeedback kind="error" title="No pudimos guardar la portada" message={submitError} /> : null}
      {!submitError && saved ? <FormFeedback kind="success" title="Portada guardada" message="Tu tienda ya refleja los cambios." /> : null}
      <div className="flex justify-end"><SaveButton isLoading={isSubmitting} isSaved={saved} label="Guardar portada" /></div>
    </form>
  )
}

function HeroPreview({ content, theme, title, subtitle, supportText, layout, overlayOpacity, titleFont, titleScale, device }: {
  content: StoreContent
  theme: StoreTheme
  title: string
  subtitle: string
  supportText: string
  layout: HeroImageLayout
  overlayOpacity: number
  titleFont: HeroTitleFont
  titleScale: HeroTitleScale
  device: PreviewDevice
}) {
  const mobile = device === 'mobile'
  const hasImage = Boolean(content.hero_image_url)
  const background = layout === 'background' && hasImage
  const titleFamily = resolvePreviewFont(titleFont, theme)
  const titleSize = mobile
    ? titleScale === 'impact' ? '2rem' : titleScale === 'subtle' ? '1.25rem' : '1.6rem'
    : titleScale === 'impact' ? '3rem' : titleScale === 'subtle' ? '1.9rem' : '2.4rem'

  return (
    <div className={cn('mx-auto overflow-hidden rounded-[14px] border shadow-sm transition-all', mobile ? 'max-w-[290px]' : 'w-full')} style={{ borderColor: `${theme.text_color}20`, background: theme.background_color, color: theme.text_color }}>
      <div className={cn('relative overflow-hidden', mobile ? 'min-h-[390px]' : 'min-h-[300px]')}>
        {background ? (
          <>
            <img src={content.hero_image_url!} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${theme.background_color} ${Math.min(88, overlayOpacity + 12)}%, transparent), color-mix(in srgb, ${theme.background_color} ${Math.max(20, overlayOpacity - 8)}%, transparent))` }} />
          </>
        ) : null}

        <div className={cn('relative z-10', !background && hasImage && !mobile ? 'grid grid-cols-[.95fr_1.05fr]' : 'flex flex-col')}>
          <div className={cn('flex flex-col justify-center', mobile ? 'min-h-[245px] p-5' : 'min-h-[300px] p-7')}>
            {supportText ? <p className="mb-2 text-[7px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.secondary_color }}>{supportText}</p> : null}
            <p style={{ fontFamily: titleFamily, fontSize: titleSize, lineHeight: '.95', letterSpacing: titleFont === 'playfair' ? '-.03em' : '-.05em', fontWeight: titleFont === 'playfair' ? 600 : 700 }}>{title || storeFallback(title)}</p>
            <p className="mt-3 max-w-md text-[10px] leading-4 opacity-70">{subtitle}</p>
            <div className="mt-4 flex gap-2"><span className="rounded-md px-3 py-2 text-[8px] font-bold" style={{ background: theme.primary_color, color: theme.surface_color }}>Ver productos</span><span className="rounded-md border px-3 py-2 text-[8px] font-semibold" style={{ borderColor: `${theme.text_color}25` }}>WhatsApp</span></div>
          </div>
          {!background && hasImage ? <div className={cn('relative overflow-hidden', mobile ? 'min-h-[145px]' : 'min-h-[300px]')}><img src={content.hero_image_url!} alt="" className="absolute inset-0 size-full object-cover" /></div> : null}
        </div>
      </div>
    </div>
  )
}

function storeFallback(value: string) { return value || 'Tu tienda' }
function resolvePreviewFont(font: HeroTitleFont, theme: StoreTheme) {
  const key = font === 'inherit' ? theme.heading_font : font
  return FONT_FAMILY_MAP[key] ?? FONT_FAMILY_MAP['plus-jakarta']
}
function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="rounded-[14px] border border-black/8 bg-white p-3.5 dark:border-white/10 dark:bg-[#111820]"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{description ? <p className="mb-3 mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : <div className="mb-3" />}{children}</section> }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={cn('min-h-11 rounded-[10px] border px-2 text-sm font-medium text-foreground transition active:scale-[0.99]', selected ? 'border-[#12e89a] bg-emerald-50 dark:bg-emerald-400/10' : 'border-black/8 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]')}>{children}</button> }
function PreviewButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) { return <button type="button" onClick={onClick} aria-label={`Vista ${label}`} className={cn('flex size-8 items-center justify-center rounded-[7px] text-muted-foreground', active && 'bg-white text-foreground shadow-sm dark:bg-white/10')}>{children}</button> }
function FieldBlock({ label, current, max, children }: { label: string; current: number; max: number; children: React.ReactNode }) { return <div><div className="mb-2 flex items-center justify-between gap-3"><Label className="text-sm font-medium text-foreground">{label}</Label><CharCounter current={current} max={max} /></div>{children}</div> }
function FieldError({ children }: { children: React.ReactNode }) { return <p className="mt-1.5 text-xs text-red-500">{children}</p> }
function BannerPreviewGroup({ items, ariaHidden = false, staticLayout = false }: { items: string[]; ariaHidden?: boolean; staticLayout?: boolean }) { return <div aria-hidden={ariaHidden} className={cn('flex shrink-0 items-center gap-2', staticLayout ? 'flex-wrap justify-start' : 'pr-2')}>{items.map((item, index) => <span key={`${item}-${index}-${ariaHidden ? 'ghost' : 'main'}`} className="inline-flex whitespace-nowrap rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5">{item}</span>)}</div> }
function buildBannerPreviewItems(store: Store) { return [store.whatsapp ? 'Atención por WhatsApp' : 'Respuesta rápida', store.hours || null, store.address || null, store.instagram ? `@${store.instagram.replace(/^@/, '')}` : null].filter(Boolean) as string[] }
