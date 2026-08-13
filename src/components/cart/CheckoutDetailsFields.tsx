'use client'

import { MessageSquareText, Truck, UserRound } from 'lucide-react'
import type { CheckoutDetails } from '@/lib/whatsapp/builder'

type Props = {
  askName: boolean
  askFulfillment: boolean
  allowNotes: boolean
  value: CheckoutDetails
  onChange: (value: CheckoutDetails) => void
}

export function CheckoutDetailsFields({ askName, askFulfillment, allowNotes, value, onChange }: Props) {
  if (!askName && !askFulfillment && !allowNotes) return null

  return (
    <section
      className="mt-4 rounded-[calc(var(--store-card-radius)*0.72)] border p-4"
      style={{
        borderColor: 'var(--store-card-border)',
        background: 'color-mix(in srgb, var(--store-surface) 82%, transparent)',
      }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>Datos para el pedido</p>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>Solo te pedimos lo necesario antes de abrir WhatsApp.</p>
      </div>

      <div className="mt-4 space-y-4">
        {askName ? (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <UserRound className="size-3.5" />
              Tu nombre
            </span>
            <input
              value={value.customerName ?? ''}
              onChange={(event) => onChange({ ...value, customerName: event.target.value })}
              placeholder="Ej: Lucas"
              autoComplete="name"
              className="min-h-11 w-full rounded-[var(--store-button-radius)] border bg-transparent px-3.5 text-sm outline-none"
              style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)' }}
            />
          </label>
        ) : null}

        {askFulfillment ? (
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <Truck className="size-3.5" />
              ¿Cómo querés recibirlo?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <ChoiceButton
                active={value.fulfillment === 'pickup'}
                onClick={() => onChange({ ...value, fulfillment: 'pickup' })}
              >
                Retiro
              </ChoiceButton>
              <ChoiceButton
                active={value.fulfillment === 'delivery'}
                onClick={() => onChange({ ...value, fulfillment: 'delivery' })}
              >
                Envío
              </ChoiceButton>
            </div>
          </div>
        ) : null}

        {allowNotes ? (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <MessageSquareText className="size-3.5" />
              Observaciones <span className="font-normal opacity-60">(opcional)</span>
            </span>
            <textarea
              value={value.notes ?? ''}
              onChange={(event) => onChange({ ...value, notes: event.target.value.slice(0, 240) })}
              placeholder="Ej: pasar después de las 18 hs"
              rows={2}
              className="w-full resize-none rounded-[var(--store-button-radius)] border bg-transparent px-3.5 py-3 text-sm outline-none"
              style={{ borderColor: 'var(--store-card-border)', color: 'var(--store-text)' }}
            />
          </label>
        ) : null}
      </div>
    </section>
  )
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="min-h-11 rounded-[var(--store-button-radius)] border px-3 text-sm font-semibold transition active:scale-[0.98]"
      style={active
        ? {
            borderColor: 'var(--store-primary)',
            background: 'color-mix(in srgb, var(--store-primary) 12%, transparent)',
            color: 'var(--store-text)',
          }
        : {
            borderColor: 'var(--store-card-border)',
            color: 'var(--store-soft-text)',
          }}
    >
      {children}
    </button>
  )
}
