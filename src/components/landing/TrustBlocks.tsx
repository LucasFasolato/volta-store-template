import { AtSign, Clock3, MapPin, MessageCircle, Package, Rows3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type TrustBlocksProps = {
  store: Store
  productCount: number
  categoryCount: number
  featuredCount: number
  containerClass: string
}

export function TrustBlocks({
  store,
  productCount,
  categoryCount,
  featuredCount,
  containerClass,
}: TrustBlocksProps) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null

  const commerceItems = [
    `${productCount} ${productCount === 1 ? 'producto listo para pedir' : 'productos listos para pedir'}`,
    categoryCount > 1 ? `${categoryCount} categorias para recorrer` : null,
    featuredCount > 0 ? `${featuredCount} destacados al inicio` : null,
  ].filter(Boolean) as string[]

  const contactItems = [
    phone ? { icon: MessageCircle, label: store.whatsapp, href: `https://wa.me/${phone}` } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
    instagram ? { icon: AtSign, label: `@${instagram}`, href: `https://instagram.com/${instagram}` } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; href?: string }>

  const deliveryItems = [
    store.address ? { icon: MapPin, label: store.address } : null,
    phone ? { icon: MessageCircle, label: 'Coordinas envio o retiro por WhatsApp' } : null,
    !store.address && !phone ? { icon: Package, label: 'Consulta disponibilidad y entrega antes de pagar' } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <section className="py-8 sm:py-10">
      <div className={cn('mx-auto px-4 sm:px-6', containerClass)}>
        <div className="grid gap-3 lg:grid-cols-3">
          <InfoCard
            eyebrow="Catalogo activo"
            title="Todo lo importante para comprar esta visible."
            body="La tienda prioriza producto, precio y contacto directo para resolver el pedido mas rapido."
          >
            <ul className="space-y-2.5">
              {commerceItems.map((item) => (
                <InfoRow key={item} icon={Package}>
                  {item}
                </InfoRow>
              ))}
            </ul>
          </InfoCard>

          <InfoCard
            eyebrow="Atencion"
            title={phone ? 'Hablas directo con el negocio.' : 'Tienda lista para consultar.'}
            body={
              phone
                ? 'Cuando quieras cerrar la compra, el pedido viaja directo por WhatsApp.'
                : 'Explora el catalogo y usa los datos visibles para contactar al negocio.'
            }
          >
            <div className="space-y-2.5">
              {contactItems.length > 0 ? (
                contactItems.map((item) =>
                  item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group block rounded-[16px] border px-3.5 py-3 transition hover:-translate-y-0.5"
                      style={{
                        borderColor: 'var(--store-card-border)',
                        backgroundColor: 'color-mix(in srgb, var(--store-surface) 72%, transparent)',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
                        <span className="text-sm font-medium text-foreground group-hover:opacity-100" style={{ color: 'var(--store-text)' }}>
                          {item.label}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <InfoRow key={item.label} icon={item.icon}>
                      {item.label}
                    </InfoRow>
                  ),
                )
              ) : (
                <InfoRow icon={MessageCircle}>La forma de contacto se define al momento de comprar.</InfoRow>
              )}
            </div>
          </InfoCard>

          <InfoCard
            eyebrow="Compra y entrega"
            title="Sabes como seguir sin perderte."
            body="El flujo esta pensado para que explores, armes el pedido y coordines lo necesario con informacion visible."
          >
            <div className="space-y-2.5">
              {deliveryItems.map((item) => (
                <InfoRow key={item.label} icon={item.icon}>
                  {item.label}
                </InfoRow>
              ))}
              <InfoRow icon={Rows3}>Agrega productos al carrito y envia el pedido cuando estes listo.</InfoRow>
            </div>
          </InfoCard>
        </div>
      </div>
    </section>
  )
}

function InfoCard({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <article
      className="store-card h-full p-5 sm:p-6"
      style={{
        background: 'var(--store-card-background)',
        border: '1px solid var(--store-card-border)',
        boxShadow: 'var(--store-card-shadow)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>
        {eyebrow}
      </p>
      <h2 className="store-heading mt-3 text-xl font-semibold tracking-tight sm:text-[1.45rem]" style={{ color: 'var(--store-text)' }}>
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
        {body}
      </p>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[16px] border px-3.5 py-3"
      style={{
        borderColor: 'var(--store-card-border)',
        backgroundColor: 'color-mix(in srgb, var(--store-surface) 72%, transparent)',
      }}
    >
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
      <span className="text-sm leading-6" style={{ color: 'var(--store-text)' }}>
        {children}
      </span>
    </div>
  )
}
