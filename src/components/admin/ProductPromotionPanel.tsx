'use client'

import { useRouter } from 'next/navigation'
import { BadgePercent } from 'lucide-react'
import { PromotionQuickControl } from '@/components/admin/PromotionQuickControl'
import { getProductDiscountPercent, getProductNormalPrice, isProductOnPromotion } from '@/lib/products/promotion'
import { formatCurrency } from '@/lib/utils/format'
import type { ProductWithImages } from '@/types/store'

export function ProductPromotionPanel({ product }: { product: ProductWithImages }) {
  const router = useRouter()
  const active = isProductOnPromotion(product)
  const discount = getProductDiscountPercent(product)
  const normalPrice = getProductNormalPrice(product)

  return (
    <section className="mb-5 rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={active
            ? 'flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
            : 'flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}>
            <BadgePercent className="size-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Promoción</p>
              {active ? <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">{discount ?? 0}% OFF</span> : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {active
                ? `${formatCurrency(product.price)} en oferta · precio normal ${formatCurrency(normalPrice)}.`
                : 'Activala, cargá el precio nuevo y VOLTA hace el resto automáticamente.'}
            </p>
          </div>
        </div>

        <PromotionQuickControl
          product={product}
          onChange={() => router.refresh()}
        />
      </div>
    </section>
  )
}
