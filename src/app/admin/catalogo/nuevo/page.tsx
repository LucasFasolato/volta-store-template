import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminCategories } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NuevoProductoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const categories = await getAdminCategories(storeData.store.id)

  return (
    <div className="volta-admin-page p-3.5 sm:p-5 lg:p-6">
      <Link href="/admin/catalogo" className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Productos</Link>
      <header className="mb-5">
        <p className="admin-label">Productos</p>
        <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Nuevo producto</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Imagen, nombre y precio primero. El resto aparece solo cuando lo necesitás.</p>
      </header>
      <div className="max-w-5xl"><ProductForm categories={categories} /></div>
    </div>
  )
}
