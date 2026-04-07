'use client'

import { useState } from 'react'
import { GripVertical, Plus, Tag, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { replaceProductOptions } from '@/lib/actions/product-options'
import type { ProductOption } from '@/types/store'

type DraftOption = {
  id?: string       // undefined = new, string = existing
  name: string
  valuesRaw: string // comma-separated editing buffer
  values: string[]
}

type ProductOptionsEditorProps = {
  productId: string
  initialOptions: ProductOption[]
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

export function ProductOptionsEditor({ productId, initialOptions }: ProductOptionsEditorProps) {
  const [options, setOptions] = useState<DraftOption[]>(
    initialOptions
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        id: o.id,
        name: o.name,
        valuesRaw: o.values.join(', '),
        values: o.values,
      })),
  )
  const [isSaving, setIsSaving] = useState(false)

  function addOption() {
    setOptions((prev) => [...prev, { name: '', valuesRaw: '', values: [] }])
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateName(index: number, name: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, name } : o)))
  }

  function updateValuesRaw(index: number, raw: string) {
    setOptions((prev) =>
      prev.map((o, i) =>
        i === index ? { ...o, valuesRaw: raw, values: parseTags(raw) } : o,
      ),
    )
  }

  // Remove an individual tag chip from an option
  function removeTag(optionIndex: number, tag: string) {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i !== optionIndex) return o
        const values = o.values.filter((v) => v !== tag)
        return { ...o, values, valuesRaw: values.join(', ') }
      }),
    )
  }

  // Add a tag when user presses Enter or comma in the values input
  function handleValuesKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    raw: string,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault()
      updateValuesRaw(index, raw)
    }
  }

  async function handleSave() {
    // Validate
    for (const opt of options) {
      if (!opt.name.trim()) {
        toast.error('Cada atributo necesita un nombre.')
        return
      }
      if (opt.values.length === 0) {
        toast.error(`El atributo "${opt.name}" no tiene valores.`)
        return
      }
    }

    setIsSaving(true)

    const result = await replaceProductOptions(
      productId,
      options.map((o, i) => ({ name: o.name.trim(), values: o.values, sort_order: i })),
    )

    if (result?.error) {
      const msg =
        typeof result.error === 'object' && 'formErrors' in result.error
          ? result.error.formErrors?.[0]
          : String(result.error)
      toast.error(msg ?? 'No se pudo guardar.')
    } else {
      toast.success('Opciones guardadas.')
    }

    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      {options.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-center">
          <Tag className="mx-auto mb-3 size-7 text-neutral-500" />
          <p className="text-sm font-medium text-neutral-300">Sin opciones todavía</p>
          <p className="mt-1 text-xs text-neutral-500">
            Agregá talle, color, medida o cualquier atributo que el cliente deba elegir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((opt, index) => (
            <OptionRow
              key={index}
              option={opt}
              onNameChange={(v) => updateName(index, v)}
              onValuesChange={(v) => updateValuesRaw(index, v)}
              onValuesKeyDown={(e) => handleValuesKeyDown(e, index, opt.valuesRaw)}
              onRemoveTag={(tag) => removeTag(index, tag)}
              onDelete={() => removeOption(index)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-white/20 hover:bg-white/8"
        >
          <Plus className="size-4" />
          Agregar atributo
        </button>

        {options.length > 0 ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : 'Guardar opciones'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

type OptionRowProps = {
  option: DraftOption
  onNameChange: (v: string) => void
  onValuesChange: (v: string) => void
  onValuesKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRemoveTag: (tag: string) => void
  onDelete: () => void
}

function OptionRow({
  option,
  onNameChange,
  onValuesChange,
  onValuesKeyDown,
  onRemoveTag,
  onDelete,
}: OptionRowProps) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start gap-3">
        <GripVertical className="mt-2.5 size-4 shrink-0 text-neutral-600" />

        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
            <div>
              <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Nombre
              </Label>
              <Input
                value={option.name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Ej: Talle"
                maxLength={40}
                className="h-9 rounded-xl border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Valores{' '}
                <span className="normal-case tracking-normal text-neutral-600">
                  (separados por coma)
                </span>
              </Label>
              <Input
                value={option.valuesRaw}
                onChange={(e) => onValuesChange(e.target.value)}
                onKeyDown={onValuesKeyDown}
                placeholder="Ej: S, M, L, XL"
                className="h-9 rounded-xl border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500"
              />
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
                    className="text-neutral-500 hover:text-red-400"
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
          className="mt-1 rounded-full p-2 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Eliminar atributo"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
