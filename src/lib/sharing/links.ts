const DEFAULT_APP_URL = 'https://www.voltastore.app'

function normalizeBaseUrl(value?: string | null) {
  const candidate = value?.trim() || DEFAULT_APP_URL
  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return DEFAULT_APP_URL
    return url.origin
  } catch {
    return DEFAULT_APP_URL
  }
}

export function normalizeTrackingToken(value: string, maxLength = 80) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, maxLength)
}

export function getPublicAppUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL)
}

export function buildStorePublicUrl(slug: string, baseUrl = getPublicAppUrl()) {
  return `${normalizeBaseUrl(baseUrl)}/tienda/${encodeURIComponent(slug)}`
}

export function buildProductPublicUrl(storeSlug: string, productSlug: string, baseUrl = getPublicAppUrl()) {
  const url = new URL(buildStorePublicUrl(storeSlug, baseUrl))
  url.searchParams.set('producto', productSlug)
  return url.toString()
}

export function buildTrackedPublicUrl(publicUrl: string, source: string, campaign?: string | null) {
  const url = new URL(publicUrl)
  const normalizedSource = normalizeTrackingToken(source, 64)
  const normalizedCampaign = campaign ? normalizeTrackingToken(campaign, 80) : ''

  if (normalizedSource) url.searchParams.set('src', normalizedSource)
  else url.searchParams.delete('src')

  if (normalizedCampaign) url.searchParams.set('campaign', normalizedCampaign)
  else url.searchParams.delete('campaign')

  return url.toString()
}

export function buildStoreShareMessage(storeName: string, publicUrl: string) {
  return `Te comparto ${storeName}: mirá el catálogo y armá tu pedido acá 👇\n${publicUrl}`
}

export function buildProductShareMessage(storeName: string, productName: string, publicUrl: string) {
  return `Mirá ${productName} en ${storeName} 👇\n${publicUrl}`
}

export function buildWhatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function buildSuggestedStoreMessages(storeName: string, publicUrl: string) {
  return [
    {
      id: 'direct',
      label: 'Directo',
      text: `Ya podés ver nuestro catálogo de ${storeName} y armar tu pedido online 👇\n${publicUrl}`,
    },
    {
      id: 'new-products',
      label: 'Novedades',
      text: `Tenemos novedades en ${storeName} ✨ Mirá productos, precios y opciones acá:\n${publicUrl}`,
    },
    {
      id: 'story',
      label: 'Historia / bio',
      text: `Todo nuestro catálogo en un solo link 👇\n${publicUrl}`,
    },
  ] as const
}
