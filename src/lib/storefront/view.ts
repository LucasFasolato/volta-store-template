import type { Category, ProductWithImages } from '@/types/store'

export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [8, 12, 24] as const

type QueryValue = string | string[] | undefined

export type StorefrontSearchParams = {
  categoria?: QueryValue
  producto?: QueryValue
  pagina?: QueryValue
  tamano?: QueryValue
}

export type StorefrontRouteState = {
  activeCategory: string | null
  activeProduct: string | null
  page: number
  pageSize: number
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
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : DEFAULT_PAGE_SIZE
}

export function resolveStorefrontView(
  products: ProductWithImages[],
  categories: Category[],
  searchParams: StorefrontSearchParams,
): StorefrontViewModel {
  const categorySlug = getSingleValue(searchParams.categoria)
  const productSlug = getSingleValue(searchParams.producto)
  const pageSize = parsePageSize(searchParams.tamano)
  const category = categories.find((item) => item.slug === categorySlug) ?? null
  const activeCategory = category?.slug ?? null
  const filteredProducts = category
    ? products.filter((product) => product.category_id === category.id)
    : products
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const page = Math.min(parsePositiveInt(searchParams.pagina, 1), totalPages)
  const selectedProduct =
    productSlug ? products.find((product) => product.slug === productSlug) ?? null : null

  return {
    activeCategory,
    activeProduct: selectedProduct?.slug ?? null,
    page,
    pageSize,
    totalPages,
    featuredProducts: products.filter((product) => product.is_featured),
    filteredProducts,
    paginatedProducts: filteredProducts.slice((page - 1) * pageSize, page * pageSize),
    selectedProduct,
  }
}

export function buildStorefrontHref(
  pathname: string,
  state: {
    category?: string | null
    product?: string | null
    page?: number
    pageSize?: number
  },
) {
  const params = new URLSearchParams()

  if (state.category) params.set('categoria', state.category)
  if (state.product) params.set('producto', state.product)
  if (state.page && state.page > 1) params.set('pagina', String(state.page))
  if (state.pageSize && state.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('tamano', String(state.pageSize))
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
