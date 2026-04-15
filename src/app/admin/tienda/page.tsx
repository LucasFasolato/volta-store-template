import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AppearanceEditor, type AppearanceEditorTab } from '@/components/admin/AppearanceEditor'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const VALID_TABS: AppearanceEditorTab[] = [
  'estilos',
  'contenido',
  'colores',
  'productos',
  'layout',
  'fuentes',
  'avanzado',
]

export default async function TiendaPage({ searchParams }: Props) {
  const { storeData } = await requireAuthenticatedAdminStore()
  const resolvedSearchParams = await searchParams
  const rawTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab
  const initialTab = VALID_TABS.includes(rawTab as AppearanceEditorTab)
    ? (rawTab as AppearanceEditorTab)
    : undefined

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <AppearanceEditor
        content={storeData.content}
        initialTab={initialTab}
        store={storeData.store}
        theme={storeData.theme}
        layout={storeData.layout}
      />
    </div>
  )
}
