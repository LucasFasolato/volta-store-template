import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getStoreCommercialAccess } from '@/lib/billing/commercial-access'
import { FREE_PLAN } from '@/lib/billing/plan'
import { getAdminBrands, getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { FloatingProductSubmit } from '@/components/admin/FloatingProductSubmit'
import { PlanUpgradePrompt } from '@/components/admin/PlanUpgradePrompt'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NuevoProductoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const [categories, brands, products, commercialAccess] = await Promise.all([
    getAdminCategories(storeData.store.id),
    getAdminBrands(storeData.store.id),
    getAdminProducts(storeData.store.id),
    getStoreCommercialAccess(storeData.store.id),
  ])
  const scopeId = 'new-product-form'
  const freeLimitReached = commercialAccess.planCode === 'free' && products.length >= FREE_PLAN.productLimit

  return (
    <div className="volta-admin-page p-3.5 sm:p-5 lg:p-6">
      <Link href="/admin/catalogo" className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Productos</Link>
      <header className="mb-5 pr-36 sm:pr-44">
        <p className="admin-label">Productos</p>
        <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Nuevo producto</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Imagen, nombre y precio primero. Categoría y marca quedan en el mismo flujo cuando las necesitás.</p>
      </header>

      {freeLimitReached ? (
        <div className="max-w-3xl">
          <PlanUpgradePrompt
            title={`Ya publicaste los ${FREE_PLAN.productLimit} productos incluidos en Gratis.`}
            description="Tu catálogo ya está creciendo. Con VOLTA podés seguir cargando productos sin límite artificial, sumar más imágenes y acceder a las herramientas completas para vender."
          />
        </div>
      ) : (
        <>
          <div id={scopeId} className="max-w-5xl"><ProductForm categories={categories} brands={brands} /></div>
          <FloatingProductSubmit scopeId={scopeId} />
        </>
      )}
    </div>
  )
}
