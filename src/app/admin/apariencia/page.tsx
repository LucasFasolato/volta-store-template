import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AppearanceEditor } from '@/components/admin/AppearanceEditor'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AparienciaPage({ searchParams }: Props) {
  const { storeData } = await requireAuthenticatedAdminStore()
  const resolvedSearchParams = await searchParams
  const tab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab
  const initialTab = tab === 'contenido' ? 'contenido' : undefined

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
