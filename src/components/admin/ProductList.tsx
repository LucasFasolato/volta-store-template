'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Package2, Search, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteProduct } from '@/lib/actions/products'
import { setProductCategory } from '@/lib/actions/product-category'
import { formatCurrency } from '@/lib/utils/format'
import type { Category, ProductWithImages } from '@/types/store'

type ProductListProps = {
  products: ProductWithImages[]
  categories: Category[]
}

export function ProductList({ products, categories }: ProductListProps) {
  const [localProducts, setLocalProducts] = useState(products)
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<ProductWithImages | null>(null)

  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category.name]))
  const hasProducts = localProducts.length > 0

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return localProducts.filter((product) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && product.is_active) ||
        (filter === 'featured' && product.is_featured) ||
        product.category_id === filter
      const matchesQuery = !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery)
      return matchesFilter && matchesQuery
    })
  }, [filter, localProducts, query])

  async function handleDelete() {
    if (!productToDelete) return
    setDeletingId(productToDelete.id)
    const result = await deleteProduct(productToDelete.id)
    setDeletingId(null)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    setLocalProducts((current) => current.filter((product) => product.id !== productToDelete.id))
    setProductToDelete(null)
    toast.success('Producto eliminado.')
  }

  function updateLocalCategory(productId: string, categoryId: string | null) {
    setLocalProducts((current) => current.map((product) => product.id === productId ? { ...product, category_id: categoryId } : product))
  }

  const filterItems = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'featured', label: 'Destacados' },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos..." className="h-10 rounded-[10px] bg-white pl-9 dark:bg-white/5" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filterItems.map((item) => {
              const active = filter === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={active
                    ? 'shrink-0 rounded-[9px] px-3 py-2 text-xs font-semibold'
                    : 'shrink-0 rounded-[9px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-black/15 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:text-white'}
                  style={active ? { backgroundColor: '#10161d', color: '#ffffff' } : undefined}
                  aria-pressed={active}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Package2}
            title={hasProducts ? 'No encontramos productos' : 'Tu catálogo todavía está vacío'}
            description={hasProducts ? 'Probá otra búsqueda o filtro.' : 'Agregá tu primer producto y empezá a armar el catálogo.'}
            action={
              <Button asChild className="rounded-[10px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]">
                <Link href="/admin/catalogo/nuevo">{hasProducts ? 'Agregar producto' : 'Crear primer producto'}</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-[14px] border border-black/8 bg-white dark:border-white/10 dark:bg-[#111820] md:block">
              <div className="grid grid-cols-[minmax(260px,1.7fr)_minmax(170px,.9fr)_120px_110px_64px] items-center border-b border-black/7 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:border-white/8">
                <span>Producto</span><span>Categoría</span><span>Precio</span><span>Estado</span><span />
              </div>
              {filtered.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  categories={categories}
                  category={product.category_id ? categoryMap[product.category_id] : undefined}
                  onCategoryChange={(categoryId) => updateLocalCategory(product.id, categoryId)}
                  onDelete={() => setProductToDelete(product)}
                />
              ))}
            </div>

            <div className="space-y-2 md:hidden">
              {filtered.map((product) => (
                <ProductMobileCard
                  key={product.id}
                  product={product}
                  categories={categories}
                  category={product.category_id ? categoryMap[product.category_id] : undefined}
                  onCategoryChange={(categoryId) => updateLocalCategory(product.id, categoryId)}
                  onDelete={() => setProductToDelete(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmationDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) setProductToDelete(null)
        }}
        title={productToDelete ? `Eliminar “${productToDelete.name}”?` : 'Eliminar producto'}
        description="El producto dejará de aparecer en tu tienda. Esta acción no se puede deshacer."
        confirmLabel="Eliminar producto"
        onConfirm={handleDelete}
        isPending={!!productToDelete && deletingId === productToDelete.id}
      />
    </>
  )
}

function ProductThumb({ product }: { product: ProductWithImages }) {
  const image = product.images?.[0]?.url
  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-[9px] bg-slate-100 dark:bg-white/5">
      {image ? <Image src={image} alt={product.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-[8px] text-muted-foreground">Sin foto</div>}
    </div>
  )
}

function ProductCategorySelect({ productId, value, categories, onChange }: { productId: string; value: string | null; categories: Category[]; onChange: (categoryId: string | null) => void }) {
  const [pending, startTransition] = useTransition()

  function handleChange(nextValue: string) {
    const nextCategoryId = nextValue === 'none' ? null : nextValue
    const previous = value
    onChange(nextCategoryId)
    startTransition(async () => {
      const result = await setProductCategory(productId, nextCategoryId)
      if (result?.error) {
        onChange(previous)
        toast.error(result.error)
        return
      }
      toast.success(nextCategoryId ? 'Categoría actualizada.' : 'Producto sin categoría.')
    })
  }

  return (
    <select
      value={value ?? 'none'}
      onChange={(event) => handleChange(event.target.value)}
      disabled={pending}
      aria-label="Categoría del producto"
      className="h-9 w-full max-w-[170px] rounded-[9px] border border-black/8 bg-white px-2.5 text-xs font-medium text-foreground outline-none transition focus:border-[#12e89a] disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
    >
      <option value="none">Sin categoría</option>
      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
    </select>
  )
}

function ProductRow({ product, categories, category, onCategoryChange, onDelete }: { product: ProductWithImages; categories: Category[]; category?: string; onCategoryChange: (categoryId: string | null) => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(260px,1.7fr)_minmax(170px,.9fr)_120px_110px_64px] items-center border-b border-black/6 px-4 py-2.5 last:border-b-0 hover:bg-slate-50/80 dark:border-white/7 dark:hover:bg-white/[0.025]">
      <Link href={`/admin/catalogo/${product.id}`} className="flex min-w-0 items-center gap-3">
        <ProductThumb product={product} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">{product.name}{product.is_featured ? <Star className="size-3.5 fill-amber-300 text-amber-300" /> : null}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{product.short_description || 'Sin descripción corta'}</span>
        </span>
      </Link>
      <ProductCategorySelect productId={product.id} value={product.category_id} categories={categories} onChange={onCategoryChange} />
      <span className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</span>
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">{product.is_active ? <><span className="size-1.5 rounded-full bg-[#12e89a]" /><Eye className="size-3.5" />Activo</> : <><span className="size-1.5 rounded-full bg-slate-300" /><EyeOff className="size-3.5" />Oculto</>}</span>
      <button type="button" onClick={onDelete} className="ml-auto flex size-8 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10" aria-label={`Eliminar ${product.name}`}><Trash2 className="size-4" /></button>
    </div>
  )
}

function ProductMobileCard({ product, categories, category, onCategoryChange, onDelete }: { product: ProductWithImages; categories: Category[]; category?: string; onCategoryChange: (categoryId: string | null) => void; onDelete: () => void }) {
  return (
    <div className="rounded-[13px] border border-black/8 bg-white p-3 dark:border-white/10 dark:bg-[#111820]">
      <div className="flex items-center gap-3">
        <Link href={`/admin/catalogo/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <ProductThumb product={product} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{product.name}</span>
            <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><strong className="font-semibold text-foreground">{formatCurrency(product.price)}</strong><span>·</span><span className="truncate">{category || 'Sin categoría'}</span></span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className={`size-1.5 rounded-full ${product.is_active ? 'bg-[#12e89a]' : 'bg-slate-300'}`} />{product.is_active ? 'Activo' : 'Oculto'}</span>
          </span>
        </Link>
        <button type="button" onClick={onDelete} className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10" aria-label={`Eliminar ${product.name}`}><Trash2 className="size-4" /></button>
      </div>
      <div className="mt-3 border-t border-black/6 pt-3 dark:border-white/7">
        <ProductCategorySelect productId={product.id} value={product.category_id} categories={categories} onChange={onCategoryChange} />
      </div>
    </div>
  )
}