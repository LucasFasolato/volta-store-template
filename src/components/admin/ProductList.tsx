'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Eye, EyeOff, Package2, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteProduct } from '@/lib/actions/products'
import { formatCurrency } from '@/lib/utils/format'
import type { Category, ProductWithImages } from '@/types/store'

type ProductListProps = {
  products: ProductWithImages[]
  categories: Category[]
}

export function ProductList({ products, categories }: ProductListProps) {
  const [localProducts, setLocalProducts] = useState(products)
  const [filter, setFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<ProductWithImages | null>(null)

  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category.name]))
  const hasProducts = localProducts.length > 0

  const filtered =
    filter === 'all'
      ? localProducts
      : filter === 'active'
        ? localProducts.filter((product) => product.is_active)
        : filter === 'featured'
          ? localProducts.filter((product) => product.is_featured)
          : localProducts.filter((product) => product.category_id === filter)

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

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Activos' },
            { value: 'featured', label: 'Destacados' },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={
                filter === item.value
                  ? 'rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200'
                  : 'rounded-full border border-white/8 bg-white/4 px-4 py-2 text-sm font-medium text-neutral-400 transition hover:border-white/15 hover:text-white'
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Package2}
            title={hasProducts ? 'No hay productos para este filtro' : 'Tu catalogo todavia esta vacio'}
            description={
              hasProducts
                ? 'Prueba otra categoria o suma un producto activo para que aparezca en este listado.'
                : 'Agrega tu primer producto para que la tienda tenga algo real para vender y compartir.'
            }
            action={
              <Button asChild className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300">
                <Link href="/admin/productos/nuevo">
                  {hasProducts ? 'Agregar producto' : 'Agregar primer producto'}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => {
              const coverImage = product.images?.[0]?.url

              return (
                <article
                  key={product.id}
                  className="surface-panel-soft premium-ring rounded-[26px] p-4 transition hover:bg-white/6 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative size-[4.5rem] overflow-hidden rounded-[20px] bg-white/8 sm:size-20">
                      {coverImage ? (
                        <Image src={coverImage} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-white">{product.name}</h3>
                        {product.is_featured ? <Star className="size-4 text-amber-300" /> : null}
                        {product.badge ? (
                          <Badge className="border-0 bg-white/10 px-2 py-1 text-[11px] text-neutral-200">
                            {product.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="font-semibold text-emerald-300">
                          {formatCurrency(product.price)}
                        </span>
                        {product.category_id && categoryMap[product.category_id] ? (
                          <span className="text-neutral-400">{categoryMap[product.category_id]}</span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-neutral-500">
                          {product.is_active ? (
                            <>
                              <Eye className="size-4" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="size-4" />
                              Oculto
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Link href={`/admin/productos/${product.id}`}>
                          <Edit className="mr-2 size-4" />
                          Editar
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setProductToDelete(product)}
                        disabled={deletingId === product.id}
                        className="rounded-full text-neutral-400 hover:bg-red-400/10 hover:text-red-300"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setProductToDelete(null)
          }
        }}
        title={productToDelete ? `Eliminar ${productToDelete.name}` : 'Eliminar producto'}
        description="Este producto dejara de verse en la tienda y ya no podra agregarse a nuevos pedidos."
        confirmLabel="Eliminar producto"
        onConfirm={handleDelete}
        isPending={!!productToDelete && deletingId === productToDelete.id}
      />
    </>
  )
}
