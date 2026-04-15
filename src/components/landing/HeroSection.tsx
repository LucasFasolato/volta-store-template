import Image from 'next/image'
import { ArrowUpRight, Clock3, MapPin, MessageCircle, Package, Rows3, Sparkles } from 'lucide-react'
import type { StorefrontDensityMode } from '@/components/landing/storefront-density'
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
  categoryCount,
  featuredCount,
  densityMode,
}: HeroSectionProps) {
  const whatsappHref = store.whatsapp ? `https://wa.me/${sanitizePhoneNumber(store.whatsapp)}` : '#catalogo'
  const hasImage = !!content.hero_image_url
  const isSmallCatalog = densityMode === 'small'
  const primaryCtaLabel = productCount > 0 ? 'Explorar productos' : 'Ver catalogo'

  const trustChips = [
    {
      icon: Package,
      label: `${productCount} ${productCount === 1 ? 'producto listo para pedir' : 'productos listos para pedir'}`,
    },
    categoryCount > 1 ? { icon: Rows3, label: `${categoryCount} categorias` } : null,
    featuredCount > 0 ? { icon: Sparkles, label: `${featuredCount} destacados` } : null,
    store.address ? { icon: MapPin, label: store.address } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
  ]
    .filter(Boolean)
    .slice(0, isSmallCatalog ? 3 : 5) as Array<{ icon: React.ElementType; label: string }>

  return (
    <section
      className={cn('relative flex flex-col overflow-hidden', hasImage ? 'justify-end' : 'justify-center')}
      style={{
        minHeight: isSmallCatalog ? 'clamp(22rem, 68vh, 32rem)' : 'var(--store-hero-height)',
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
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--store-bg) 97%, transparent) 0%, color-mix(in srgb, var(--store-bg) 72%, transparent) 38%, color-mix(in srgb, var(--store-bg) 28%, transparent) 62%, transparent 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(var(--store-text) 1px, transparent 1px), linear-gradient(90deg, var(--store-text) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute h-[500px] w-[500px] rounded-full"
              style={{ border: '1px solid color-mix(in srgb, var(--store-primary) 14%, transparent)' }}
            />
            <div
              className="absolute h-[720px] w-[720px] rounded-full"
              style={{ border: '1px solid color-mix(in srgb, var(--store-primary) 8%, transparent)' }}
            />
            <div
              className="absolute h-[960px] w-[960px] rounded-full"
              style={{ border: '1px solid color-mix(in srgb, var(--store-accent) 6%, transparent)' }}
            />
          </div>
        </>
      )}

      <div
        className={cn(
          'relative z-10 mx-auto w-full px-4 sm:px-6',
          containerClass,
          hasImage
            ? isSmallCatalog
              ? 'pb-10 pt-16 sm:pb-12 sm:pt-20'
              : 'pb-14 pt-20 sm:pb-20 sm:pt-24'
            : isSmallCatalog
              ? 'py-14 sm:py-16'
              : 'py-20 sm:py-28',
        )}
      >
        <div className={cn('max-w-4xl', isSmallCatalog ? 'max-w-3xl' : '')}>
          {content.support_text ? (
            <span
              className="inline-flex rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--store-surface) 58%, transparent)',
                color: 'var(--store-secondary)',
                border: '1px solid var(--store-card-border)',
                backdropFilter: 'blur(14px)',
              }}
            >
              {content.support_text}
            </span>
          ) : null}

          <h1
            className="store-display max-w-3xl text-balance"
            style={{
              color: 'var(--store-text)',
              fontSize: isSmallCatalog ? 'clamp(2.2rem, 6vw, 4.4rem)' : 'clamp(2.6rem, 6.5vw, 6rem)',
              lineHeight: '1.06',
              letterSpacing: '-0.03em',
              marginTop: content.support_text ? (isSmallCatalog ? '1rem' : '1.25rem') : undefined,
            }}
          >
            {content.hero_title}
          </h1>

          <p
            className="mt-5 max-w-2xl leading-8"
            style={{
              color: 'var(--store-soft-text)',
              fontSize: isSmallCatalog ? 'calc(0.98rem * var(--store-body-scale))' : 'calc(1.05rem * var(--store-body-scale))',
            }}
          >
            {content.hero_subtitle}
          </p>

          <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', isSmallCatalog ? 'mt-6' : 'mt-8')}>
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
              {primaryCtaLabel}
              <ArrowUpRight className="ml-2 size-4" />
            </a>

            {store.whatsapp ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="store-button inline-flex items-center justify-center gap-2 border px-8 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: 'color-mix(in srgb, #25D366 26%, var(--store-card-border))',
                  backgroundColor: 'color-mix(in srgb, var(--store-surface) 66%, transparent)',
                  color: 'var(--store-text)',
                  boxShadow: '0 16px 40px color-mix(in srgb, var(--store-primary) 10%, transparent)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <MessageCircle className="size-4" />
                Comprar por WhatsApp
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

          <p className={cn('max-w-2xl text-sm leading-6', isSmallCatalog ? 'mt-3' : 'mt-4')} style={{ color: 'var(--store-soft-text)' }}>
            {store.whatsapp
              ? 'Explora el catalogo, agrega al carrito y envia el pedido por WhatsApp cuando estes listo.'
              : 'Explora el catalogo y usa los datos visibles del negocio para consultar disponibilidad.'}
          </p>

          {trustChips.length > 0 ? (
            <div className={cn('flex flex-wrap gap-2', isSmallCatalog ? 'mt-5' : 'mt-7')}>
              {trustChips.map((chip) => {
                const Icon = chip.icon
                return (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--store-surface) 58%, transparent)',
                      color: 'var(--store-soft-text)',
                      border: '1px solid var(--store-card-border)',
                      backdropFilter: 'blur(14px)',
                    }}
                  >
                    <Icon className="size-3.5 shrink-0" style={{ color: 'var(--store-primary)' }} />
                    {chip.label}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
