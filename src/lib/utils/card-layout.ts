export type ProductCardModel = 'classic' | 'visual' | 'compact'

export function normalizeCardLayout(value: string | null | undefined): ProductCardModel {
  if (value === 'visual') return 'visual'
  if (value === 'compact' || value === 'list') return 'compact'
  return 'classic'
}
