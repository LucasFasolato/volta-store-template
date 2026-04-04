'use client'

import Image from 'next/image'
import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { cn } from '@/lib/utils'
import type { Store } from '@/types/store'

type StoreNavProps = {
  store: Store
  containerClass: string
}

export function StoreNav({ store, containerClass }: StoreNavProps) {
  const getItemCount = useCartStore((state) => state.getItemCount)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const count = getItemCount()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2"
        style={{
          backgroundColor: 'var(--store-text)',
          color: 'var(--store-bg)',
        }}
      >
        Ir al contenido
      </a>

      <nav
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          borderColor: 'var(--store-card-border)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 92%, white 8%), color-mix(in srgb, var(--store-bg) 82%, transparent))',
        }}
      >
        <div className={cn('mx-auto flex min-h-[5.25rem] items-center justify-between gap-4 px-4 py-3 sm:px-6', containerClass)}>
          <div className="flex min-w-0 items-center gap-3">
            {store.logo_url ? (
              <div
                className="relative size-12 overflow-hidden rounded-[calc(var(--store-radius)*0.78)] border"
                style={{
                  borderColor: 'var(--store-card-border)',
                  boxShadow: '0 12px 28px color-mix(in srgb, var(--store-text) 10%, transparent)',
                }}
              >
                <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex size-12 items-center justify-center rounded-[calc(var(--store-radius)*0.78)] text-sm font-black"
                style={{
                  background:
                    'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-accent) 56%, white 44%))',
                  color: 'var(--store-primary-contrast)',
                  boxShadow: '0 14px 34px color-mix(in srgb, var(--store-primary) 24%, transparent)',
                }}
              >
                {store.name.slice(0, 1)}
              </div>
            )}

            <div className="min-w-0">
              <p className="store-heading truncate text-base font-semibold sm:text-[1.1rem]" style={{ color: 'var(--store-text)' }}>
                {store.name}
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
                Catalogo oficial y checkout por WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#catalogo"
              className="hidden items-center gap-2 rounded-[var(--store-button-radius)] border px-4 py-2.5 text-sm font-medium transition sm:inline-flex"
              style={{
                borderColor: 'var(--store-card-border)',
                color: 'var(--store-text)',
                backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
              }}
            >
              Explorar catalogo
              <ArrowUpRight className="size-4" />
            </a>

            <button
              type="button"
              onClick={toggleCart}
              className="store-button relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                minHeight: 'var(--store-control-height)',
                background:
                  'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
                color: 'var(--store-primary-contrast)',
                boxShadow: '0 18px 38px color-mix(in srgb, var(--store-primary) 24%, transparent)',
              }}
              aria-label="Ver carrito"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:block">Carrito</span>
              <span
                className="inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--store-primary-contrast) 84%, transparent)',
                  color: 'var(--store-primary)',
                }}
              >
                {count}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
