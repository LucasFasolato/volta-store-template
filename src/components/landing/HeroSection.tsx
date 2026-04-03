import Image from 'next/image'
import { ArrowDownRight, MapPin, MessageCircle, Clock3 } from 'lucide-react'
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

  const metaItems = [
    store.address
      ? { icon: MapPin, label: store.address }
      : null,
    store.hours
      ? { icon: Clock3, label: store.hours }
      : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-8">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div
          className="relative overflow-hidden rounded-[34px] border px-6 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
          style={{
            borderColor: 'var(--store-border)',
            background:
              content.hero_image_url
                ? 'linear-gradient(135deg, color-mix(in srgb, var(--store-bg) 18%, transparent), color-mix(in srgb, var(--store-bg) 88%, transparent))'
                : 'linear-gradient(135deg, color-mix(in srgb, var(--store-bg) 86%, white 14%), color-mix(in srgb, var(--store-bg) 94%, var(--store-text) 6%))',
            boxShadow: 'var(--store-shadow)',
          }}
        >
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
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, color-mix(in srgb, var(--store-bg) 88%, transparent) 0%, color-mix(in srgb, var(--store-bg) 72%, transparent) 42%, color-mix(in srgb, var(--store-bg) 94%, transparent) 100%)',
                }}
              />
            </>
          ) : null}

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-2xl">
              {content.support_text ? (
                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.24em]"
                  style={{ color: 'var(--store-secondary)' }}
                >
                  {content.support_text}
                </p>
              ) : null}

              <h1
                className="max-w-3xl font-semibold leading-[0.95] tracking-[-0.04em]"
                style={{
                  color: 'var(--store-text)',
                  fontSize: 'clamp(2.7rem, 8vw, 5.5rem)',
                }}
              >
                {content.hero_title}
              </h1>

              <p
                className="mt-5 max-w-xl text-base leading-7 sm:text-lg"
                style={{ color: 'color-mix(in srgb, var(--store-text) 78%, transparent)' }}
              >
                {content.hero_subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#catalogo"
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-95 active:scale-[0.98]"
                  style={{
                    background:
                      'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 72%, black 28%))',
                    color: 'var(--store-bg)',
                  }}
                >
                  Ver catalogo
                  <ArrowDownRight className="ml-2 size-4" />
                </a>

                <a
                  href={whatsappHref}
                  target={store.whatsapp ? '_blank' : undefined}
                  rel={store.whatsapp ? 'noreferrer noopener' : undefined}
                  className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium transition hover:bg-white/8"
                  style={{
                    borderColor: 'var(--store-border-strong)',
                    color: 'var(--store-text)',
                    backgroundColor: 'color-mix(in srgb, var(--store-bg) 72%, transparent)',
                  }}
                >
                  <MessageCircle className="mr-2 size-4" />
                  {store.whatsapp ? 'Hablar por WhatsApp' : 'Explorar productos'}
                </a>
              </div>
            </div>

            <div
              className="rounded-[28px] border p-5 backdrop-blur-xl"
              style={{
                borderColor: 'var(--store-border)',
                backgroundColor: 'color-mix(in srgb, var(--store-bg) 78%, transparent)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'color-mix(in srgb, var(--store-text) 55%, transparent)' }}>
                Compra directa
              </p>
              <p className="mt-3 text-lg font-semibold" style={{ color: 'var(--store-text)' }}>
                Elegi productos, arma tu pedido y confirmalo en un solo mensaje.
              </p>

              <div className="mt-5 space-y-3">
                {metaItems.length > 0 ? (
                  metaItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex size-9 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)' }}
                        >
                          <Icon className="size-4" style={{ color: 'var(--store-primary)' }} />
                        </div>
                        <p className="text-sm leading-6" style={{ color: 'color-mix(in srgb, var(--store-text) 75%, transparent)' }}>
                          {item.label}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[22px] border border-dashed p-4" style={{ borderColor: 'var(--store-border)' }}>
                    <p className="text-sm leading-6" style={{ color: 'color-mix(in srgb, var(--store-text) 68%, transparent)' }}>
                      Personaliza direccion, horarios o redes desde el panel para reforzar confianza y conversion.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
