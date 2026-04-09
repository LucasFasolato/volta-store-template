import { MessageCircle, Package, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Store } from '@/types/store'

const STEPS = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Elegís tus productos',
    description: 'Explorá el catálogo, sumá lo que te gusta y armá tu pedido.',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Enviás el pedido por WhatsApp',
    description: 'Con un toque mandás tu selección directo al vendedor.',
  },
  {
    number: '03',
    icon: Package,
    title: 'Coordinás pago y entrega',
    description: 'Acordás forma de pago y envío o retiro en un solo chat.',
  },
]

type HowItWorksSectionProps = {
  store: Store
  containerClass: string
}

export function HowItWorksSection({ store, containerClass }: HowItWorksSectionProps) {
  if (!store.whatsapp) return null

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
        <div className={cn('mx-auto px-4 py-14 sm:px-6 sm:py-16', containerClass)}>
          <div className="mb-10 text-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'var(--store-muted-text)' }}
            >
              Simple y directo
            </p>
            <h2
              className="store-heading mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: 'var(--store-text)' }}
            >
              ¿Cómo comprás?
            </h2>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connector line — desktop only */}
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
                  {/* Icon circle */}
                  <div
                    className="relative z-10 mb-5 flex size-[4.25rem] items-center justify-center rounded-full"
                    style={{
                      background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--store-primary) 14%, var(--store-surface)), color-mix(in srgb, var(--store-surface) 86%, transparent))',
                      border: '1px solid color-mix(in srgb, var(--store-primary) 20%, var(--store-card-border))',
                      boxShadow: '0 8px 24px color-mix(in srgb, var(--store-primary) 10%, transparent)',
                    }}
                  >
                    <Icon
                      className="size-5"
                      style={{ color: 'var(--store-primary)' }}
                    />
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
