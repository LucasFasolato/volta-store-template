import { Eye, Link2, MessageCircle } from 'lucide-react'
import { AdminActionGrid } from '@/components/admin/AdminActionGrid'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ConfigForm } from '@/components/admin/ConfigForm'
import type { Store } from '@/types/store'

export function ConfigurationPage({ store }: { store: Store }) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Negocio"
        title="Lo minimo que tu negocio necesita para vender"
        description="Aqui dejas claros tus datos, tu canal de pedidos y la informacion basica que reduce dudas antes del primer mensaje."
      />
      <AdminActionGrid
        eyebrow="Que conviene hacer ahora"
        title="Resuelve primero lo que impacta directo en la venta"
        description="Si el cliente no sabe como escribirte, cuando atiendes o que URL compartir, la tienda pierde claridad. Esta pantalla ordena eso primero."
        actions={[
          {
            href: '#canales',
            label: 'Configurar WhatsApp',
            description: 'Es el canal principal para recibir pedidos. Dejalo impecable antes de compartir la tienda.',
            icon: MessageCircle,
            tone: 'primary',
          },
          {
            href: '#identidad',
            label: 'Revisar enlace publico',
            description: 'Confirma nombre y URL para compartir un link claro y estable.',
            icon: Link2,
          },
          {
            href: '/admin/vista-previa',
            label: 'Probar como comprador',
            description: 'Abre la vista previa y valida que los datos del negocio se lean con confianza.',
            icon: Eye,
            target: '_blank',
          },
        ]}
      />
      <div className="max-w-[1200px]">
        <ConfigForm store={store} />
      </div>
    </div>
  )
}
