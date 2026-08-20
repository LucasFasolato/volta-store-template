'use client'

import { MessageSquareText, TextCursorInput, Truck, UserRound } from 'lucide-react'
import type { CheckoutDetails } from '@/lib/whatsapp/builder'
import type { CheckoutCustomField } from '@/types/store'

type Props = {
  askName: boolean
  askFulfillment: boolean
  allowNotes: boolean
  customFields: CheckoutCustomField[]
  value: CheckoutDetails
  onChange: (value: CheckoutDetails) => void
}

const readableFieldStyle = {
  borderColor: 'var(--store-card-border)',
  color: 'var(--store-text)',
  WebkitTextFillColor: 'var(--store-text)',
  caretColor: 'var(--store-primary)',
  backgroundColor: 'var(--store-surface)',
  backgroundImage: 'none',
  WebkitBoxShadow: '0 0 0 1000px var(--store-surface) inset',
  boxShadow: '0 0 0 1000px var(--store-surface) inset',
  WebkitAppearance: 'none',
  appearance: 'none',
} as const

export function CheckoutDetailsFields({ askName, askFulfillment, allowNotes, customFields, value, onChange }: Props) {
  const activeCustomFields = customFields.filter((field) => field.is_enabled)
  if (!askName && !askFulfillment && !allowNotes && activeCustomFields.length === 0) return null

  function setCustomValue(fieldId: string, nextValue: string) {
    onChange({
      ...value,
      custom: {
        ...(value.custom ?? {}),
        [fieldId]: nextValue,
      },
    })
  }

  return (
    <section
      id="datos-pedido"
      className="rounded-[calc(var(--store-card-radius)*0.72)] border p-4"
      style={{
        borderColor: 'color-mix(in srgb, var(--store-primary) 30%, var(--store-card-border))',
        background: 'color-mix(in srgb, var(--store-primary) 6%, var(--store-surface))',
        boxShadow: '0 10px 28px color-mix(in srgb, var(--store-primary) 8%, transparent)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--store-primary)', color: 'var(--store-primary-contrast)' }}>1</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--store-text)' }}>Completá tus datos</p>
          <p className="mt-1 text-xs leading-5" style={{ color: 'var(--store-muted-text)' }}>Esto va dentro del mensaje de WhatsApp. Los campos obligatorios están marcados.</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {askName ? (
          <label className="block rounded-[var(--store-button-radius)] border p-3" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-surface)' }}>
            <span className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <span className="flex items-center gap-2"><UserRound className="size-3.5" />Tu nombre</span>
              <RequiredBadge />
            </span>
            <input
              value={value.customerName ?? ''}
              onChange={(event) => onChange({ ...value, customerName: event.target.value.slice(0, 80) })}
              placeholder="Ej: Lucas"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="store-form-control min-h-11 w-full rounded-[var(--store-button-radius)] border px-3.5 text-sm outline-none transition focus:ring-2"
              style={readableFieldStyle}
            />
          </label>
        ) : null}

        {askFulfillment ? (
          <div className="rounded-[var(--store-button-radius)] border p-3" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-surface)' }}>
            <span className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <span className="flex items-center gap-2"><Truck className="size-3.5" />¿Cómo querés recibirlo?</span>
              <RequiredBadge />
            </span>
            <div className="grid grid-cols-2 gap-2">
              <ChoiceButton active={value.fulfillment === 'pickup'} onClick={() => onChange({ ...value, fulfillment: 'pickup' })}>Retiro</ChoiceButton>
              <ChoiceButton active={value.fulfillment === 'delivery'} onClick={() => onChange({ ...value, fulfillment: 'delivery' })}>Envío</ChoiceButton>
            </div>
          </div>
        ) : null}

        {allowNotes ? (
          <label className="block rounded-[var(--store-button-radius)] border p-3" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-surface)' }}>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <MessageSquareText className="size-3.5" />
              Observaciones <span className="font-normal opacity-60">(opcional)</span>
            </span>
            <textarea
              value={value.notes ?? ''}
              onChange={(event) => onChange({ ...value, notes: event.target.value.slice(0, 240) })}
              placeholder="Ej: pasar después de las 18 hs"
              rows={2}
              autoComplete="off"
              className="store-form-control w-full resize-none rounded-[var(--store-button-radius)] border px-3.5 py-3 text-sm outline-none focus:ring-2"
              style={readableFieldStyle}
            />
          </label>
        ) : null}

        {activeCustomFields.map((field) => (
          <label key={field.id} className="block rounded-[var(--store-button-radius)] border p-3" style={{ borderColor: 'var(--store-card-border)', background: 'var(--store-surface)' }}>
            <span className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold" style={{ color: 'var(--store-soft-text)' }}>
              <span className="flex min-w-0 items-center gap-2"><TextCursorInput className="size-3.5 shrink-0" /><span className="truncate">{field.label}</span></span>
              {field.is_required ? <RequiredBadge /> : <span className="text-[10px] font-normal opacity-55">Opcional</span>}
            </span>
            {field.field_type === 'long' ? (
              <textarea
                value={value.custom?.[field.id] ?? ''}
                onChange={(event) => setCustomValue(field.id, event.target.value.slice(0, 240))}
                placeholder={field.placeholder ?? ''}
                rows={2}
                autoComplete="off"
                className="store-form-control w-full resize-none rounded-[var(--store-button-radius)] border px-3.5 py-3 text-sm outline-none focus:ring-2"
                style={readableFieldStyle}
              />
            ) : (
              <input
                value={value.custom?.[field.id] ?? ''}
                onChange={(event) => setCustomValue(field.id, event.target.value.slice(0, 120))}
                placeholder={field.placeholder ?? ''}
                autoComplete="off"
                autoCorrect="off"
                className="store-form-control min-h-11 w-full rounded-[var(--store-button-radius)] border px-3.5 text-sm outline-none focus:ring-2"
                style={readableFieldStyle}
              />
            )}
          </label>
        ))}
      </div>
    </section>
  )
}

function RequiredBadge() {
  return <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--store-primary)' }}>Obligatorio</span>
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
            background: 'color-mix(in srgb, var(--store-primary) 14%, transparent)',
            color: 'var(--store-text)',
            boxShadow: '0 0 0 1px color-mix(in srgb, var(--store-primary) 18%, transparent)',
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
