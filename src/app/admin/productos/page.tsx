import Link from 'next/link'
import { Download, Plus, Upload } from 'lucide-react'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CsvImporter } from '@/components/admin/CsvImporter'
import { ProductList } from '@/components/admin/ProductList'
import { Button } from '@/components/ui/button'

export default async function ProductosPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        title="Productos"
        description={`${products.length} producto${products.length !== 1 ? 's' : ''} en tu catalogo. Carga a mano o importa varios por CSV desde este mismo lugar.`}
        action={
          <Button asChild className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300">
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 size-4" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <section className="mb-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-surface rounded-xl p-5 sm:p-6">
          <p className="admin-label">Carga manual</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Crea un producto en minutos</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Nombre, precio, portada y opciones si hacen falta. Lo esencial primero, sin ruido.
          </p>

          <Button asChild className="mt-5 rounded-full bg-emerald-400 text-black hover:bg-emerald-300">
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 size-4" />
              Crear producto
            </Link>
          </Button>
        </div>

        <details className="admin-surface rounded-xl p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
            <div>
              <p className="admin-label">Carga por CSV</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Importa varios productos juntos</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Descarga la plantilla, ajusta tu archivo y subelo sin salir de Productos.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground">
              <Upload className="size-3.5" />
              Abrir importador
            </div>
          </summary>

          <div className="mt-5 border-t border-white/8 pt-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="size-4 text-emerald-400" />
              Plantilla + importador en el mismo flujo
            </div>
            <CsvImporter />
          </div>
        </details>
      </section>

      <ProductList products={products} categories={categories} />
    </div>
  )
}
