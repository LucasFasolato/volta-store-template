import Image from 'next/image'
import { ArrowUpRight, Clock3, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store, StoreContent } from '@/types/store'

type HeroSectionProps = {
  content: StoreContent
  store: Store
  containerClass: string
}

export function HeroSection({ content, store, containerClass }: HeroSectionProps) {
  const whatsappHref = store.whatsapp
    ? `https://wa.me/${sanitizePhoneNumber(store.whatsapp)}`
    : '#catalogo'

  const hasImage = !!content.hero_image_url

  const trustChips = [
    store.whatsapp ? { icon: MessageCircle, label: 'WhatsApp directo', accent: true } : null,
    store.address ? { icon: MapPin, label: store.address } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; accent?: boolean }>

  return (
    <section
      className={cn(
        'relative flex flex-col overflow-hidden',
        hasImage ? 'justify-end' : 'justify-center',
      )}
      style={{
        minHeight: 'var(--store-hero-height)',
        background: hasImage
          ? undefined
          : [
              'radial-gradient(ellipse at 12% 28%, color-mix(in srgb, var(--store-primary) 16%, transparent), transparent 48%)',
              'radial-gradient(ellipse at 88% 72%, color-mix(in srgb, var(--store-accent) 14%, transparent), transparent 44%)',
              'radial-gradient(ellipse at 52% 50%, color-mix(in srgb, var(--store-secondary) 10%, transparent), transparent 56%)',
              'var(--store-bg-gradient)',
            ].join(', '),
      }}
    >
      {/* Background image */}
      {hasImage ? (
        <>
          <div className="absolute inset-0">
            <Image
              src={content.hero_image_url!}
              alt={content.hero_title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Bottom-heavy gradient — readable text over any image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 96%, transparent) 0%, color-mix(in srgb, var(--store-bg) 68%, transparent) 36%, color-mix(in srgb, var(--store-bg) 22%, transparent) 64%, transparent 100%)',
            }}
          />
          {/* Side vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, color-mix(in srgb, var(--store-bg) 28%, transparent) 0%, transparent 44%)',
            }}
          />
        </>
      ) : (
        /* Decorative grid lines for no-image state */
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(var(--store-text) 1px, transparent 1px), linear-gradient(90deg, var(--store-text) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      )}

      {/* Content */}
      <div
        className={cn(
          'relative z-10 mx-auto w-full px-4 sm:px-6',
          containerClass,
          hasImage
            ? 'pb-14 pt-20 sm:pb-16 sm:pt-24'
            : 'py-20 sm:py-24',
        )}
      >
        <div className={cn('grid gap-10', hasImage ? 'xl:grid-cols-[1.4fr_0.6fr] xl:items-end' : 'max-w-4xl')}>
          {/* Main copy */}
          <div>
            {content.support_text ? (
              <p
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
                style={{
                  color: 'var(--store-secondary)',
                  backgroundColor: 'color-mix(in srgb, var(--store-secondary) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--store-secondary) 18%, transparent)',
                }}
              >
                <Sparkles className="size-3" />
                {content.support_text}
              </p>
            ) : null}

            <h1
              className="store-display max-w-3xl text-balance"
              style={{
                color: 'var(--store-text)',
                fontSize: 'clamp(2.6rem, 6.5vw, 6rem)',
                lineHeight: '1.06',
                letterSpacing: '-0.03em',
              }}
            >
              {content.hero_title}
            </h1>

            <p
              className="mt-5 max-w-xl leading-8"
              style={{
                color: 'var(--store-soft-text)',
                fontSize: 'calc(1.05rem * var(--store-body-scale))',
              }}
            >
              {content.hero_subtitle}
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#catalogo"
                className="store-button inline-flex items-center justify-center px-8 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:opacity-95"
                style={{
                  background:
                    'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 78%, black 22%))',
                  color: 'var(--store-primary-contrast)',
                  boxShadow: '0 18px 44px color-mix(in srgb, var(--store-primary) 26%, transparent)',
                }}
              >
                Ver catálogo
                <ArrowUpRight className="ml-2 size-4" />
              </a>

              {store.whatsapp ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="store-button inline-flex items-center justify-center gap-2 px-8 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #1db954)',
                    color: '#ffffff',
                    boxShadow: '0 16px 40px rgba(37, 211, 102, 0.2)',
                  }}
                >
                  <MessageCircle className="size-4" />
                  Hablar por WhatsApp
                </a>
              ) : (
                <a
                  href="#catalogo"
                  className="store-button inline-flex items-center justify-center border px-8 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: 'var(--store-border-strong)',
                    color: 'var(--store-text)',
                    backgroundColor: 'color-mix(in srgb, var(--store-surface) 60%, transparent)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <ArrowUpRight className="mr-2 size-4" />
                  Explorar productos
                </a>
              )}
            </div>

            {/* Trust chips — mobile and desktop */}
            {trustChips.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {trustChips.map((chip) => {
                  const Icon = chip.icon
                  return (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--store-surface) 58%, transparent)',
                        color: chip.accent ? '#25D366' : 'var(--store-soft-text)',
                        border: '1px solid var(--store-card-border)',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {chip.label}
                    </span>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Right card — desktop only, image mode only */}
          {hasImage && trustChips.length === 0 ? (
            <div className="hidden xl:block">
              <div
                className="store-card p-5"
                style={{
                  background: 'color-mix(in srgb, var(--store-surface) 55%, transparent)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
                  Info útil
                </p>
                <div className="mt-4 space-y-4 text-sm" style={{ color: 'var(--store-soft-text)' }}>
                  {store.address ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-accent)' }} />
                      {store.address}
                    </div>
                  ) : null}
                  {store.hours ? (
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-accent)' }} />
                      {store.hours}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
