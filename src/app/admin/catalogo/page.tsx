import Link from 'next/link'
import { Boxes, LayoutPanelTop, Plus, Shapes, Tags, Upload } from 'lucide-react'
import { getAdminBrands, getAdminCategories, getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { BrandsList } from '@/components/admin/BrandsList'
import { CatalogPresentation } from '@/components/admin/CatalogPresentation'
import { CategoriasList } from '@/components/admin/CategoriasList'
import { CsvImporter } from '@/components/admin/CsvImporter'
import { ProductList } from '@/components/admin/ProductList'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CatalogMode } from '@/lib/actions/catalog-presentation'

type CatalogTab = 'productos' | 'categorias' | 'marcas' | 'presentacion' | 'importar'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TABS: Array<{
  value: CatalogTab
  label: string
  icon: typeof Boxes
}> = [
  { value: 'productos', label: 'Productos', icon: Boxes },
  { value: 'categorias', label: 'Categorías', icon: Shapes },
  { value: 'marcas', label: 'Marcas', icon: Tags },
  { value: 'presentacion', label: 'Presentación', icon: LayoutPanelTop },
  { value: 'importar', label: 'Importar', icon: Upload },
]

function resolveTab(rawTab: string | string[] | undefined): CatalogTab {
  const value = Array.isArray(rawTab) ? rawTab[0] : rawTab
  return TABS.some((tab) => tab.value === value) ? (value as CatalogTab) : 'productos'
}

export default async function CatalogoPage({ searchParams }: Props) {
  const { storeData } = await requireAuthenticatedAdminStore()
  const resolvedSearchParams = await searchParams
  const activeTab = resolveTab(resolvedSearchParams.tab)
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(storeData.store.id),
    getAdminCategories(storeData.store.id),
    getAdminBrands(storeData.store.id),
  ])
  const layout = storeData.layout as unknown as {
    catalog_mode?: CatalogMode
    show_catalog_search?: boolean
    show_catalog_brands?: boolean
  }
  const catalogMode = (layout.catalog_mode ?? 'all') as CatalogMode
  const showCatalogSearch = layout.show_catalog_search ?? true
  const showCatalogBrands = layout.show_catalog_brands ?? false

  return (
    <div className="volta-admin-page space-y-4 p-3.5 sm:p-5 lg:p-6 xl:p-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-label">Catálogo</p>
          <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.055em] text-foreground sm:text-[2.2rem]">
            Organizá tus productos
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
            Productos, categorías y marcas viven en el mismo lugar, sin obligarte a recorrer una página interminable.
          </p>
        </div>
        {activeTab === 'productos' ? (
          <Button asChild className="h-10 rounded-[10px] bg-[#12e89a] px-4 text-sm font-semibold text-[#062117] shadow-none hover:bg-[#0fd98f]">
            <Link href="/admin/catalogo/nuevo"><Plus className="size-4" />Nuevo producto</Link>
          </Button>
        ) : null}
      </header>

      <nav
        className="sticky top-12 z-30 -mx-1 overflow-x-auto rounded-[14px] border border-black/8 bg-white/95 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#111820]/95 lg:top-3"
        aria-label="Secciones del catálogo"
      >
        <div className="flex min-w-max gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.value
            return (
              <Link
                key={tab.value}
                href={tab.value === 'productos' ? '/admin/catalogo' : `/admin/catalogo?tab=${tab.value}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3.5 text-xs font-semibold transition sm:text-sm',
                  active
                    ? 'bg-[#10161d] text-white shadow-sm dark:bg-white dark:text-[#10161d]'
                    : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-white/5',
                )}
              >
                <Icon className={cn('size-4', active && 'text-[#12e89a]')} />
                {tab.label}
                {tab.value === 'productos' ? <span className="text-[10px] opacity-60">{products.length}</span> : null}
                {tab.value === 'categorias' && categories.length > 0 ? <span className="text-[10px] opacity-60">{categories.length}</span> : null}
                {tab.value === 'marcas' && brands.length > 0 ? <span className="text-[10px] opacity-60">{brands.length}</span> : null}
              </Link>
            )
          })}
        </div>
      </nav>

      {activeTab === 'productos' ? (
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Productos</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{products.length} {products.length === 1 ? 'producto cargado' : 'productos cargados'}.</p>
            </div>
          </div>
          <ProductList products={products} categories={categories} brands={brands} />
        </section>
      ) : null}

      {activeTab === 'categorias' ? (
        <section className="max-w-6xl rounded-[16px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6">
          <div className="mb-5 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Categorías</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">Ordená el catálogo por tipo de producto</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Son opcionales. Crealas solo cuando ayuden al cliente a encontrar más rápido lo que busca.</p>
          </div>
          <CategoriasList categories={categories} />
        </section>
      ) : null}

      {activeTab === 'marcas' ? (
        <section className="max-w-6xl rounded-[16px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6">
          <div className="mb-5 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Marcas</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">Organizá por marca cuando aporte valor</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Ideal para distribuidores y tiendas con varias líneas. Si no las necesitás, no tenés que configurar nada.</p>
          </div>
          <BrandsList brands={brands} />
        </section>
      ) : null}

      {activeTab === 'presentacion' ? (
        <div className="max-w-7xl">
          <CatalogPresentation
            initialMode={catalogMode}
            initialShowSearch={showCatalogSearch}
            initialShowBrands={showCatalogBrands}
            brandCount={brands.length}
            categories={categories}
            products={products}
          />
        </div>
      ) : null}

      {activeTab === 'importar' ? (
        <section className="max-w-5xl rounded-[16px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6">
          <div className="mb-5 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Importar</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">Carga masiva por CSV</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Usalo cuando tengas muchos productos. Para cargas puntuales, “Nuevo producto” sigue siendo el camino más rápido.</p>
          </div>
          <CsvImporter />
        </section>
      ) : null}
    </div>
  )
}
