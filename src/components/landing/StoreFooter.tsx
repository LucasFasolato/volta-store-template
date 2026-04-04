import { AtSign, Clock, MapPin, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type StoreFooterProps = {
  store: Store
  containerClass: string
}

export function StoreFooter({ store, containerClass }: StoreFooterProps) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null

  return (
    <footer
      className="mt-12 border-t"
      style={{
        borderColor: 'var(--store-card-border)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--store-bg) 96%, transparent), color-mix(in srgb, var(--store-surface) 92%, var(--store-text) 8%))',
      }}
    >
      <div className={cn('mx-auto px-4 py-12 sm:px-6 sm:py-16', containerClass)}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--store-secondary)' }}>
              {store.name}
            </p>
            <h2 className="store-heading mt-3 text-3xl font-semibold tracking-tight sm:text-[2.3rem]" style={{ color: 'var(--store-text)' }}>
              Cierre simple, claro y con mas autoridad de marca.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 sm:text-[15px]" style={{ color: 'var(--store-soft-text)' }}>
              El cliente llega al final con contexto, confianza y un canal directo para seguir la conversacion sin fricciones.
            </p>
          </div>

          <FooterColumn title="Contacto">
            {phone ? (
              <FooterLink
                href={`https://wa.me/${phone}`}
                icon={<MessageCircle className="size-4" />}
                label="WhatsApp"
              />
            ) : null}
            {instagram ? (
              <FooterLink
                href={`https://instagram.com/${instagram}`}
                icon={<AtSign className="size-4" />}
                label={`@${instagram}`}
              />
            ) : null}
            {store.address ? <FooterRow icon={<MapPin className="size-4" />}>{store.address}</FooterRow> : null}
          </FooterColumn>

          <FooterColumn title="Atencion">
            {store.hours ? (
              <FooterRow icon={<Clock className="size-4" />}>{store.hours}</FooterRow>
            ) : (
              <p style={{ color: 'var(--store-soft-text)' }}>
                Configura horarios en el admin para sumar confianza y contexto operativo.
              </p>
            )}
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
          <span>Catalogo premium con cierre conversacional</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4 text-sm leading-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--store-muted-text)' }}>
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function FooterLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 transition hover:opacity-90"
      style={{ color: 'var(--store-text)' }}
    >
      <span style={{ color: 'var(--store-primary)' }}>{icon}</span>
      {label}
    </a>
  )
}

function FooterRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3" style={{ color: 'var(--store-text)' }}>
      <span style={{ color: 'var(--store-primary)' }}>{icon}</span>
      <span>{children}</span>
    </div>
  )
}
