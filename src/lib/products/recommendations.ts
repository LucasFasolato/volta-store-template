import { isProductSoldOut } from '@/lib/products/availability'
import type { ProductWithImages } from '@/types/store'

function stableProductOrder(a: ProductWithImages, b: ProductWithImages) {
  if (a.is_featured !== b.is_featured) return Number(b.is_featured) - Number(a.is_featured)
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
  return Date.parse(b.created_at) - Date.parse(a.created_at)
}

export function getRelatedProducts(
  currentProduct: ProductWithImages,
  products: ProductWithImages[],
  limit = 4,
) {
  if (limit <= 0) return []

  const candidates = products.filter((product) =>
    product.id !== currentProduct.id && product.is_active && !isProductSoldOut(product),
  )
  const selected: ProductWithImages[] = []
  const selectedIds = new Set<string>()

  function addFrom(group: ProductWithImages[]) {
    for (const product of [...group].sort(stableProductOrder)) {
      if (selected.length >= limit) break
      if (selectedIds.has(product.id)) continue
      selected.push(product)
      selectedIds.add(product.id)
    }
  }

  if (currentProduct.category_id) {
    addFrom(candidates.filter((product) => product.category_id === currentProduct.category_id))
  }

  if (currentProduct.brand_id && selected.length < limit) {
    addFrom(candidates.filter((product) => product.brand_id === currentProduct.brand_id))
  }

  if (selected.length < limit) {
    addFrom(candidates.filter((product) => product.is_featured))
  }

  if (selected.length < limit) addFrom(candidates)

  return selected
}
