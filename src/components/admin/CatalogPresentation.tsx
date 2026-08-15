'use client'

import { useMemo, useState, useTransition } from 'react'
import { Check, GripVertical, Layers3, ListFilter, Rows3 } from 'lucide-react'
import { toast } from 'sonner'
import { reorderCategories, reorderProducts, updateCatalogMode, type CatalogMode } from '@/lib/actions/catalog-presentation'
import type { Category, ProductWithImages } from '@/types/store'

type OrderedProduct = ProductWithImages & { category_sort_order?: number }

type Props = {
  initialMode: CatalogMode
  categories: Category[]
  products: ProductWithImages[]
}

const MODES: Array<{ value: CatalogMode; title: string; description: string; icon: typeof Layers3 }> = [
  { value: 'all', title: 'Todos juntos', description: 'Una sola grilla con todo el catálogo, en el orden global que definas.', icon: Rows3 },
  { value: 'sections', title: 'Por secciones', description: 'Cada categoría aparece como bloque propio con sus productos ordenados.', icon: Layers3 },
  { value: 'navigation', title: 'Navegación', description: 'El cliente elige una categoría y ve solo los productos de esa sección.', icon: ListFilter },
]

export function CatalogPresentation({ initialMode, categories: initialCategories, products: initialProducts }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [categories, setCategories] = useState(initialCategories)
  const [products, setProducts] = useState<OrderedProduct[]>(initialProducts as OrderedProduct[])
  const [scope, setScope] = useState<'global' | string>('global')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const scopedProducts = useMemo(() => {
    if (scope === 'global') return [...products].sort((a, b) => a.sort_order - b.sort_order)
    const categoryId = scope === 'uncategorized' ? null : scope
    return products
      .filter((product) => product.category_id === categoryId)
      .sort((a, b) => (a.category_sort_order ?? 0) - (b.category_sort_order ?? 0))
  }, [products, scope])

  function chooseMode(nextMode: CatalogMode) {
    const previous = mode
    setMode(nextMode)
    startTransition(async () => {
      const result = await updateCatalogMode(nextMode)
      if (result?.error) {
        setMode(previous)
        toast.error(result.error)
        return
      }
      toast.success('Presentación del catálogo actualizada.')
    })
  }

  function moveCategory(sourceId: string, targetId: string) {
    if (sourceId === targetId || pending) return
    const previous = categories
    const next = reorderById(categories, sourceId, targetId)
    setCategories(next)
    startTransition(async () => {
      const result = await reorderCategories(next.map((item) => item.id))
      if (result?.error) {
        setCategories(previous)
        toast.error(result.error)
        return
      }
      toast.success('Orden de categorías guardado.')
    })
  }

  function moveProduct(sourceId: string, targetId: string) {
    if (sourceId === targetId || pending) return
    const previous = products
    const ordered = reorderById(scopedProducts, sourceId, targetId)
    const orderMap = new Map(ordered.map((product, index) => [product.id, index]))
    const next = products.map((product) => {
      const index = orderMap.get(product.id)
      if (index === undefined) return product
      return scope === 'global'
        ? { ...product, sort_order: index }
        : { ...product, category_sort_order: index }
    })
    setProducts(next)

    startTransition(async () => {
      const result = await reorderProducts(
        ordered.map((product) => product.id),
        scope === 'global'
          ? { type: 'global' }
          : { type: 'category', categoryId: scope === 'uncategorized' ? null : scope },
      )
      if (result?.error) {
        setProducts(previous)
        toast.error(result.error)
        return
      }
      toast.success('Orden de productos guardado.')
    })
  }

  return (
    <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Presentación</p>
        <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">Cómo se ve tu catálogo</h2>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Elegí el formato y ordená categorías y productos sin tocar el diseño de la tienda.</p>
      </div>

      <div className="mt-4 grid gap-2">
        {MODES.map((item) => {
          const Icon = item.icon
          const active = mode === item.value
          return (
            <button
              key={item.value}
              type="button"
              disabled={pending}
              onClick={() => chooseMode(item.value)}
              className={`flex items-start gap-3 rounded-[11px] border p-3 text-left transition ${active ? 'border-[#12e89a]/50 bg-[#12e89a]/7' : 'border-black/8 hover:border-black/15 dark:border-white/10 dark:hover:border-white/20'}`}
            >
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[9px] ${active ? 'bg-[#12e89a] text-[#062117]' : 'bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-white/50'}`}><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-semibold text-foreground">{item.title}{active ? <Check className="size-3.5 text-emerald-500" /> : null}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span></span>
            </button>
          )
        })}
      </div>

      {categories.length > 1 ? (
        <div className="mt-5 border-t border-black/7 pt-5 dark:border-white/8">
          <p className="text-xs font-semibold text-foreground">Orden de categorías</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Arrastrá para definir cuál aparece primero.</p>
          <div className="mt-3 space-y-1.5">
            {categories.map((category) => (
              <DragRow key={category.id} id={category.id} label={category.name} draggedId={draggedId} setDraggedId={setDraggedId} onDrop={moveCategory} disabled={pending} />
            ))}
          </div>
        </div>
      ) : null}

      {products.length > 1 ? (
        <div className="mt-5 border-t border-black/7 pt-5 dark:border-white/8">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-xs font-semibold text-foreground">Orden de productos</p><p className="mt-1 text-[11px] text-muted-foreground">Global para “Todos juntos”; por categoría para los otros modos.</p></div>
          </div>
          <select value={scope} onChange={(event) => setScope(event.target.value)} disabled={pending} className="mt-3 h-9 w-full rounded-[9px] border border-black/8 bg-white px-2.5 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5">
            <option value="global">Orden global</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            {products.some((product) => !product.category_id) ? <option value="uncategorized">Sin categoría</option> : null}
          </select>
          <div className="mt-3 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
            {scopedProducts.map((product) => (
              <DragRow key={`${scope}-${product.id}`} id={product.id} label={product.name} draggedId={draggedId} setDraggedId={setDraggedId} onDrop={moveProduct} disabled={pending} />
            ))}
            {scopedProducts.length === 0 ? <p className="rounded-[9px] border border-dashed border-black/10 px-3 py-4 text-center text-xs text-muted-foreground dark:border-white/10">No hay productos en esta sección.</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function DragRow({ id, label, draggedId, setDraggedId, onDrop, disabled }: { id: string; label: string; draggedId: string | null; setDraggedId: (id: string | null) => void; onDrop: (sourceId: string, targetId: string) => void; disabled: boolean }) {
  return (
    <div
      draggable={!disabled}
      onDragStart={() => setDraggedId(id)}
      onDragEnd={() => setDraggedId(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => { event.preventDefault(); if (draggedId) onDrop(draggedId, id); setDraggedId(null) }}
      className={`flex items-center gap-2 rounded-[9px] border px-2.5 py-2 text-xs font-medium text-foreground transition ${draggedId === id ? 'border-[#12e89a]/50 bg-[#12e89a]/7 opacity-70' : 'border-black/7 bg-[#fbfcfd] dark:border-white/8 dark:bg-white/[0.025]'}`}
    >
      <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/55" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function reorderById<T extends { id: string }>(items: T[], sourceId: string, targetId: string) {
  const sourceIndex = items.findIndex((item) => item.id === sourceId)
  const targetIndex = items.findIndex((item) => item.id === targetId)
  if (sourceIndex < 0 || targetIndex < 0) return items
  const next = [...items]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  return next
}
