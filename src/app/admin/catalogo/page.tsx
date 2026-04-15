import Link from 'next/link'
import { Download, FolderTree, Package2, Plus, Upload } from 'lucide-react'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminActionGrid } from '@/components/admin/AdminActionGrid'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CategoriasList } from '@/components/admin/CategoriasList'
import { CsvImporter } from '@/components/admin/CsvImporter'
import { ProductList } from '@/components/admin/ProductList'
import { Button } from '@/components/ui/button'

export default async function CatalogoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()

  const [products, categories] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
  ])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        eyebrow="Catalogo"
        title="Todo lo que hace vendible tu oferta"
        description={`${products.length} producto${products.length !== 1 ? 's' : ''} cargado${products.length !== 1 ? 's' : ''}. Desde aqui agregas productos, ordenas categorias e importas en lote sin salir del flujo comercial.`}
        action={
          <Button asChild className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300">
            <Link href="/admin/catalogo/nuevo">
              <Plus className="mr-2 size-4" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <AdminActionGrid
        eyebrow="Que conviene hacer ahora"
        title="Empieza por la accion que mas te acerque a vender"
        description="Si ya tienes productos, ordenalos y agrupalos. Si vienes de otra plataforma o planilla, importa en lote sin abrir otra seccion."
        actions={[
          {
            href: '/admin/catalogo/nuevo',
            label: 'Agregar producto',
            description: 'Crea una ficha vendible con precio, imagen y opciones desde un solo flujo.',
            icon: Package2,
            tone: 'primary',
          },
          {
            href: '#categorias',
            label: 'Ordenar categorias',
            description: 'Agrupa el catalogo para que la tienda se entienda mejor cuando compartas el link.',
            icon: FolderTree,
          },
          {
            href: '#importar',
            label: 'Importar por CSV',
            description: 'Sube varios productos juntos como accion secundaria, sin crear otra pantalla aparte.',
            icon: Upload,
            badge: 'Secundaria',
          },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <div className="admin-surface rounded-xl p-5 sm:p-6">
            <p className="admin-label">Productos</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Lo que el cliente puede comprar</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Filtra por estado o categoria y entra directo a editar lo importante.
            </p>
          </div>
          <ProductList products={products} categories={categories} />
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section id="categorias" className="admin-surface rounded-xl p-5 sm:p-6">
            <p className="admin-label">Categorias</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Ordena el recorrido del catalogo</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sirven para agrupar colecciones, filtrar mejor y hacer que la oferta se lea mas rapido.
            </p>
          </section>
          <CategoriasList categories={categories} />

          <section id="importar" className="admin-surface rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="admin-label">Importacion secundaria</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">Importa varios productos juntos</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Descarga la plantilla, ajusta tu archivo y subelo aqui mismo cuando quieras acelerar la carga.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground">
                <Download className="size-3.5" />
                CSV
              </div>
            </div>

            <div className="mt-5 border-t border-white/8 pt-5">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="size-4 text-emerald-400" />
                Plantilla + importador dentro del mismo flujo de catalogo
              </div>
              <CsvImporter />
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
