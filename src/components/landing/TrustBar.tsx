import { Clock3, MapPin, MessageCircle, Package, ShieldCheck, Zap } from 'lucide-react'
import { sanitizePhoneNumber } from '@/lib/utils/format'
import type { Store } from '@/types/store'

type TrustItem = {
  icon: React.ElementType
  label: string
}

export function TrustBar({ store }: { store: Store }) {
  const phone = store.whatsapp ? sanitizePhoneNumber(store.whatsapp) : null

  const items: TrustItem[] = [
    phone
      ? { icon: MessageCircle, label: 'Atención por WhatsApp' }
      : { icon: Zap, label: 'Respuesta rápida' },
    store.hours
      ? { icon: Clock3, label: store.hours }
      : { icon: Zap, label: 'Respuesta rápida' },
    store.address ? { icon: MapPin, label: store.address } : null,
    { icon: ShieldCheck, label: 'Pedido directo al vendedor' },
    { icon: Package, label: 'Consultá envíos y retiro' },
  ].filter((item, index, arr) => {
    if (!item) return false
    // dedupe Zap if both whatsapp and hours are missing
    if (item.icon === Zap && arr.findIndex((i) => i?.icon === Zap) !== index) return false
    return true
  }) as TrustItem[]

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
      <div className="flex items-stretch overflow-x-auto">
        <div className="mx-auto flex min-w-max items-stretch">
          {display.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="flex items-center gap-2.5 px-5 py-4 sm:px-7 sm:py-5"
                style={
                  index < display.length - 1
                    ? { borderRight: '1px solid var(--store-card-border)' }
                    : undefined
                }
              >
                <Icon
                  className="size-4 shrink-0"
                  style={{ color: 'var(--store-primary)' }}
                />
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
      </div>
    </div>
  )
}
