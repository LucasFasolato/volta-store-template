import { AtSign, Clock3, MapPin, MessageCircle, Package, Rows3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type CompactTrustSectionProps = {
  store: Store
  productCount: number
  categoryCount: number
  containerClass: string
}

export function CompactTrustSection({
  store,
  productCount,
  categoryCount,
  containerClass,
}: CompactTrustSectionProps) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null
  const whatsappHref = phone ? `https://wa.me/${phone}` : null

  const infoItems = [
    {
      icon: Package,
      label: `${productCount} ${productCount === 1 ? 'producto listo para pedir' : 'productos listos para pedir'}`,
    },
    categoryCount > 1 ? { icon: Rows3, label: `${categoryCount} categorias para recorrer` } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
    store.address ? { icon: MapPin, label: store.address } : null,
    instagram ? { icon: AtSign, label: `Instagram @${instagram}` } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <section className="pb-6 pt-2 sm:pb-8">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div
          className="rounded-[var(--store-card-radius)] border p-4 sm:p-5"
          style={{
            borderColor: 'var(--store-card-border)',
            background: 'var(--store-card-background)',
            boxShadow: 'var(--store-card-shadow)',
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--store-muted-text)' }}
              >
                Compra y confianza
              </p>
              <h2
                className="store-heading mt-2 text-xl font-semibold tracking-tight"
                style={{ color: 'var(--store-text)' }}
              >
                {phone ? 'Hablas y compras directo con el negocio.' : 'Toda la informacion util esta visible para avanzar.'}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                {phone
                  ? 'Explora el catalogo, suma productos al carrito y envia el pedido por WhatsApp cuando estes listo.'
                  : 'Revisa el catalogo, usa los datos visibles del negocio y consulta disponibilidad si hace falta.'}
              </p>
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="store-button inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(145deg, #25D366, #1db954)',
                  color: '#ffffff',
                  boxShadow: '0 14px 32px rgba(37, 211, 102, 0.22)',
                }}
              >
                <MessageCircle className="size-4" />
                Consultar por WhatsApp
              </a>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {infoItems.map((item) => {
              const Icon = item.icon

              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--store-surface) 72%, transparent)',
                    color: 'var(--store-text)',
                    border: '1px solid var(--store-card-border)',
                  }}
                >
                  <Icon className="size-3.5 shrink-0" style={{ color: 'var(--store-primary)' }} />
                  {item.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
