import type { Brand, Category, ProductWithImages } from '@/types/store'
import { isProductSoldOut } from '@/lib/products/availability'
import { getProductDiscountPercent, isProductOnPromotion } from '@/lib/products/promotion'

export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [8, 12, 24] as const
export const STOREFRONT_SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'discount', label: 'Mayor descuento' },
  { value: 'newest', label: 'Más nuevos' },
] as const

export type StorefrontSort = (typeof STOREFRONT_SORT_OPTIONS)[number]['value']

type QueryValue = string | string[] | undefined
type OrderedProduct = ProductWithImages & { category_sort_order?: number }

export type StorefrontSearchParams = {
  categoria?: QueryValue
  marca?: QueryValue
  promo?: QueryValue
  buscar?: QueryValue
  producto?: QueryValue
  pagina?: QueryValue
  tamano?: QueryValue
  ordenar?: QueryValue
}

export type StorefrontRouteState = {
  activeCategory: string | null
  activeBrand: string | null
  activePromotion: boolean
  activeProduct: string | null
  query: string
  page: number
  pageSize: number
  sort: StorefrontSort
}

export type StorefrontViewModel = StorefrontRouteState & {
  featuredProducts: ProductWithImages[]
  filteredProducts: ProductWithImages[]
  paginatedProducts: ProductWithImages[]
  selectedProduct: ProductWithImages | null
  totalPages: number
}

function getSingleValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value
}

function parsePositiveInt(value: QueryValue, fallback: number) {
  const parsed = Number.parseInt(getSingleValue(value) ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parsePageSize(value: QueryValue) {
  const parsed = parsePositiveInt(value, DEFAULT_PAGE_SIZE)
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number]) ? parsed : DEFAULT_PAGE_SIZE
}

function parseSort(value: QueryValue): StorefrontSort {
  const parsed = getSingleValue(value)
  return STOREFRONT_SORT_OPTIONS.some((option) => option.value === parsed)
    ? parsed as StorefrontSort
    : 'recommended'
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

function matchesSearch(product: ProductWithImages, query: string) {
  if (!query) return true

  const haystack = normalizeSearchText([
    product.name,
    product.sku,
    product.brand?.name,
    product.category?.name,
    product.short_description,
    product.description,
  ].filter(Boolean).join(' '))
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean)

  return tokens.every((token) => haystack.includes(token))
}

function parsePromotion(value: QueryValue) {
  const promotion = getSingleValue(value)
  return promotion === '1' || promotion === 'true'
}

function compareAvailability(a: ProductWithImages, b: ProductWithImages) {
  return Number(isProductSoldOut(a)) - Number(isProductSoldOut(b))
}

function compareRecommended(a: OrderedProduct, b: OrderedProduct, categorySelected: boolean, promotionSelected: boolean) {
  if (promotionSelected) {
    const discountDifference = (getProductDiscountPercent(b) ?? 0) - (getProductDiscountPercent(a) ?? 0)
    if (discountDifference !== 0) return discountDifference
  }

  if (categorySelected) {
    const categoryDifference = (a.category_sort_order ?? a.sort_order) - (b.category_sort_order ?? b.sort_order)
    if (categoryDifference !== 0) return categoryDifference
  }

  return a.sort_order - b.sort_order
}

function compareProducts(a: OrderedProduct, b: OrderedProduct, sort: StorefrontSort, categorySelected: boolean, promotionSelected: boolean) {
  const availabilityDifference = compareAvailability(a, b)
  if (availabilityDifference !== 0) return availabilityDifference

  if (sort === 'price-asc') {
    const difference = a.price - b.price
    if (difference !== 0) return difference
  }

  if (sort === 'price-desc') {
    const difference = b.price - a.price
    if (difference !== 0) return difference
  }

  if (sort === 'discount') {
    const difference = (getProductDiscountPercent(b) ?? 0) - (getProductDiscountPercent(a) ?? 0)
    if (difference !== 0) return difference
  }

  if (sort === 'newest') {
    const difference = Date.parse(b.created_at) - Date.parse(a.created_at)
    if (Number.isFinite(difference) && difference !== 0) return difference
  }

  return compareRecommended(a, b, categorySelected, promotionSelected)
}

export function resolveStorefrontView(
  products: ProductWithImages[],
  categories: Category[],
  brands: Brand[],
  searchParams: StorefrontSearchParams,
): StorefrontViewModel {
  const categorySlug = getSingleValue(searchParams.categoria)
  const brandSlug = getSingleValue(searchParams.marca)
  const productSlug = getSingleValue(searchParams.producto)
  const activePromotion = parsePromotion(searchParams.promo)
  const query = (getSingleValue(searchParams.buscar) ?? '').trim().slice(0, 120)
  const pageSize = parsePageSize(searchParams.tamano)
  const sort = parseSort(searchParams.ordenar)
  const category = categories.find((item) => item.slug === categorySlug) ?? null
  const brand = brands.find((item) => item.slug === brandSlug && item.is_active) ?? null
  const activeCategory = category?.slug ?? null
  const activeBrand = brand?.slug ?? null

  let filteredProducts = [...(products as OrderedProduct[])]
  if (category) filteredProducts = filteredProducts.filter((product) => product.category_id === category.id)
  if (brand) filteredProducts = filteredProducts.filter((product) => product.brand_id === brand.id)
  if (activePromotion) filteredProducts = filteredProducts.filter(isProductOnPromotion)
  if (query) filteredProducts = filteredProducts.filter((product) => matchesSearch(product, query))

  filteredProducts.sort((a, b) => compareProducts(a, b, sort, Boolean(category), activePromotion))

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const page = Math.min(parsePositiveInt(searchParams.pagina, 1), totalPages)
  const selectedProduct = productSlug ? products.find((product) => product.slug === productSlug) ?? null : null

  return {
    activeCategory,
    activeBrand,
    activePromotion,
    activeProduct: selectedProduct?.slug ?? null,
    query,
    page,
    pageSize,
    sort,
    totalPages,
    featuredProducts: products.filter((product) => product.is_featured && !isProductSoldOut(product)),
    filteredProducts,
    paginatedProducts: filteredProducts.slice((page - 1) * pageSize, page * pageSize),
    selectedProduct,
  }
}

export function buildStorefrontHref(
  pathname: string,
  state: {
    category?: string | null
    brand?: string | null
    promotion?: boolean
    query?: string | null
    product?: string | null
    page?: number
    pageSize?: number
    sort?: StorefrontSort
  },
) {
  const params = new URLSearchParams()
  if (state.category) params.set('categoria', state.category)
  if (state.brand) params.set('marca', state.brand)
  if (state.promotion) params.set('promo', '1')
  if (state.query?.trim()) params.set('buscar', state.query.trim())
  if (state.product) params.set('producto', state.product)
  if (state.page && state.page > 1) params.set('pagina', String(state.page))
  if (state.pageSize && state.pageSize !== DEFAULT_PAGE_SIZE) params.set('tamano', String(state.pageSize))
  if (state.sort && state.sort !== 'recommended') params.set('ordenar', state.sort)
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
