import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminCategories, getAdminProductById } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/button'

export default async function EditProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { storeData } = await requireAuthenticatedAdminStore()

  const [product, categories] = await Promise.all([
    getAdminProductById(storeData.store.id, id),
    getAdminCategories(storeData.store.id),
  ])

  if (!product) notFound()

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-5 rounded-full text-muted-foreground hover:text-foreground dark:hover:text-white">
        <Link href="/admin/productos">
          <ArrowLeft className="mr-1.5 size-4" />
          Productos
        </Link>
      </Button>

      <AdminPageHeader
        title={product.name}
        description="Ajusta datos, imagenes y visibilidad sin perder el contexto del producto."
      />

      <div className="max-w-4xl">
        <ProductForm product={product} categories={categories} productId={product.id} />
      </div>
    </div>
  )
}
