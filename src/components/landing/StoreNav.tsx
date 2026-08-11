import Image from 'next/image'
import { StoreNavCartButton } from '@/components/landing/StoreNavCartButton'
import type { StorefrontDensityMode } from '@/components/landing/storefront-density'
import { cn } from '@/lib/utils'
import type { Store } from '@/types/store'

type StoreNavProps = {
  store: Store
  containerClass: string
  productCount: number
  densityMode: StorefrontDensityMode
}

export function StoreNav({ store, containerClass, productCount, densityMode }: StoreNavProps) {
  const compact = densityMode === 'small'

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">Ir al contenido</a>
      <nav className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-bg) 88%, transparent)' }}>
        <div className={cn('mx-auto flex items-center justify-between gap-4 px-4 sm:px-6', compact ? 'min-h-[4rem]' : 'min-h-[4.35rem]', containerClass)}>
          <a href="#main-content" className="flex min-w-0 items-center gap-2.5">
            {store.logo_url ? (
              <div className="relative size-9 shrink-0 overflow-hidden rounded-[10px] border" style={{ borderColor: 'var(--store-card-border)' }}>
                <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
              </div>
            ) : null}
            <span className="store-heading truncate text-[15px] font-semibold sm:text-base" style={{ color: 'var(--store-text)' }}>{store.name}</span>
          </a>

          <div className="flex items-center gap-4">
            <a href="#catalogo" className="hidden text-sm font-medium sm:inline" style={{ color: 'var(--store-soft-text)' }}>Productos</a>
            {store.whatsapp ? <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hidden text-sm font-medium md:inline" style={{ color: 'var(--store-soft-text)' }}>Contacto</a> : null}
            <StoreNavCartButton />
          </div>
        </div>
      </nav>
    </>
  )
}
