import { getAvailableOptionValues } from '@/lib/products/availability'
import type { ProductOption } from '@/types/store'

export function getProductOptionSummary(options: ProductOption[], maxValuesPerOption = 3) {
  return options
    .map((option) => {
      const available = getAvailableOptionValues(option)
      if (available.length === 0) return `${option.name}: agotado`
      const visible = available.slice(0, maxValuesPerOption)
      const more = available.length - visible.length
      return `${option.name}: ${visible.join(' · ')}${more > 0 ? ` +${more}` : ''}`
    })
    .join(' / ')
}
