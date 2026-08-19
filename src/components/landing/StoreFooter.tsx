import { Clock3, MapPin, MessageCircle, Package, Rows3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type StoreFooterProps = { store: Store; containerClass: string; productCount: number; categoryCount: number }

export function StoreFooter({ store, containerClass, productCount, categoryCount }: StoreFooterProps) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const rawInstagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : ''
  const instagram = /^[a-zA-Z0-9._]{2,30}$/.test(rawInstagram) ? rawInstagram : null
  const details = [
    store.address ? { icon: MapPin, label: store.address } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
    categoryCount > 1 ? { icon: Rows3, label: `${categoryCount} categorías` } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <footer className="border-t" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-footer-bg-gradient)' }}>
      <div className={cn('mx-auto px-4 py-8 sm:px-6 sm:py-11', containerClass)}>
        <div className="overflow-hidden rounded-[calc(var(--store-card-radius)*0.86)] border" style={{ borderColor: 'var(--store-card-border)', background: 'linear-gradient(145deg, color-mix(in srgb, var(--store-surface) 94%, transparent), color-mix(in srgb, var(--store-bg) 88%, transparent))', boxShadow: '0 20px 55px color-mix(in srgb, var(--store-text) 5%, transparent)' }}>
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1.15fr)_minmax(260px,.85fr)] md:items-end">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--store-muted-text)' }}>Tienda</p>
              <p className="store-heading mt-2 text-xl font-semibold sm:text-2xl" style={{ color: 'var(--store-text)' }}>{store.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-soft-text)', background: 'color-mix(in srgb, var(--store-bg) 62%, transparent)' }}><Package className="size-3.5" style={{ color: 'var(--store-primary)' }} />{productCount} {productCount === 1 ? 'producto disponible' : 'productos disponibles'}</span>
                {details.map((item) => { const Icon = item.icon; return <span key={item.label} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-soft-text)', background: 'color-mix(in srgb, var(--store-bg) 62%, transparent)' }}><Icon className="size-3.5" style={{ color: 'var(--store-primary)' }} />{item.label}</span> })}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              {phone ? <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="store-button inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold transition hover:-translate-y-0.5" style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}><MessageCircle className="size-4" /> WhatsApp</a> : null}
              {instagram ? <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="store-button inline-flex min-h-11 items-center justify-center gap-2 border px-4 text-sm font-semibold transition hover:-translate-y-0.5" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)', background: 'color-mix(in srgb, var(--store-surface) 82%, transparent)' }}><InstagramIcon className="size-4" /> @{instagram}</a> : null}
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t px-5 py-4 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-muted-text)' }}><span>Pedido directo al negocio · pago y entrega coordinados por WhatsApp.</span><span className="font-semibold tracking-[0.08em]">VOLTA STORE</span></div>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" style={{ color: 'var(--store-primary)' }}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
}
