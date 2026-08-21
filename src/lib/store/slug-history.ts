export type StoreSlugRedirectSearchParams = Record<string, string | string[] | undefined>

export function buildStoreSlugRedirectPath(
  canonicalSlug: string,
  searchParams: StoreSlugRedirectSearchParams,
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
      continue
    }
    if (value != null) params.set(key, value)
  }

  const query = params.toString()
  const pathname = `/tienda/${encodeURIComponent(canonicalSlug)}`
  return query ? `${pathname}?${query}` : pathname
}
