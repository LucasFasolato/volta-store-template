import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CsvImporter } from '@/components/admin/CsvImporter'

export default async function ImportarPage() {
  await requireAuthenticatedAdminStore()

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <AdminPageHeader
        title="Importar productos"
        description="Subí un CSV para cargar productos en masa. Podés usar la plantilla como punto de partida."
      />

      <div className="max-w-3xl">
        <CsvImporter />
      </div>
    </div>
  )
}
