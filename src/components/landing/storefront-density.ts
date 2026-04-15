export type StorefrontDensityMode = 'small' | 'medium' | 'large'

export function getStorefrontDensityMode(productCount: number): StorefrontDensityMode {
  if (productCount <= 4) return 'small'
  if (productCount <= 12) return 'medium'
  return 'large'
}
