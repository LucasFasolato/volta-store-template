import { MessageCircle, Package, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Store } from '@/types/store'

const STEPS = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Exploras y eliges',
    description: 'Recorres el catalogo, sumas productos y dejas listo el pedido.',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Envias por WhatsApp',
    description: 'El pedido va directo al negocio para confirmar disponibilidad y precio final.',
  },
  {
    number: '03',
    icon: Package,
    title: 'Coordinas entrega o retiro',
    description: 'Cierras pago, envio o retiro en la misma conversacion.',
  },
]

type HowItWorksSectionProps = {
  store: Store
  containerClass: string
  productCount: number
}

export function HowItWorksSection({ store, containerClass, productCount }: HowItWorksSectionProps) {
  if (!store.whatsapp || productCount <= 4) return null

  return (
    <section className="py-[var(--store-space-section)]">
      <div
        className="border-y"
        style={{
          borderColor: 'var(--store-card-border)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 55%, transparent), color-mix(in srgb, var(--store-bg) 94%, transparent))',
        }}
      >
        <div className={cn('mx-auto px-4 py-12 sm:px-6 sm:py-14', containerClass)}>
          <div className="mb-10 text-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Compra sin vueltas
            </p>
            <h2
              className="store-heading mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: 'var(--store-text)' }}
            >
              Asi compras en esta tienda
            </h2>
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--store-soft-text)' }}>
              El catalogo te ayuda a elegir rapido y el cierre sucede directo con el negocio.
            </p>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            <div
              className="pointer-events-none absolute left-0 right-0 top-[2.1rem] hidden h-px sm:block"
              style={{
                background:
                  'linear-gradient(90deg, transparent 8%, color-mix(in srgb, var(--store-primary) 22%, var(--store-card-border)) 30%, color-mix(in srgb, var(--store-primary) 22%, var(--store-card-border)) 70%, transparent 92%)',
              }}
              aria-hidden="true"
            />

            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  <div
                    className="relative z-10 mb-5 flex size-[4.25rem] items-center justify-center rounded-full"
                    style={{
                      background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--store-primary) 14%, var(--store-surface)), color-mix(in srgb, var(--store-surface) 86%, transparent))',
                      border: '1px solid color-mix(in srgb, var(--store-primary) 20%, var(--store-card-border))',
                      boxShadow: '0 8px 24px color-mix(in srgb, var(--store-primary) 10%, transparent)',
                    }}
                  >
                    <Icon className="size-5" style={{ color: 'var(--store-primary)' }} />
                  </div>

                  <span
                    className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em]"
                    style={{ color: 'var(--store-muted-text)' }}
                  >
                    Paso {step.number}
                  </span>

                  <p
                    className="store-heading text-[15px] font-semibold leading-snug"
                    style={{ color: 'var(--store-text)' }}
                  >
                    {step.title}
                  </p>

                  <p
                    className="mt-2 max-w-[16rem] text-sm leading-6"
                    style={{ color: 'var(--store-soft-text)' }}
                  >
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
