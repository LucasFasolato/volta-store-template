import type { ProductOption } from '@/types/store'

export type DraftProductOption = {
  id?: string
  name: string
  valuesRaw: string
  values: string[]
}

export function parseProductOptionValues(raw: string): string[] {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value, index, values) => values.indexOf(value) === index)
}

export function createEmptyDraftProductOption(): DraftProductOption {
  return {
    name: '',
    valuesRaw: '',
    values: [],
  }
}

export function productOptionsToDraft(options: ProductOption[]) {
  return [...options]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((option) => ({
      id: option.id,
      name: option.name,
      valuesRaw: option.values.join(', '),
      values: option.values,
    }))
}

export function validateDraftProductOptions(options: DraftProductOption[]) {
  for (const option of options) {
    if (!option.name.trim()) {
      return { valid: false as const, message: 'Cada atributo necesita un nombre.' }
    }

    if (option.values.length === 0) {
      return {
        valid: false as const,
        message: `El atributo "${option.name.trim()}" necesita al menos un valor.`,
      }
    }
  }

  return { valid: true as const }
}
