import { StoreAnalyticsPanel } from '@/components/admin/StoreAnalyticsPanel'
import { getStoreAnalytics } from '@/lib/queries/analytics'
import { getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'

export default async function RendimientoPage() {
  const { storeData } = await requireAuthenticatedAdminStore()
  const products = await getAdminProducts(storeData.store.id)
  const analytics = await getStoreAnalytics(storeData.store.id, products)

  return (
    <div className="space-y-5 p-3.5 sm:p-5 lg:p-6">
      <section className="rounded-[20px] border border-black/8 bg-[#0d151b] p-5 text-white shadow-sm sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#75f5c5]">Rendimiento comercial</p>
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">Entendé qué miran tus clientes y dónde se pierde una venta.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">VOLTA sigue pocas señales importantes: visitas, productos abiertos, agregados al carrito y personas que avanzan a WhatsApp. Después te muestra qué conviene hacer.</p>
      </section>
      <StoreAnalyticsPanel analytics={analytics} />
    </div>
  )
}
