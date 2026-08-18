import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminBrands, getAdminCategories, getAdminProductById } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { FloatingProductSubmit } from '@/components/admin/FloatingProductSubmit'
import { ProductForm } from '@/components/admin/ProductForm'
import { ProductPromotionPanel } from '@/components/admin/ProductPromotionPanel'

export default async function EditProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { storeData } = await requireAuthenticatedAdminStore()
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(storeData.store.id, id),
    getAdminCategories(storeData.store.id),
    getAdminBrands(storeData.store.id),
  ])

  if (!product) notFound()

  const scopeId = 'edit-product-form'

  return (
    <div className="volta-admin-page p-3.5 sm:p-5 lg:p-6">
      <Link href="/admin/catalogo" className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Productos</Link>
      <header className="mb-5 pr-36 sm:pr-44">
        <p className="admin-label">Editar producto</p>
        <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">{product.name}</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Cambiá ficha, categoría, marca, promoción y código interno desde el mismo producto.</p>
      </header>
      <div className="max-w-5xl">
        <ProductPromotionPanel product={product} />
        <div id={scopeId}>
          <ProductForm key={`${product.id}-${product.updated_at}`} product={product} categories={categories} brands={brands} productId={product.id} />
        </div>
      </div>
      <FloatingProductSubmit scopeId={scopeId} mode="save" />
    </div>
  )
}
