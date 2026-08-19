'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { PackageX, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

export function SoldOutProductModal({ product, onClose }: { product: ProductWithImages; onClose: () => void }) {
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="sold-out-title">
        <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar detalle" style={{ background: 'color-mix(in srgb, var(--store-bg) 32%, black 68%)', backdropFilter: 'blur(18px)' }} />
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="relative w-full overflow-hidden sm:max-w-3xl" style={{ background: 'var(--store-surface)', borderRadius: 'calc(var(--store-card-radius) + 8px)', border: '1px solid var(--store-card-border)', boxShadow: 'var(--store-shadow)' }}>
          <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
            <div className="relative aspect-[5/4] sm:aspect-auto sm:min-h-[28rem]" style={{ background: 'color-mix(in srgb, var(--store-surface) 88%, var(--store-bg))' }}>
              {image ? <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover opacity-75 grayscale-[0.25]" /> : <div className="flex h-full items-center justify-center"><PackageX className="size-12" style={{ color: 'var(--store-muted-text)' }} /></div>}
              <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: 'color-mix(in srgb, var(--store-bg) 88%, transparent)', color: 'var(--store-text)', border: '1px solid var(--store-card-border)', backdropFilter: 'blur(12px)' }}>Agotado</span>
            </div>
            <div className="relative flex flex-col p-5 sm:p-8">
              <button ref={closeButtonRef} type="button" onClick={onClose} className="absolute right-4 top-4 flex size-10 items-center justify-center" style={{ borderRadius: 'var(--store-button-radius)', border: '1px solid var(--store-card-border)', color: 'var(--store-text)' }} aria-label="Cerrar"><X className="size-4" /></button>
              {product.category?.name ? <p className="pr-12 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>{product.category.name}</p> : null}
              <h2 id="sold-out-title" className="store-heading mt-2 pr-12 text-2xl font-semibold sm:text-3xl" style={{ color: 'var(--store-text)' }}>{product.name}</h2>
              <p className="mt-4 text-2xl font-semibold" style={{ color: 'var(--store-primary)' }}>{formatCurrency(product.price)}</p>
              {product.description ? <p className="mt-5 text-sm leading-7" style={{ color: 'var(--store-soft-text)' }}>{product.description}</p> : null}
              <div className="mt-7 rounded-[var(--store-card-radius)] border p-4" style={{ borderColor: 'var(--store-card-border)', background: 'color-mix(in srgb, var(--store-bg) 48%, transparent)' }}>
                <div className="flex items-start gap-3"><PackageX className="mt-0.5 size-5 shrink-0" style={{ color: 'var(--store-primary)' }} /><div><p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>Agotado por el momento</p><p className="mt-1 text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>Podés seguir viendo el producto, pero no se puede agregar al pedido hasta que el negocio lo marque nuevamente como disponible.</p></div></div>
              </div>
              <button type="button" onClick={onClose} className="store-button mt-6 min-h-12 w-full px-5 text-sm font-semibold" style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}>Seguir viendo productos</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
