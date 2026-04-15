import { AtSign, Clock3, MapPin, MessageCircle, Package, Rows3, ShieldCheck } from 'lucide-react'
import { sanitizeInstagramHandle, sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store, StoreContent } from '@/types/store'

type TrustItem = {
  icon: React.ElementType
  label: string
}

const SPEED_TO_DURATION: Record<string, string> = {
  slow: '28s',
  normal: '20s',
  fast: '14s',
}

export function TrustBar({
  store,
  content,
  productCount,
  categoryCount,
}: {
  store: Store
  content: Pick<StoreContent, 'banner_mode' | 'banner_speed'>
  productCount: number
  categoryCount: number
}) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null
  const isAnimated = content.banner_mode === 'animated'
  const duration = SPEED_TO_DURATION[content.banner_speed] ?? SPEED_TO_DURATION.normal

  const items: TrustItem[] = [
    phone ? { icon: MessageCircle, label: 'Compra directa por WhatsApp' } : { icon: ShieldCheck, label: 'Compra directa al negocio' },
    { icon: Package, label: `${productCount} ${productCount === 1 ? 'producto disponible' : 'productos disponibles'}` },
    categoryCount > 1 ? { icon: Rows3, label: `${categoryCount} categorias para explorar` } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
    store.address ? { icon: MapPin, label: store.address } : null,
    instagram ? { icon: AtSign, label: `Instagram @${instagram}` } : null,
  ].filter(Boolean) as TrustItem[]

  const display = items.slice(0, 5)

  return (
    <div
      className="border-y"
      style={{
        borderColor: 'var(--store-card-border)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 62%, transparent), color-mix(in srgb, var(--store-bg) 92%, transparent))',
      }}
    >
      {isAnimated ? (
        <div
          className="overflow-hidden"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
        >
          <div className="store-marquee-track" style={{ ['--marquee-duration' as string]: duration }}>
            <TrustItemsRow items={display} />
            <TrustItemsRow items={display} ariaHidden />
          </div>
        </div>
      ) : (
        <div className="flex items-stretch overflow-x-auto">
          <div className="mx-auto flex min-w-max items-stretch">
            <TrustItemsRow items={display} staticRow />
          </div>
        </div>
      )}
    </div>
  )
}

function TrustItemsRow({
  items,
  ariaHidden = false,
  staticRow = false,
}: {
  items: TrustItem[]
  ariaHidden?: boolean
  staticRow?: boolean
}) {
  return (
    <div aria-hidden={ariaHidden} className={staticRow ? 'flex items-stretch' : 'flex shrink-0 items-stretch'}>
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={`${item.label}-${index}-${ariaHidden ? 'ghost' : 'main'}`}
            className="flex items-center gap-2.5 px-5 py-4 sm:px-7 sm:py-5"
            style={{ borderRight: '1px solid var(--store-card-border)' }}
          >
            <Icon className="size-4 shrink-0" style={{ color: 'var(--store-primary)' }} />
            <span
              className="whitespace-nowrap text-[12px] font-medium sm:text-[13px]"
              style={{ color: 'var(--store-soft-text)' }}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
