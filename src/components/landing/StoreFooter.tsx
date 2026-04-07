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
      className="border-t"
      style={{
        borderColor: 'var(--store-card-border)',
        background: 'var(--store-footer-bg-gradient)',
      }}
    >
      <div className={cn('mx-auto px-4 py-12 sm:px-6 sm:py-16', containerClass)}>
        {/* WhatsApp CTA block */}
        {phone ? (
          <div
            className="mb-12 flex flex-col gap-5 rounded-[calc(var(--store-card-radius)*0.9)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--store-surface) 72%, transparent), color-mix(in srgb, var(--store-bg) 90%, transparent))',
              border: '1px solid var(--store-card-border)',
            }}
          >
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--store-muted-text)' }}
              >
                ¿Listo para pedir?
              </p>
              <p className="mt-2 text-base font-semibold" style={{ color: 'var(--store-text)' }}>
                Escribinos directamente por WhatsApp.
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
                Te respondemos rápido con toda la info que necesitás.
              </p>
            </div>
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(145deg, #25D366, #1db954)',
                color: '#ffffff',
                boxShadow: '0 14px 32px rgba(37, 211, 102, 0.22)',
              }}
            >
              <MessageCircle className="size-4" />
              Pedir por WhatsApp
            </a>
          </div>
        ) : null}

        {/* Three-column grid */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
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
              Pedí directo, sin intermediarios.
            </h2>
            <p
              className="mt-4 max-w-xl text-sm leading-7 sm:text-[15px]"
              style={{ color: 'var(--store-soft-text)' }}
            >
              Tu pedido va directo al vendedor por WhatsApp. Sin cargos extra ni pasos innecesarios.
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
            {store.address ? (
              <FooterRow icon={<MapPin className="size-4" />}>{store.address}</FooterRow>
            ) : null}
          </FooterColumn>

          {store.hours ? (
            <FooterColumn title="Atención">
              <FooterRow icon={<Clock className="size-4" />}>{store.hours}</FooterRow>
            </FooterColumn>
          ) : null}
        </div>

        <div
          className="mt-10 flex flex-col gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: 'var(--store-card-border)',
            color: 'var(--store-muted-text)',
          }}
        >
          <span>Powered by Volta Store</span>
          <span>Catálogo premium con cierre conversacional</span>
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
