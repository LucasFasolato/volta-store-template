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

      <nav className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
        <div
          className={cn(
            'mx-auto flex h-[4.75rem] items-center justify-between gap-4 rounded-[calc(var(--store-radius)+14px)] border px-4 sm:px-5',
            containerClass,
          )}
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 82%, white 18%), color-mix(in srgb, var(--store-surface) 88%, transparent))',
            borderColor: 'var(--store-card-border)',
            boxShadow: 'var(--store-card-shadow)',
            backdropFilter: 'blur(calc(var(--store-card-blur) + 8px))',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            {store.logo_url ? (
              <div
                className="relative size-12 overflow-hidden rounded-[calc(var(--store-radius)*0.9)] border"
                style={{
                  borderColor: 'var(--store-card-border)',
                  boxShadow: '0 10px 24px color-mix(in srgb, var(--store-text) 10%, transparent)',
                }}
              >
                <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex size-12 items-center justify-center rounded-[calc(var(--store-radius)*0.9)] text-sm font-black"
                style={{
                  background:
                    'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-accent) 56%, white 44%))',
                  color: 'var(--store-bg)',
                  boxShadow: '0 14px 34px color-mix(in srgb, var(--store-primary) 26%, transparent)',
                }}
              >
                {store.name.slice(0, 1)}
              </div>
            )}

            <div className="min-w-0">
              <p className="store-heading truncate text-base font-semibold sm:text-[1.05rem]" style={{ color: 'var(--store-text)' }}>
                {store.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--store-secondary)',
                    boxShadow: '0 0 0 4px color-mix(in srgb, var(--store-secondary) 16%, transparent)',
                  }}
                />
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--store-muted-text)' }}>
                  Checkout directo por WhatsApp
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#catalogo"
              className="hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition sm:inline-flex"
              style={{
                borderColor: 'var(--store-card-border)',
                color: 'var(--store-soft-text)',
                backgroundColor: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
              }}
            >
              Explorar
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
                color: 'var(--store-bg)',
                boxShadow: '0 18px 38px color-mix(in srgb, var(--store-primary) 24%, transparent)',
              }}
              aria-label="Ver carrito"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:block">Carrito</span>
              <span
                className="inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--store-bg) 16%, white 84%)',
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
