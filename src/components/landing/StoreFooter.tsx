import { AtSign, Clock, MapPin, MessageCircle, Package, Rows3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type StoreFooterProps = {
  store: Store
  containerClass: string
  productCount: number
  categoryCount: number
}

export function StoreFooter({
  store,
  containerClass,
  productCount,
  categoryCount,
}: StoreFooterProps) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null

  return (
    <footer
      className="border-t"
      style={{
        borderColor: 'var(--store-card-border)',
        background: 'var(--store-footer-bg-gradient)',
      }}
    >
      <div className={cn('mx-auto px-4 py-12 sm:px-6 sm:py-16', containerClass)}>
        {phone ? (
          <div
            className="mb-12 overflow-hidden rounded-[var(--store-card-radius)]"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--store-primary) 8%, var(--store-surface)), color-mix(in srgb, var(--store-surface) 80%, var(--store-bg)))',
              border: '1px solid color-mix(in srgb, var(--store-primary) 14%, var(--store-card-border))',
            }}
          >
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: 'var(--store-primary)' }}
                >
                  Cierre directo
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight" style={{ color: 'var(--store-text)' }}>
                  Cuando estes listo, envias el pedido por WhatsApp.
                </p>
                <p className="mt-1 max-w-md text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                  El negocio confirma disponibilidad, pago y entrega en una sola conversacion.
                </p>
              </div>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(37,211,102,0.28)]"
                style={{
                  background: 'linear-gradient(145deg, #25D366, #1db954)',
                  color: '#ffffff',
                  boxShadow: '0 14px 32px rgba(37, 211, 102, 0.22)',
                }}
              >
                <MessageCircle className="size-[1.1rem]" />
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.9fr_0.85fr]">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--store-secondary)' }}
            >
              {store.name}
            </p>
            <h2
              className="store-heading mt-3 text-2xl font-semibold tracking-tight sm:text-[2rem]"
              style={{ color: 'var(--store-text)' }}
            >
              Una tienda pensada para elegir rapido y comprar directo.
            </h2>
            <p
              className="mt-4 max-w-xl text-sm leading-7 sm:text-[15px]"
              style={{ color: 'var(--store-soft-text)' }}
            >
              {productCount} {productCount === 1 ? 'producto visible' : 'productos visibles'}
              {categoryCount > 1 ? ` en ${categoryCount} categorias` : ''}. Todo el cierre se coordina con datos reales del negocio.
            </p>
          </div>

          <FooterColumn title="Contacto">
            {phone ? (
              <FooterLink href={`https://wa.me/${phone}`} icon={<MessageCircle className="size-4" />} label="WhatsApp" />
            ) : null}
            {instagram ? (
              <FooterLink href={`https://instagram.com/${instagram}`} icon={<AtSign className="size-4" />} label={`@${instagram}`} />
            ) : null}
            {store.address ? <FooterRow icon={<MapPin className="size-4" />}>{store.address}</FooterRow> : null}
            {store.hours ? <FooterRow icon={<Clock className="size-4" />}>{store.hours}</FooterRow> : null}
          </FooterColumn>

          <FooterColumn title="Compra">
            <FooterRow icon={<Package className="size-4" />}>
              Armas el pedido en el carrito y lo envias cuando quieras.
            </FooterRow>
            <FooterRow icon={<Rows3 className="size-4" />}>
              Explora el catalogo y coordina envio o retiro directamente con el negocio.
            </FooterRow>
          </FooterColumn>
        </div>

        <div
          className="mt-10 flex flex-col gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: 'var(--store-card-border)',
            color: 'var(--store-muted-text)',
          }}
        >
          <span>Powered by Volta Store</span>
          <span>Catalogo operativo con cierre conversacional</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-sm leading-6">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: 'var(--store-muted-text)' }}
      >
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function FooterLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 transition hover:opacity-90"
      style={{ color: 'var(--store-text)' }}
    >
      <span style={{ color: 'var(--store-primary)' }}>{icon}</span>
      {label}
    </a>
  )
}

function FooterRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3" style={{ color: 'var(--store-text)' }}>
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--store-primary)' }}>
        {icon}
      </span>
      <span>{children}</span>
    </div>
  )
}
