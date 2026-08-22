'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { PackageX, X } from 'lucide-react'
import { RelatedProductsStrip, type RelatedProductLink } from '@/components/product/RelatedProductsStrip'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

export function SoldOutProductModal({
  product,
  relatedProducts,
  onSelectRelated,
  onClose,
}: {
  product: ProductWithImages
  relatedProducts: RelatedProductLink[]
  onSelectRelated: (href: string) => void
  onClose: () => void
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const image = product.images?.[0]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sold-out-title"
      >
        <button
          type="button"
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Cerrar detalle"
          style={{ background: 'color-mix(in srgb, var(--store-bg) 26%, black 74%)', backdropFilter: 'blur(18px)' }}
        />
        <motion.div
          initial={{ y: 48, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 48, opacity: 0, scale: 0.99 }}
          className="sold-out-commerce-modal store-contrast-surface relative w-full overflow-hidden rounded-t-[calc(var(--store-card-radius)+12px)] sm:max-w-3xl sm:rounded-[calc(var(--store-card-radius)+12px)]"
          style={{
            height: 'fit-content',
            maxHeight: 'calc(100dvh - max(10px, env(safe-area-inset-top)))',
            color: 'var(--store-text)',
            background: 'color-mix(in srgb, var(--store-surface) 94%, var(--store-bg) 6%)',
            border: '1px solid var(--store-card-border)',
            boxShadow: '0 30px 90px color-mix(in srgb, var(--store-bg) 56%, transparent)',
          }}
        >
          <div className="max-h-[calc(100dvh-10px)] overflow-y-auto overscroll-contain sm:max-h-[90dvh]">
            <div className="flex justify-center pb-2 pt-2.5 sm:hidden">
              <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: 'var(--store-border-strong)' }} />
            </div>
            <div className="grid sm:grid-cols-[0.92fr_1.08fr] sm:items-start">
              <div className="relative mx-3 aspect-[4/3] overflow-hidden sm:m-0 sm:aspect-auto sm:min-h-[28rem]" style={{ borderRadius: 'calc(var(--store-card-radius)*0.9)', background: 'color-mix(in srgb, var(--store-surface) 88%, var(--store-bg))' }}>
                {image ? (
                  <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover opacity-75 grayscale-[0.25]" sizes="(max-width: 639px) 100vw, 42vw" />
                ) : (
                  <div className="flex h-full items-center justify-center"><PackageX className="size-12" style={{ color: 'var(--store-muted-text)' }} /></div>
                )}
                <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: 'color-mix(in srgb, var(--store-bg) 88%, transparent)', color: 'var(--store-text)', border: '1px solid var(--store-card-border)', backdropFilter: 'blur(12px)' }}>Agotado</span>
              </div>

              <div className="relative mt-3 rounded-t-[calc(var(--store-card-radius)+8px)] border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:mt-0 sm:rounded-none sm:border-l sm:border-t-0 sm:p-8" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-surface) 92%, var(--store-bg) 8%)' }}>
                <button ref={closeButtonRef} type="button" onClick={onClose} className="absolute right-4 top-4 flex size-11 items-center justify-center transition hover:scale-105 active:scale-95" style={{ borderRadius: 'var(--store-button-radius)', border: '1px solid var(--store-card-border)', color: 'var(--store-text)', background: 'color-mix(in srgb, var(--store-bg) 58%, transparent)' }} aria-label="Cerrar"><X className="size-5" /></button>
                {product.category?.name ? <p className="pr-12 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--store-secondary)' }}>{product.category.name}</p> : null}
                <h2 id="sold-out-title" className="store-heading mt-2 pr-12 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-3xl" style={{ color: 'var(--store-text)' }}>{product.name}</h2>
                <p className="mt-3 text-[1.9rem] font-bold tracking-[-0.04em]" style={{ color: 'var(--store-primary)' }}>{formatCurrency(product.price)}</p>
                {product.description ? <p className="mt-4 line-clamp-4 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>{product.description}</p> : null}

                <div className="mt-5 rounded-[calc(var(--store-card-radius)*0.78)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-bg) 46%, transparent)' }}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ color: 'var(--store-primary)', background: 'color-mix(in srgb, var(--store-primary) 10%, transparent)' }}><PackageX className="size-4.5" /></div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>Agotado por el momento</p>
                      <p className="mt-1 text-xs leading-5" style={{ color: 'var(--store-soft-text)' }}>No se puede agregar al pedido todavía. Mirá alternativas disponibles o volvé al catálogo.</p>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <RelatedProductsStrip items={relatedProducts} onSelect={onSelectRelated} title="Alternativas disponibles" />
                </div>

                <button type="button" onClick={onClose} className="store-button mt-5 min-h-13 w-full px-5 text-sm font-bold transition hover:-translate-y-0.5 active:translate-y-0" style={{ background: 'linear-gradient(145deg, var(--store-primary), color-mix(in srgb, var(--store-primary) 76%, black 24%))', color: 'var(--store-primary-contrast)', boxShadow: '0 14px 32px color-mix(in srgb, var(--store-primary) 18%, transparent)' }}>Seguir viendo productos</button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
