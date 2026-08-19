import Image from 'next/image'
import { ArrowDownRight, MessageCircle } from 'lucide-react'
import type { StorefrontDensityMode } from '@/components/landing/storefront-density'
import { FONT_FAMILY_MAP } from '@/data/defaults'
import { cn } from '@/lib/utils'
import { sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store, StoreContent } from '@/types/store'

type HeroSectionProps = {
  content: StoreContent
  store: Store
  containerClass: string
  productCount: number
  categoryCount: number
  featuredCount: number
  densityMode: StorefrontDensityMode
}

export function HeroSection({
  content,
  store,
  containerClass,
  productCount,
  densityMode,
}: HeroSectionProps) {
  const whatsappHref = store.whatsapp ? `https://wa.me/${sanitizePhoneNumber(store.whatsapp)}` : '#catalogo'
  const hasImage = !!content.hero_image_url
  const compact = densityMode === 'small'
  const backgroundMode = hasImage && content.hero_image_layout === 'background'
  const overlayOpacity = Math.min(80, Math.max(20, content.hero_overlay_opacity ?? 55))
  const titleScale = content.hero_title_scale ?? 'balanced'
  const titleFont = content.hero_title_font ?? 'inherit'
  const titleFontFamily = titleFont === 'inherit'
    ? 'var(--store-font-heading)'
    : (FONT_FAMILY_MAP[titleFont] ?? 'var(--store-font-heading)')
  const titleSize = getHeroTitleSize(titleScale, compact)

  return (
    <section
      id="main-content"
      className={cn('relative overflow-hidden border-b', backgroundMode && (compact ? 'min-h-[560px]' : 'min-h-[620px]'))}
      style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-bg-gradient)' }}
    >
      {backgroundMode ? (
        <>
          <Image src={content.hero_image_url!} alt={content.hero_title} fill className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, color-mix(in srgb, var(--store-bg) ${Math.min(86, overlayOpacity + 12)}%, transparent) 0%, color-mix(in srgb, var(--store-bg) ${overlayOpacity}%, transparent) 52%, color-mix(in srgb, var(--store-bg) ${Math.max(20, overlayOpacity - 12)}%, transparent) 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 45%, transparent), transparent 48%)' }}
          />
        </>
      ) : null}

      <div
        className={cn(
          'relative z-10 mx-auto items-stretch px-4 sm:px-6',
          containerClass,
          !backgroundMode && hasImage ? 'grid lg:grid-cols-[minmax(0,.95fr)_minmax(380px,1.05fr)]' : '',
        )}
      >
        <div
          className={cn(
            'flex flex-col justify-center py-14 sm:py-20 lg:py-24',
            !backgroundMode && hasImage && 'lg:pr-12 xl:pr-16',
            compact && 'sm:py-16 lg:py-18',
            backgroundMode && 'min-h-[560px] max-w-4xl py-20 sm:min-h-[620px] sm:py-24 lg:py-28',
          )}
        >
          {content.support_text ? (
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--store-secondary)' }}>{content.support_text}</p>
          ) : null}

          <h1
            className="store-display max-w-4xl text-balance"
            style={{
              color: 'var(--store-text)',
              fontFamily: titleFontFamily,
              fontWeight: 'var(--store-heading-weight)',
              fontSize: titleSize,
              lineHeight: titleScale === 'impact' ? '.92' : '.98',
              letterSpacing: titleFont === 'playfair' ? '-.035em' : '-.055em',
            }}
          >
            {content.hero_title}
          </h1>

          <p className="mt-5 max-w-xl text-balance leading-7 sm:text-[1.05rem] sm:leading-8" style={{ color: 'var(--store-soft-text)' }}>{content.hero_subtitle}</p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <a href="#catalogo" className="store-button inline-flex items-center justify-center gap-2 px-6 text-sm font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}>
              Ver productos
              <ArrowDownRight className="size-4" />
            </a>
            {store.whatsapp ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer noopener" className="store-button inline-flex items-center justify-center gap-2 border px-6 text-sm font-semibold transition hover:-translate-y-0.5" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)', backgroundColor: 'color-mix(in srgb, var(--store-surface) 90%, transparent)' }}>
                <MessageCircle className="size-4" />
                Consultar por WhatsApp
              </a>
            ) : null}
          </div>

          {productCount > 0 ? <p className="mt-5 text-xs" style={{ color: 'var(--store-muted-text)' }}>{productCount} {productCount === 1 ? 'producto disponible' : 'productos disponibles'} · Armá tu pedido y continuá por WhatsApp.</p> : null}
        </div>

        {!backgroundMode && hasImage ? (
          <div className="relative -mx-4 min-h-[320px] overflow-hidden sm:-mx-6 sm:min-h-[440px] lg:mx-0 lg:min-h-[560px]">
            <Image src={content.hero_image_url!} alt={content.hero_title} fill className="object-cover" priority />
            <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(to bottom, transparent 70%, color-mix(in srgb, var(--store-bg) 20%, transparent))' }} />
          </div>
        ) : null}
      </div>
    </section>
  )
}

function getHeroTitleSize(scale: StoreContent['hero_title_scale'], compact: boolean) {
  if (scale === 'subtle') return compact ? 'clamp(2rem, 5.2vw, 3.6rem)' : 'clamp(2.25rem, 5.6vw, 4.4rem)'
  if (scale === 'impact') return compact ? 'clamp(2.65rem, 7.2vw, 5.25rem)' : 'clamp(3rem, 7.8vw, 6.8rem)'
  return compact ? 'clamp(2.35rem, 6vw, 4.5rem)' : 'clamp(2.7rem, 6.7vw, 5.8rem)'
}
