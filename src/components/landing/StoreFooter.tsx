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
    <footer className="pt-8 sm:pt-12">
      <div className={cn('mx-auto px-4 pb-8 sm:px-6 sm:pb-12', containerClass)}>
        <div
          className="overflow-hidden rounded-[34px] border px-6 py-8 sm:px-8 sm:py-10"
          style={{
            borderColor: 'var(--store-border)',
            background:
              'linear-gradient(145deg, color-mix(in srgb, var(--store-bg) 88%, white 12%), color-mix(in srgb, var(--store-bg) 92%, var(--store-text) 8%))',
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--store-secondary)' }}>
                {store.name}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: 'var(--store-text)' }}>
                Compra simple, conversacion directa y cierre rapido.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7" style={{ color: 'color-mix(in srgb, var(--store-text) 70%, transparent)' }}>
                El pedido llega por WhatsApp con los productos y total estimado listos para continuar la atencion sin fricciones.
              </p>
            </div>

            <FooterColumn title="Contacto">
              {phone ? (
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3"
                  style={{ color: 'var(--store-text)' }}
                >
                  <MessageCircle className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
                  WhatsApp
                </a>
              ) : null}
              {instagram ? (
                <a
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3"
                  style={{ color: 'var(--store-text)' }}
                >
                  <AtSign className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
                  @{instagram}
                </a>
              ) : null}
              {store.address ? (
                <div className="flex items-start gap-3" style={{ color: 'var(--store-text)' }}>
                  <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
                  {store.address}
                </div>
              ) : null}
            </FooterColumn>

            <FooterColumn title="Atencion">
              {store.hours ? (
                <div className="flex items-start gap-3" style={{ color: 'var(--store-text)' }}>
                  <Clock className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
                  {store.hours}
                </div>
              ) : (
                <p style={{ color: 'color-mix(in srgb, var(--store-text) 65%, transparent)' }}>
                  Configura horarios en el admin para sumar confianza y contexto.
                </p>
              )}
            </FooterColumn>
          </div>

          <div
            className="mt-8 border-t pt-5 text-xs"
            style={{
              borderColor: 'var(--store-border)',
              color: 'color-mix(in srgb, var(--store-text) 45%, transparent)',
            }}
          >
            Powered by Volta Store
          </div>
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
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
