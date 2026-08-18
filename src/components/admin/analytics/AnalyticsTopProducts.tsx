import Image from 'next/image'
import { PackageOpen, ShoppingBag } from 'lucide-react'
import type { StoreAnalyticsSnapshot } from '@/lib/queries/analytics'

export function AnalyticsTopProducts({ snapshot }: { snapshot: StoreAnalyticsSnapshot }) {
  return (
    <article className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div>
        <p className="admin-label">Productos</p>
        <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] text-foreground sm:text-lg">Qué está generando interés</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Los productos más vistos y agregados al carrito.</p>
      </div>

      {snapshot.topProducts.length > 0 ? (
        <div className="mt-4 divide-y divide-black/5 dark:divide-white/8">
          {snapshot.topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-5 shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
              <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px] bg-slate-100 dark:bg-white/5">
                {product.imageUrl ? <Image src={product.imageUrl} alt="" fill className="object-cover" sizes="44px" /> : <PackageOpen className="absolute inset-0 m-auto size-4 text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{product.views} {product.views === 1 ? 'vista' : 'vistas'}</span>
                  <span className="inline-flex items-center gap-1"><ShoppingBag className="size-3" />{product.addToCart} al carrito</span>
                </div>
              </div>
              {product.views >= 3 ? (
                <span className="shrink-0 text-[11px] font-semibold text-muted-foreground" title="Agregados al carrito sobre vistas del producto">
                  {new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(product.cartRate)}%
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[13px] border border-dashed border-black/8 bg-slate-50/60 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.025]">
          Cuando tus clientes abran productos, vas a ver acá cuáles generan más interés.
        </div>
      )}

      {snapshot.topCategory ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3 text-xs dark:border-white/8">
          <span className="text-muted-foreground">Categoría con más interés</span>
          <span className="max-w-[55%] truncate font-semibold text-foreground">{snapshot.topCategory.name}</span>
        </div>
      ) : null}
    </article>
  )
}
