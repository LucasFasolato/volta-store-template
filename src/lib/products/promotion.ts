type PromotionPricedProduct = {
  price: number
  compare_price: number | null
}

export function isProductOnPromotion(product: PromotionPricedProduct) {
  return product.compare_price !== null && product.compare_price > product.price
}

export function getProductDiscountPercent(product: PromotionPricedProduct) {
  if (!isProductOnPromotion(product) || !product.compare_price) return null
  return Math.round((1 - product.price / product.compare_price) * 100)
}

export function getProductNormalPrice(product: PromotionPricedProduct) {
  return isProductOnPromotion(product) && product.compare_price ? product.compare_price : product.price
}
