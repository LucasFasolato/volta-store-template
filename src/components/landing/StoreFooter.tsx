import { AtSign, Clock, MapPin, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type StoreFooterProps = { store: Store; containerClass: string; productCount: number; categoryCount: number }

export function StoreFooter({ store, containerClass, productCount }: StoreFooterProps) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null
  const details = [store.address ? { icon: MapPin, label: store.address } : null, store.hours ? { icon: Clock, label: store.hours } : null].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <footer className="border-t" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-footer-bg-gradient)' }}>
      <div className={cn('mx-auto px-4 py-7 sm:px-6 sm:py-9', containerClass)}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="store-heading text-lg font-semibold" style={{ color: 'var(--store-text)' }}>{store.name}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--store-soft-text)' }}>{productCount} {productCount === 1 ? 'producto disponible' : 'productos disponibles'}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {phone ? <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 font-medium" style={{ color: 'var(--store-text)' }}><MessageCircle className="size-4" style={{ color: 'var(--store-primary)' }} />WhatsApp</a> : null}
            {instagram ? <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 font-medium" style={{ color: 'var(--store-text)' }}><AtSign className="size-4" style={{ color: 'var(--store-primary)' }} />@{instagram}</a> : null}
          </div>
        </div>
        {details.length > 0 ? <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-muted-text)' }}>{details.map((item) => { const Icon = item.icon; return <span key={item.label} className="inline-flex items-center gap-2"><Icon className="size-3.5" />{item.label}</span> })}</div> : null}
        <div className="mt-4 border-t pt-4 text-[11px]" style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-muted-text)' }}>Creado con VOLTA STORE</div>
      </div>
    </footer>
  )
}
