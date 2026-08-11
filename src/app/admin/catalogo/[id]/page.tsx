import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminCategories, getAdminProductById } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function EditProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { storeData } = await requireAuthenticatedAdminStore()
  const [product, categories] = await Promise.all([
    getAdminProductById(storeData.store.id, id),
    getAdminCategories(storeData.store.id),
  ])

  if (!product) notFound()

  return (
    <div className="volta-admin-page p-3.5 sm:p-5 lg:p-6">
      <Link href="/admin/catalogo" className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Productos</Link>
      <header className="mb-5">
        <p className="admin-label">Editar producto</p>
        <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">{product.name}</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Cambiá lo esencial rápido y abrí opciones avanzadas solo cuando hagan falta.</p>
      </header>
      <div className="max-w-5xl"><ProductForm product={product} categories={categories} productId={product.id} /></div>
    </div>
  )
}
