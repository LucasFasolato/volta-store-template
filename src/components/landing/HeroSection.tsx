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
  const whatsappHref = store.whatsapp ? `https://wa.me/${sanitizePhoneNumber(store.whatsapp)}` : '#catalogo'

  const supportItems = [
    store.address ? { icon: MapPin, label: store.address } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <section
      className="relative flex flex-col justify-end overflow-hidden"
      style={{
        minHeight: 'clamp(520px, 80vh, 900px)',
        background: content.hero_image_url
          ? undefined
          : 'radial-gradient(circle at top right, color-mix(in srgb, var(--store-accent) 14%, transparent), transparent 40%), radial-gradient(circle at left 60%, color-mix(in srgb, var(--store-secondary) 16%, transparent), transparent 36%), var(--store-bg)',
      }}
    >
      {/* Full-bleed background image */}
      {content.hero_image_url ? (
        <>
          <div className="absolute inset-0">
            <Image
              src={content.hero_image_url}
              alt={content.hero_title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Dark gradient overlay for legibility — bottom-heavy */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 92%, transparent) 0%, color-mix(in srgb, var(--store-bg) 60%, transparent) 40%, color-mix(in srgb, var(--store-bg) 28%, transparent) 70%, transparent 100%)',
            }}
          />
          {/* Subtle side vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, color-mix(in srgb, var(--store-bg) 30%, transparent) 0%, transparent 40%)',
            }}
          />
        </>
      ) : null}

      {/* Content: contained, pinned to bottom */}
      <div className={cn('relative z-10 mx-auto w-full px-4 pb-14 pt-20 sm:px-6 sm:pb-16 sm:pt-24', containerClass)}>
        <div className="grid gap-10 xl:grid-cols-[1.4fr_0.6fr] xl:items-end">
          {/* Main copy */}
          <div>
            {content.support_text ? (
              <p
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
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
                fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#catalogo"
                className="store-button inline-flex items-center justify-center px-7 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:opacity-95"
                style={{
                  background:
                    'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 78%, black 22%))',
                  color: 'var(--store-primary-contrast)',
                  boxShadow: '0 16px 40px color-mix(in srgb, var(--store-primary) 24%, transparent)',
                }}
              >
                Ver catálogo
                <ArrowUpRight className="ml-2 size-4" />
              </a>

              <a
                href={whatsappHref}
                target={store.whatsapp ? '_blank' : undefined}
                rel={store.whatsapp ? 'noreferrer noopener' : undefined}
                className="store-button inline-flex items-center justify-center border px-7 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--store-border-strong)',
                  color: 'var(--store-text)',
                  backgroundColor: 'color-mix(in srgb, var(--store-surface) 60%, transparent)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <MessageCircle className="mr-2 size-4" />
                {store.whatsapp ? 'Hablar por WhatsApp' : 'Explorar productos'}
              </a>
            </div>
          </div>

          {/* Trust card — desktop only */}
          {supportItems.length > 0 ? (
            <div className="hidden xl:block">
              <div
                className="store-card p-5"
                style={{
                  background: 'color-mix(in srgb, var(--store-surface) 55%, transparent)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid color-mix(in srgb, var(--store-border) 80%, transparent)',
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
                  Info útil
                </p>
                <div className="mt-4 space-y-4">
                  {supportItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-start gap-3">
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--store-accent) 14%, transparent)' }}
                        >
                          <Icon className="size-4" style={{ color: 'var(--store-accent)' }} />
                        </div>
                        <p className="text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                          {item.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
