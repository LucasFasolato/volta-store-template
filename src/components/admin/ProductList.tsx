'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package2, Search, Star, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PromotionQuickControl } from '@/components/admin/PromotionQuickControl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteProduct } from '@/lib/actions/products'
import { setProductCategory } from '@/lib/actions/product-category'
import { setProductBrand } from '@/lib/actions/product-discovery'
import { bulkUpdateProducts, setProductOperationalState, type BulkProductActionInput } from '@/lib/actions/product-operations'
import { getProductOperationalState, type ProductOperationalState } from '@/lib/products/availability'
import { isProductOnPromotion } from '@/lib/products/promotion'
import { formatCurrency } from '@/lib/utils/format'
import type { Brand, Category, ProductWithImages } from '@/types/store'

type ProductListProps = { products: ProductWithImages[]; categories: Category[]; brands: Brand[] }
type BulkActionKind = 'state' | 'category' | 'brand' | 'promotion_discount' | 'promotion_remove'

export function ProductList({ products, categories, brands }: ProductListProps) {
  const [localProducts, setLocalProducts] = useState(products)
  const [filter, setFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [productToDelete, setProductToDelete] = useState<ProductWithImages | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [bulkPending, startBulkTransition] = useTransition()

  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category.name]))
  const brandMap = Object.fromEntries(brands.map((brand) => [brand.id, brand.name]))
  const counts = useMemo(() => ({
    available: localProducts.filter((product) => getProductOperationalState(product) === 'available').length,
    soldOut: localProducts.filter((product) => getProductOperationalState(product) === 'sold_out').length,
    hidden: localProducts.filter((product) => getProductOperationalState(product) === 'hidden').length,
    promotions: localProducts.filter(isProductOnPromotion).length,
  }), [localProducts])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    return localProducts.filter((product) => {
      const state = getProductOperationalState(product)
      const matchesFilter = filter === 'all' || filter === state || (filter === 'featured' && product.is_featured) || (filter === 'promotions' && isProductOnPromotion(product)) || product.category_id === filter
      const matchesBrand = brandFilter === 'all' || product.brand_id === brandFilter
      const searchable = [product.name, product.sku, product.short_description, product.category_id ? categoryMap[product.category_id] : null, product.brand_id ? brandMap[product.brand_id] : null].filter(Boolean).join(' ').toLocaleLowerCase('es')
      return matchesFilter && matchesBrand && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [brandFilter, brandMap, categoryMap, filter, localProducts, query])

  const visibleIds = filtered.map((product) => product.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  function patchProducts(updates: Array<Record<string, unknown> & { id: string }>) {
    const byId = new Map(updates.map((update) => [update.id, update]))
    setLocalProducts((current) => current.map((product) => byId.has(product.id) ? { ...product, ...byId.get(product.id) } as ProductWithImages : product))
  }

  function toggleSelected(productId: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  async function handleDelete() {
    if (!productToDelete) return
    setDeleting(true)
    const result = await deleteProduct(productToDelete.id)
    setDeleting(false)
    if (result?.error) { toast.error(result.error); return }
    setLocalProducts((current) => current.filter((product) => product.id !== productToDelete.id))
    setSelected((current) => { const next = new Set(current); next.delete(productToDelete.id); return next })
    setProductToDelete(null)
    toast.success('Producto eliminado.')
  }

  const filterItems = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: `Disponibles ${counts.available}` },
    ...(counts.soldOut ? [{ value: 'sold_out', label: `Agotados ${counts.soldOut}` }] : []),
    ...(counts.hidden ? [{ value: 'hidden', label: `Ocultos ${counts.hidden}` }] : []),
    { value: 'featured', label: 'Destacados' },
    ...(counts.promotions ? [{ value: 'promotions', label: `Promos ${counts.promotions}` }] : []),
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto, marca o SKU..." className="h-10 rounded-[10px] bg-white pl-9 dark:bg-white/5" /></div>
            {brands.length > 0 ? <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="h-10 rounded-[10px] border border-black/8 bg-white px-3 text-xs font-medium text-foreground outline-none dark:border-white/10 dark:bg-white/5"><option value="all">Todas las marcas</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select> : null}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">{filterItems.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={filter === item.value ? 'shrink-0 rounded-[9px] bg-[#10161d] px-3 py-2 text-xs font-semibold text-white' : 'shrink-0 rounded-[9px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50'}>{item.label}</button>)}</div>
        </div>

        {selected.size > 0 ? <BulkActionsBar count={selected.size} categories={categories} brands={brands} pending={bulkPending} onClear={() => setSelected(new Set())} onApply={(input) => startBulkTransition(async () => { const currentCount = selected.size; const result = await bulkUpdateProducts({ ...input, productIds: [...selected] } as BulkProductActionInput); if (result?.error) { toast.error(result.error); return } patchProducts(result.updatedProducts ?? []); setSelected(new Set()); toast.success(`${currentCount} ${currentCount === 1 ? 'producto actualizado' : 'productos actualizados'}.`) })} /> : null}

        {filtered.length === 0 ? <EmptyState icon={Package2} title={localProducts.length ? 'No encontramos productos' : 'Tu catálogo todavía está vacío'} description={localProducts.length ? 'Probá otra búsqueda o filtro.' : 'Agregá tu primer producto y empezá a armar el catálogo.'} action={<Button asChild className="rounded-[10px] bg-[#12e89a] text-[#062117]"><Link href="/admin/catalogo/nuevo">Agregar producto</Link></Button>} /> : <>
          <div className="hidden overflow-hidden rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820] lg:block">
            <div className="grid grid-cols-[34px_minmax(220px,1.35fr)_minmax(125px,.7fr)_minmax(125px,.7fr)_115px_105px_130px_44px] items-center border-b border-black/7 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:border-white/8">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Seleccionar productos visibles" className="size-4 accent-emerald-500" /><span>Producto</span><span>Categoría</span><span>Marca</span><span>Precio</span><span>Promoción</span><span>Estado</span><span />
            </div>
            {filtered.map((product) => <ProductRow key={product.id} product={product} selected={selected.has(product.id)} categories={categories} brands={brands} onSelect={() => toggleSelected(product.id)} onPatch={(patch) => patchProducts([{ id: product.id, ...patch }])} onDelete={() => setProductToDelete(product)} />)}
          </div>
          <div className="space-y-2 lg:hidden">{filtered.map((product) => <ProductMobileCard key={product.id} product={product} selected={selected.has(product.id)} categories={categories} brands={brands} category={product.category_id ? categoryMap[product.category_id] : undefined} brand={product.brand_id ? brandMap[product.brand_id] : undefined} onSelect={() => toggleSelected(product.id)} onPatch={(patch) => patchProducts([{ id: product.id, ...patch }])} onDelete={() => setProductToDelete(product)} />)}</div>
        </>}
      </div>
      <ConfirmationDialog open={!!productToDelete} onOpenChange={(open) => { if (!open && !deleting) setProductToDelete(null) }} title={productToDelete ? `Eliminar “${productToDelete.name}”?` : 'Eliminar producto'} description="El producto dejará de existir. Si sólo querés sacarlo de la tienda, elegí Estado → Oculto." confirmLabel="Eliminar producto" onConfirm={handleDelete} isPending={deleting} />
    </>
  )
}

function BulkActionsBar({ count, categories, brands, pending, onClear, onApply }: { count: number; categories: Category[]; brands: Brand[]; pending: boolean; onClear: () => void; onApply: (input: Omit<BulkProductActionInput, 'productIds'>) => void }) {
  const [action, setAction] = useState<BulkActionKind>('state')
  const [state, setState] = useState<ProductOperationalState>('available')
  const [categoryId, setCategoryId] = useState('none')
  const [brandId, setBrandId] = useState('none')
  const [discount, setDiscount] = useState('10')

  function apply() {
    if (action === 'state') onApply({ action, state } as Omit<BulkProductActionInput, 'productIds'>)
    if (action === 'category') onApply({ action, categoryId: categoryId === 'none' ? null : categoryId } as Omit<BulkProductActionInput, 'productIds'>)
    if (action === 'brand') onApply({ action, brandId: brandId === 'none' ? null : brandId } as Omit<BulkProductActionInput, 'productIds'>)
    if (action === 'promotion_remove') onApply({ action } as Omit<BulkProductActionInput, 'productIds'>)
    if (action === 'promotion_discount') {
      const value = Number(discount)
      if (!Number.isFinite(value) || value < 1 || value > 90) { toast.error('Ingresá un descuento entre 1% y 90%.'); return }
      onApply({ action, discountPercent: value } as Omit<BulkProductActionInput, 'productIds'>)
    }
  }

  return <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-400/20 dark:bg-emerald-400/8"><div className="flex flex-wrap items-center gap-2.5"><div className="mr-auto"><p className="text-sm font-semibold text-foreground">{count} {count === 1 ? 'seleccionado' : 'seleccionados'}</p><p className="text-xs text-muted-foreground">Elegí una sola cosa para cambiar y aplicala a todos.</p></div><select value={action} onChange={(event) => setAction(event.target.value as BulkActionKind)} className="h-10 rounded-[9px] border border-black/10 bg-white px-3 text-xs font-semibold dark:border-white/10 dark:bg-[#111820]"><option value="state">Estado</option><option value="category">Categoría</option><option value="brand">Marca</option><option value="promotion_discount">Aplicar descuento</option><option value="promotion_remove">Quitar promoción</option></select>{action === 'state' ? <select value={state} onChange={(event) => setState(event.target.value as ProductOperationalState)} className="h-10 rounded-[9px] border border-black/10 bg-white px-3 text-xs dark:border-white/10 dark:bg-[#111820]"><option value="available">Disponible</option><option value="sold_out">Agotado</option><option value="hidden">Oculto</option></select> : null}{action === 'category' ? <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 rounded-[9px] border border-black/10 bg-white px-3 text-xs dark:border-white/10 dark:bg-[#111820]"><option value="none">Sin categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select> : null}{action === 'brand' ? <select value={brandId} onChange={(event) => setBrandId(event.target.value)} className="h-10 rounded-[9px] border border-black/10 bg-white px-3 text-xs dark:border-white/10 dark:bg-[#111820]"><option value="none">Sin marca</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select> : null}{action === 'promotion_discount' ? <div className="flex h-10 items-center rounded-[9px] border border-black/10 bg-white px-2 dark:border-white/10 dark:bg-[#111820]"><input value={discount} onChange={(event) => setDiscount(event.target.value)} inputMode="decimal" className="w-12 bg-transparent text-right text-xs outline-none" /><span className="text-xs text-muted-foreground">%</span></div> : null}<button type="button" disabled={pending} onClick={apply} className="h-10 rounded-[9px] bg-[#10161d] px-4 text-xs font-semibold text-white disabled:opacity-50">{pending ? 'Aplicando...' : `Aplicar a ${count}`}</button><button type="button" onClick={onClear} className="flex size-10 items-center justify-center rounded-[9px] text-muted-foreground" aria-label="Limpiar selección"><X className="size-4" /></button></div></div>
}

function ProductThumb({ product }: { product: ProductWithImages }) { const image = product.images?.[0]?.url; return <div className="relative size-11 shrink-0 overflow-hidden rounded-[9px] bg-slate-100 dark:bg-white/5">{image ? <Image src={image} alt={product.name} fill className="object-cover" /> : null}</div> }
function ProductPrice({ product }: { product: ProductWithImages }) { return <span>{isProductOnPromotion(product) ? <><span className="block text-sm font-semibold text-emerald-600 dark:text-emerald-300">{formatCurrency(product.price)}</span><span className="block text-[10px] text-muted-foreground line-through">{formatCurrency(product.compare_price!)}</span></> : <span className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</span>}</span> }

function StateSelect({ product, onPatch }: { product: ProductWithImages; onPatch: (patch: Partial<ProductWithImages>) => void }) {
  const [pending, startTransition] = useTransition()
  const state = getProductOperationalState(product)
  function change(next: ProductOperationalState) {
    const previous = { is_active: product.is_active, availability_status: product.availability_status }
    onPatch(next === 'hidden' ? { is_active: false } : { is_active: true, availability_status: next === 'sold_out' ? 'sold_out' : 'available' })
    startTransition(async () => { const result = await setProductOperationalState(product.id, next); if (result?.error) { onPatch(previous); toast.error(result.error); return } if (result.product) onPatch(result.product as Partial<ProductWithImages>); toast.success(next === 'available' ? 'Producto disponible.' : next === 'sold_out' ? 'Producto marcado como agotado.' : 'Producto oculto.') })
  }
  return <select value={state} disabled={pending} onChange={(event) => change(event.target.value as ProductOperationalState)} className="h-9 rounded-[9px] border border-black/8 bg-white px-2 text-xs font-semibold text-foreground dark:border-white/10 dark:bg-white/5" aria-label="Estado del producto"><option value="available">Disponible</option><option value="sold_out">Agotado</option><option value="hidden">Oculto</option></select>
}

function CategorySelect({ product, categories, onPatch }: { product: ProductWithImages; categories: Category[]; onPatch: (patch: Partial<ProductWithImages>) => void }) { const [pending, startTransition] = useTransition(); return <select value={product.category_id ?? 'none'} disabled={pending} onChange={(event) => { const next = event.target.value === 'none' ? null : event.target.value; const previous = product.category_id; onPatch({ category_id: next }); startTransition(async () => { const result = await setProductCategory(product.id, next); if (result?.error) { onPatch({ category_id: previous }); toast.error(result.error) } }) }} className="h-9 w-full max-w-[145px] rounded-[9px] border border-black/8 bg-white px-2 text-xs dark:border-white/10 dark:bg-white/5"><option value="none">Sin categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select> }
function BrandSelect({ product, brands, onPatch }: { product: ProductWithImages; brands: Brand[]; onPatch: (patch: Partial<ProductWithImages>) => void }) { const [pending, startTransition] = useTransition(); return <select value={product.brand_id ?? 'none'} disabled={pending} onChange={(event) => { const next = event.target.value === 'none' ? null : event.target.value; const previous = product.brand_id; onPatch({ brand_id: next }); startTransition(async () => { const result = await setProductBrand(product.id, next); if (result?.error) { onPatch({ brand_id: previous }); toast.error(result.error) } }) }} className="h-9 w-full max-w-[145px] rounded-[9px] border border-black/8 bg-white px-2 text-xs dark:border-white/10 dark:bg-white/5"><option value="none">Sin marca</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select> }

function ProductRow({ product, selected, categories, brands, onSelect, onPatch, onDelete }: { product: ProductWithImages; selected: boolean; categories: Category[]; brands: Brand[]; onSelect: () => void; onPatch: (patch: Partial<ProductWithImages>) => void; onDelete: () => void }) {
  return <div className="grid grid-cols-[34px_minmax(220px,1.35fr)_minmax(125px,.7fr)_minmax(125px,.7fr)_115px_105px_130px_44px] items-center border-b border-black/6 px-4 py-2.5 last:border-b-0 dark:border-white/7"><input type="checkbox" checked={selected} onChange={onSelect} className="size-4 accent-emerald-500" aria-label={`Seleccionar ${product.name}`} /><Link href={`/admin/catalogo/${product.id}`} className="flex min-w-0 items-center gap-3"><ProductThumb product={product} /><span className="min-w-0"><span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">{product.name}{product.is_featured ? <Star className="size-3.5 fill-amber-300 text-amber-300" /> : null}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{product.sku ? `SKU ${product.sku}` : product.short_description || 'Sin descripción corta'}</span></span></Link><CategorySelect product={product} categories={categories} onPatch={onPatch} /><BrandSelect product={product} brands={brands} onPatch={onPatch} /><ProductPrice product={product} /><PromotionQuickControl product={product} onChange={(next) => onPatch({ price: next.price, compare_price: next.comparePrice })} compact /><StateSelect product={product} onPatch={onPatch} /><button type="button" onClick={onDelete} className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:text-red-600" aria-label={`Eliminar ${product.name}`}><Trash2 className="size-4" /></button></div>
}

function ProductMobileCard({ product, selected, categories, brands, category, brand, onSelect, onPatch, onDelete }: { product: ProductWithImages; selected: boolean; categories: Category[]; brands: Brand[]; category?: string; brand?: string; onSelect: () => void; onPatch: (patch: Partial<ProductWithImages>) => void; onDelete: () => void }) {
  return <div className="rounded-[13px] border border-black/8 bg-white p-3 dark:border-white/10 dark:bg-[#111820]"><div className="flex items-center gap-3"><input type="checkbox" checked={selected} onChange={onSelect} className="size-4 shrink-0 accent-emerald-500" aria-label={`Seleccionar ${product.name}`} /><Link href={`/admin/catalogo/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3"><ProductThumb product={product} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{product.name}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{[category, brand].filter(Boolean).join(' · ') || 'Sin categoría ni marca'}</span></span></Link><button type="button" onClick={onDelete} className="flex size-8 items-center justify-center text-muted-foreground"><Trash2 className="size-4" /></button></div><div className="mt-3 grid grid-cols-2 gap-2"><CategorySelect product={product} categories={categories} onPatch={onPatch} /><BrandSelect product={product} brands={brands} onPatch={onPatch} /></div><div className="mt-3 flex items-center justify-between gap-2 border-t border-black/6 pt-3 dark:border-white/7"><ProductPrice product={product} /><div className="flex items-center gap-2"><PromotionQuickControl product={product} onChange={(next) => onPatch({ price: next.price, compare_price: next.comparePrice })} compact /><StateSelect product={product} onPatch={onPatch} /></div></div></div>
}
