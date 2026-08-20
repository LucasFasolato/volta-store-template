import type { Product, ProductOption } from '@/types/store'

export type ProductAvailability = 'available' | 'sold_out'
export type ProductOperationalState = 'available' | 'sold_out' | 'hidden'

export function isProductSoldOut(product: Pick<Product, 'availability_status'>) {
  return product.availability_status === 'sold_out'
}

export function isOptionValueUnavailable(option: Pick<ProductOption, 'unavailable_values'>, value: string) {
  return (option.unavailable_values ?? []).includes(value)
}

export function getAvailableOptionValues(option: Pick<ProductOption, 'values' | 'unavailable_values'>) {
  return option.values.filter((value) => !isOptionValueUnavailable(option, value))
}

export function hasAvailableOptionValues(option: Pick<ProductOption, 'values' | 'unavailable_values'>) {
  return getAvailableOptionValues(option).length > 0
}

export function isProductPurchasable(
  product: Pick<Product, 'availability_status'> & { options?: Array<Pick<ProductOption, 'values' | 'unavailable_values'>> },
) {
  if (isProductSoldOut(product)) return false
  return (product.options ?? []).every(hasAvailableOptionValues)
}

export function getProductOperationalState(product: Pick<Product, 'is_active' | 'availability_status'>): ProductOperationalState {
  if (!product.is_active) return 'hidden'
  return isProductSoldOut(product) ? 'sold_out' : 'available'
}
