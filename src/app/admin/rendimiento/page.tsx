import { StoreAnalyticsPanel } from '@/components/admin/StoreAnalyticsPanel'
import { getStoreCommercialAccess } from '@/lib/billing/commercial-access'
import { getStoreAttribution } from '@/lib/queries/attribution'
import { getStoreAnalytics } from '@/lib/queries/analytics'
import { getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'

export default async function RendimientoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const products = await getAdminProducts(storeData.store.id)
  const [analytics, attribution, commercialAccess] = await Promise.all([
    getStoreAnalytics(storeData.store.id, products),
    getStoreAttribution(storeData.store.id),
    getStoreCommercialAccess(storeData.store.id),
  ])

  return (
    <div className="space-y-5 p-3.5 sm:p-5 lg:p-6">
      <section className="rounded-[20px] border border-black/8 bg-[#0d151b] p-5 text-white shadow-sm sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#75f5c5]">Rendimiento comercial</p>
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">Entendé qué miran tus clientes y dónde se pierde una venta.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">VOLTA empieza por una señal simple y suma profundidad cuando tu negocio la necesita.</p>
      </section>
      <StoreAnalyticsPanel analytics={analytics} attribution={attribution} planCode={commercialAccess.planCode} />
    </div>
  )
}
