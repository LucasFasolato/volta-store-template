import type { Product } from '@/types/store'

export type ProductAvailability = 'available' | 'sold_out'
export type ProductOperationalState = 'available' | 'sold_out' | 'hidden'

export function isProductSoldOut(product: Pick<Product, 'availability_status'>) {
  return product.availability_status === 'sold_out'
}

export function getProductOperationalState(product: Pick<Product, 'is_active' | 'availability_status'>): ProductOperationalState {
  if (!product.is_active) return 'hidden'
  return isProductSoldOut(product) ? 'sold_out' : 'available'
}
