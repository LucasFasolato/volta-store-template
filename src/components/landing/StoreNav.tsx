'use client'

import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-black focus:px-4 focus:py-2 focus:text-white"
      >
        Ir al contenido
      </a>

      <nav
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--store-bg) 82%, white 18%)',
          borderColor: 'var(--store-border)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className={cn('mx-auto flex h-[4.5rem] items-center justify-between gap-4 px-4 sm:px-6', containerClass)}>
          <div className="flex min-w-0 items-center gap-3">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={44}
                height={44}
                className="size-11 rounded-2xl object-cover"
              />
            ) : (
              <div
                className="flex size-11 items-center justify-center rounded-2xl text-sm font-bold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--store-primary) 10%, transparent)',
                  color: 'var(--store-primary)',
                }}
              >
                {store.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight" style={{ color: 'var(--store-text)' }}>
                {store.name}
              </p>
              <p className="truncate text-xs" style={{ color: 'color-mix(in srgb, var(--store-text) 55%, transparent)' }}>
                Catalogo directo por WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleCart}
            className="relative inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition hover:opacity-95 active:scale-[0.98]"
            style={{
              background:
                'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 74%, black 26%))',
              color: 'var(--store-bg)',
              boxShadow: 'var(--store-shadow)',
            }}
            aria-label="Ver carrito"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:block">Carrito</span>
            {count > 0 ? (
              <span
                className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: 'var(--store-secondary)',
                  color: 'color-mix(in srgb, var(--store-text) 80%, black 20%)',
                }}
              >
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </nav>
    </>
  )
}
