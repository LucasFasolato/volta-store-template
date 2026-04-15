import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { StoreNavCartButton } from '@/components/landing/StoreNavCartButton'
import { cn } from '@/lib/utils'
import type { Store } from '@/types/store'

type StoreNavProps = {
  store: Store
  containerClass: string
}

export function StoreNav({ store, containerClass }: StoreNavProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2"
        style={{ backgroundColor: 'var(--store-text)', color: 'var(--store-bg)' }}
      >
        Ir al contenido
      </a>

      <nav
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          borderColor: 'var(--store-card-border)',
          background: 'var(--store-nav-bg)',
        }}
      >
        <div
          className={cn(
            'mx-auto flex min-h-[4.75rem] items-center justify-between gap-4 px-4 py-3 sm:px-6',
            containerClass,
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {store.logo_url ? (
              <div
                className="relative size-10 shrink-0 overflow-hidden rounded-[calc(var(--store-radius)*0.78)] border"
                style={{
                  borderColor: 'var(--store-card-border)',
                  boxShadow: '0 8px 24px color-mix(in srgb, var(--store-text) 8%, transparent)',
                }}
              >
                <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-[calc(var(--store-radius)*0.78)] text-sm font-black"
                style={{
                  background:
                    'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-accent) 56%, white 44%))',
                  color: 'var(--store-primary-contrast)',
                  boxShadow: '0 12px 30px color-mix(in srgb, var(--store-primary) 22%, transparent)',
                }}
              >
                {store.name.slice(0, 1)}
              </div>
            )}

            <div className="min-w-0">
              <p
                className="store-heading truncate text-[15px] font-semibold sm:text-base"
                style={{ color: 'var(--store-text)' }}
              >
                {store.name}
              </p>
              <p
                className="mt-0.5 hidden truncate text-[10px] font-semibold uppercase tracking-[0.2em] sm:block"
                style={{ color: 'var(--store-muted-text)' }}
              >
                Catalogo y checkout por WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#catalogo"
              className="hidden items-center gap-2 rounded-[var(--store-button-radius)] border px-4 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 sm:inline-flex"
              style={{
                borderColor: 'var(--store-card-border)',
                color: 'var(--store-text)',
                backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
              }}
            >
              Ver catalogo
              <ArrowUpRight className="size-3.5" />
            </a>

            <StoreNavCartButton />
          </div>
        </div>
      </nav>
    </>
  )
}
