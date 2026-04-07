'use client'

import { GripVertical, Plus, Tag, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createEmptyDraftProductOption,
  parseProductOptionValues,
  type DraftProductOption,
} from '@/lib/products/options'

type ProductOptionsEditorProps = {
  value: DraftProductOption[]
  onChange: (nextValue: DraftProductOption[]) => void
  disabled?: boolean
}

export function ProductOptionsEditor({
  value,
  onChange,
  disabled = false,
}: ProductOptionsEditorProps) {
  function addOption() {
    onChange([...value, createEmptyDraftProductOption()])
  }

  function removeOption(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index))
  }

  function updateName(index: number, name: string) {
    onChange(
      value.map((option, currentIndex) =>
        currentIndex === index ? { ...option, name } : option,
      ),
    )
  }

  function updateValues(index: number, valuesRaw: string) {
    onChange(
      value.map((option, currentIndex) =>
        currentIndex === index
          ? { ...option, valuesRaw, values: parseProductOptionValues(valuesRaw) }
          : option,
      ),
    )
  }

  function removeTag(index: number, tag: string) {
    onChange(
      value.map((option, currentIndex) => {
        if (currentIndex !== index) return option

        const values = option.values.filter((valueItem) => valueItem !== tag)

        return {
          ...option,
          values,
          valuesRaw: values.join(', '),
        }
      }),
    )
  }

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-6 text-center">
          <Tag className="mx-auto mb-3 size-7 text-neutral-500" />
          <p className="text-sm font-medium text-white">Sin opciones todavia</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Agrega talle, color, medida o cualquier atributo que el cliente deba elegir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((option, index) => (
            <OptionRow
              key={option.id ?? `${option.name}-${index}`}
              option={option}
              disabled={disabled}
              onNameChange={(nextName) => updateName(index, nextName)}
              onValuesChange={(nextValues) => updateValues(index, nextValues)}
              onRemoveTag={(tag) => removeTag(index, tag)}
              onDelete={() => removeOption(index)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addOption}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-white/20 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="size-4" />
        Agregar opcion
      </button>
    </div>
  )
}

type OptionRowProps = {
  option: DraftProductOption
  disabled: boolean
  onNameChange: (value: string) => void
  onValuesChange: (value: string) => void
  onRemoveTag: (tag: string) => void
  onDelete: () => void
}

function OptionRow({
  option,
  disabled,
  onNameChange,
  onValuesChange,
  onRemoveTag,
  onDelete,
}: OptionRowProps) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start gap-3">
        <GripVertical className="mt-2.5 size-4 shrink-0 text-neutral-600" />

        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[0.9fr_1.35fr]">
            <div>
              <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Nombre
              </Label>
              <Input
                value={option.name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Ej: Talle"
                maxLength={40}
                disabled={disabled}
                className="h-10 rounded-xl border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Valores
              </Label>
              <Input
                value={option.valuesRaw}
                onChange={(event) => onValuesChange(event.target.value)}
                placeholder="Ej: S, M, L"
                disabled={disabled}
                className="h-10 rounded-xl border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500"
              />
              <p className="mt-1.5 text-[11px] text-neutral-500">
                Separa cada valor con coma.
              </p>
            </div>
          </div>

          {option.values.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {option.values.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] font-medium text-neutral-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    disabled={disabled}
                    className="text-neutral-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Eliminar ${tag}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="mt-1 rounded-full p-2 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Eliminar opcion"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
