import type { Brand, Category, ProductWithImages } from '@/types/store'

export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [8, 12, 24] as const

type QueryValue = string | string[] | undefined
type OrderedProduct = ProductWithImages & { category_sort_order?: number }

export type StorefrontSearchParams = {
  categoria?: QueryValue
  marca?: QueryValue
  buscar?: QueryValue
  producto?: QueryValue
  pagina?: QueryValue
  tamano?: QueryValue
}

export type StorefrontRouteState = {
  activeCategory: string | null
  activeBrand: string | null
  activeProduct: string | null
  query: string
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
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number]) ? parsed : DEFAULT_PAGE_SIZE
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

export function resolveStorefrontView(
  products: ProductWithImages[],
  categories: Category[],
  brands: Brand[],
  searchParams: StorefrontSearchParams,
): StorefrontViewModel {
  const categorySlug = getSingleValue(searchParams.categoria)
  const brandSlug = getSingleValue(searchParams.marca)
  const productSlug = getSingleValue(searchParams.producto)
  const query = (getSingleValue(searchParams.buscar) ?? '').trim().slice(0, 120)
  const pageSize = parsePageSize(searchParams.tamano)
  const category = categories.find((item) => item.slug === categorySlug) ?? null
  const brand = brands.find((item) => item.slug === brandSlug && item.is_active) ?? null
  const activeCategory = category?.slug ?? null
  const activeBrand = brand?.slug ?? null

  let filteredProducts = [...(products as OrderedProduct[])]
  if (category) filteredProducts = filteredProducts.filter((product) => product.category_id === category.id)
  if (brand) filteredProducts = filteredProducts.filter((product) => product.brand_id === brand.id)
  if (query) filteredProducts = filteredProducts.filter((product) => matchesSearch(product, query))

  filteredProducts.sort((a, b) => {
    if (category) return (a.category_sort_order ?? a.sort_order) - (b.category_sort_order ?? b.sort_order)
    return a.sort_order - b.sort_order
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const page = Math.min(parsePositiveInt(searchParams.pagina, 1), totalPages)
  const selectedProduct = productSlug ? products.find((product) => product.slug === productSlug) ?? null : null

  return {
    activeCategory,
    activeBrand,
    activeProduct: selectedProduct?.slug ?? null,
    query,
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
    brand?: string | null
    query?: string | null
    product?: string | null
    page?: number
    pageSize?: number
  },
) {
  const params = new URLSearchParams()
  if (state.category) params.set('categoria', state.category)
  if (state.brand) params.set('marca', state.brand)
  if (state.query?.trim()) params.set('buscar', state.query.trim())
  if (state.product) params.set('producto', state.product)
  if (state.page && state.page > 1) params.set('pagina', String(state.page))
  if (state.pageSize && state.pageSize !== DEFAULT_PAGE_SIZE) params.set('tamano', String(state.pageSize))
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
