'use client'

import { useEffect, useState, useTransition } from 'react'
import { BadgePercent, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { setProductPromotion } from '@/lib/actions/product-discovery'
import { getProductDiscountPercent, getProductNormalPrice, isProductOnPromotion } from '@/lib/products/promotion'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

type Props = {
  product: ProductWithImages
  onChange: (next: { price: number; comparePrice: number | null }) => void
  compact?: boolean
}

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits === '' ? null : Number(digits)
}

export function PromotionQuickControl({ product, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [pending, startTransition] = useTransition()
  const active = isProductOnPromotion(product)
  const discount = getProductDiscountPercent(product)
  const normalPrice = getProductNormalPrice(product)

  useEffect(() => {
    if (open) setInputValue(active ? String(product.price) : '')
  }, [active, open, product.price])

  function savePromotion() {
    const promotionalPrice = parsePrice(inputValue)
    if (!promotionalPrice) {
      toast.error('Ingresá el precio promocional.')
      return
    }
    if (promotionalPrice >= normalPrice) {
      toast.error('El precio promocional tiene que ser menor al precio normal.')
      return
    }

    startTransition(async () => {
      const result = await setProductPromotion(product.id, promotionalPrice)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      onChange({ price: result.price, comparePrice: result.comparePrice })
      setOpen(false)
      toast.success(active ? 'Promoción actualizada.' : 'Producto agregado a Promociones.')
    })
  }

  function removePromotion() {
    startTransition(async () => {
      const result = await setProductPromotion(product.id, null)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      onChange({ price: result.price, comparePrice: result.comparePrice })
      setOpen(false)
      toast.success('Promoción desactivada.')
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={active
          ? `inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-emerald-500/25 bg-emerald-500/10 font-semibold text-emerald-600 transition hover:bg-emerald-500/15 dark:text-emerald-300 ${compact ? 'h-8 px-2.5 text-[11px]' : 'h-9 px-3 text-xs'}`
          : `inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-black/8 bg-white font-medium text-muted-foreground transition hover:border-emerald-500/30 hover:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:hover:text-emerald-300 ${compact ? 'h-8 px-2.5 text-[11px]' : 'h-9 px-3 text-xs'}`}
        aria-label={active ? `Editar promoción de ${product.name}` : `Activar promoción para ${product.name}`}
      >
        <BadgePercent className="size-3.5" />
        {active ? `${discount ?? 0}% OFF` : 'Promo'}
      </button>

      <Dialog open={open} onOpenChange={(nextOpen) => { if (!pending) setOpen(nextOpen) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{active ? 'Editar promoción' : 'Activar promoción'}</DialogTitle>
            <DialogDescription>
              {active
                ? 'Cambiá el precio de oferta o sacá el producto de Promociones.'
                : 'Ingresá el nuevo precio. VOLTA muestra el precio anterior tachado y calcula el descuento automáticamente.'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-[12px] border border-black/7 bg-slate-50 p-3 dark:border-white/8 dark:bg-white/[0.035]">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Precio normal</span>
              <strong className="font-semibold text-foreground">{formatCurrency(normalPrice)}</strong>
            </div>
            {active ? (
              <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Oferta actual</span>
                <strong className="font-semibold text-emerald-600 dark:text-emerald-300">{formatCurrency(product.price)}</strong>
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor={`promo-${product.id}`} className="text-sm font-medium text-foreground">Precio promocional</label>
            <div className="relative mt-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id={`promo-${product.id}`}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej: 25500"
                disabled={pending}
                className="h-11 rounded-[10px] pl-8"
              />
            </div>
            {parsePrice(inputValue) && parsePrice(inputValue)! < normalPrice ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                <Tag className="size-3.5" />
                {Math.round((1 - parsePrice(inputValue)! / normalPrice) * 100)}% de descuento
              </p>
            ) : null}
          </div>

          <DialogFooter className="sm:justify-between">
            {active ? (
              <Button type="button" variant="ghost" onClick={removePromotion} disabled={pending} className="text-red-600 hover:text-red-700">
                Sacar promoción
              </Button>
            ) : <span />}
            <Button type="button" onClick={savePromotion} disabled={pending || !parsePrice(inputValue)} className="bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]">
              {pending ? 'Guardando…' : active ? 'Guardar oferta' : 'Aplicar promoción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
