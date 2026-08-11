import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import { getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
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
    <div className="volta-admin-page space-y-5 p-3.5 sm:p-5 lg:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-label">Productos</p>
          <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">Tu catálogo</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{products.length} {products.length === 1 ? 'producto cargado' : 'productos cargados'}.</p>
        </div>
        <Button asChild className="h-10 rounded-[10px] bg-[#12e89a] px-4 text-sm font-semibold text-[#062117] shadow-none hover:bg-[#0fd98f]">
          <Link href="/admin/catalogo/nuevo"><Plus className="size-4" />Nuevo producto</Link>
        </Button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <section className="min-w-0">
          <ProductList products={products} categories={categories} />
        </section>

        <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
          <section id="categorias" className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Categorías</p>
              <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">Ordená el catálogo</h2>
            </div>
            <CategoriasList categories={categories} />
          </section>

          <details id="importar" className="group rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
            <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium text-foreground">
              <span className="flex size-8 items-center justify-center rounded-[9px] bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-white/50"><Upload className="size-4" /></span>
              <span className="flex-1">Importar productos por CSV</span>
              <span className="text-xs text-muted-foreground transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-4 border-t border-black/7 pt-4 dark:border-white/8">
              <CsvImporter />
            </div>
          </details>
        </aside>
      </div>
    </div>
  )
}
