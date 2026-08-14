import { AtSign, Clock3, MapPin, MessageCircle, Store as StoreIcon } from 'lucide-react'
import { sanitizeInstagramHandle } from '@/lib/utils/format'
import type { Store } from '@/types/store'

export function BusinessTrustPreview({ store }: { store: Store }) {
  const instagram = store.instagram ? sanitizeInstagramHandle(store.instagram) : null
  const items = [
    store.whatsapp ? { icon: MessageCircle, label: 'WhatsApp' } : null,
    store.address ? { icon: MapPin, label: store.address } : null,
    store.hours ? { icon: Clock3, label: store.hours } : null,
    instagram ? { icon: AtSign, label: `@${instagram}` } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>

  return (
    <section className="rounded-[14px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#12e89a]/10 text-emerald-600 dark:text-[#12e89a]">
          <StoreIcon className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-[-0.03em] text-foreground">Datos visibles en tu tienda</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Solo mostramos lo que cargues.</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#fbfcfd] px-3 py-2 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/[0.035]">
                <Icon className="size-3.5 text-emerald-600 dark:text-[#12e89a]" />
                {item.label}
              </span>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Podés sumar horarios, dirección o Instagram cuando te sirva.
        </p>
      )}
    </section>
  )
}
