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
    <section className="relative" style={{ paddingTop: 'calc(var(--store-space-section) * 0.25)' }}>
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div
          className="relative overflow-hidden rounded-[calc(var(--store-card-radius)_*_1.15)]"
          style={{
            padding: 'clamp(1.5rem, 2vw, 2rem)',
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--store-surface) 92%, transparent), color-mix(in srgb, var(--store-bg) 88%, var(--store-text) 12%))',
            boxShadow: 'var(--store-shadow)',
            border: '1px solid var(--store-border)',
          }}
        >
          {content.hero_image_url ? (
            <>
              <div className="absolute inset-0">
                <Image src={content.hero_image_url} alt={content.hero_title} fill className="object-cover" priority />
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(104deg, color-mix(in srgb, var(--store-bg) 94%, transparent) 4%, color-mix(in srgb, var(--store-bg) 76%, transparent) 42%, color-mix(in srgb, var(--store-bg) 96%, transparent) 100%)',
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at top right, color-mix(in srgb, var(--store-accent) 14%, transparent), transparent 32%), radial-gradient(circle at left center, color-mix(in srgb, var(--store-secondary) 16%, transparent), transparent 30%)',
              }}
            />
          )}

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div className="max-w-3xl px-2 py-4 sm:px-4 sm:py-8">
              {content.support_text ? (
                <p
                  className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    color: 'var(--store-secondary)',
                    backgroundColor: 'color-mix(in srgb, var(--store-secondary) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--store-secondary) 16%, transparent)',
                  }}
                >
                  <Sparkles className="size-3" />
                  {content.support_text}
                </p>
              ) : null}

              <h1
                className="store-display max-w-4xl text-balance"
                style={{
                  color: 'var(--store-text)',
                  fontSize: 'clamp(3rem, 7vw, 6.4rem)',
                  transform: 'scale(var(--store-heading-scale))',
                  transformOrigin: 'left top',
                }}
              >
                {content.hero_title}
              </h1>

              <p
                className="mt-6 max-w-2xl text-base leading-8 sm:text-lg"
                style={{
                  color: 'var(--store-soft-text)',
                  fontSize: 'calc(1rem * var(--store-body-scale))',
                }}
              >
                {content.hero_subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#catalogo"
                  className="store-button inline-flex items-center justify-center px-6 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:opacity-95"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 78%, black 22%))',
                    color: 'var(--store-primary-contrast)',
                    boxShadow: '0 16px 36px color-mix(in srgb, var(--store-primary) 20%, transparent)',
                  }}
                >
                  Ver catalogo
                  <ArrowUpRight className="ml-2 size-4" />
                </a>

                <a
                  href={whatsappHref}
                  target={store.whatsapp ? '_blank' : undefined}
                  rel={store.whatsapp ? 'noreferrer noopener' : undefined}
                  className="store-button inline-flex items-center justify-center border px-6 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: 'var(--store-border-strong)',
                    color: 'var(--store-text)',
                    backgroundColor: 'color-mix(in srgb, var(--store-surface) 74%, transparent)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  <MessageCircle className="mr-2 size-4" />
                  {store.whatsapp ? 'Hablar por WhatsApp' : 'Explorar productos'}
                </a>
              </div>
            </div>

            <div className="hidden xl:block">
              <div
                className="store-card p-6"
                style={{
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 80%, transparent), color-mix(in srgb, var(--store-bg) 80%, transparent))',
                }}
              >
                <p className="admin-label" style={{ color: 'var(--store-muted-text)' }}>
                  Direct checkout
                </p>
                <h2 className="store-heading mt-4 text-[1.45rem]" style={{ color: 'var(--store-text)' }}>
                  Disenada para convertir sin friccion
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: 'var(--store-soft-text)' }}>
                  El cliente navega, arma el pedido y llega a WhatsApp con un mensaje impecable y listo para cerrar.
                </p>

                <div className="mt-6 space-y-4">
                  {supportItems.length > 0 ? (
                    supportItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className="flex items-start gap-3">
                          <div
                            className="flex size-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--store-accent) 12%, transparent)' }}
                          >
                            <Icon className="size-4" style={{ color: 'var(--store-accent)' }} />
                          </div>
                          <p className="text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                            {item.label}
                          </p>
                        </div>
                      )
                    })
                  ) : (
                    <div
                      className="rounded-[calc(var(--store-card-radius)_*_0.7)] border border-dashed p-4"
                      style={{ borderColor: 'var(--store-border)' }}
                    >
                      <p className="text-sm leading-7" style={{ color: 'var(--store-soft-text)' }}>
                        Configura horarios, direccion o redes desde el admin para reforzar confianza desde el primer scroll.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
