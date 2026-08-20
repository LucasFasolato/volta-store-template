type OriginEnvironment = Record<string, string | undefined>

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/
const ENCODED_PATH_SEPARATOR = /%(?:2f|5c)/i
const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

function isLoopback(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function configuredOrigin(value: string | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value.trim())
    const allowedProtocol = url.protocol === 'https:' || (url.protocol === 'http:' && isLoopback(url.hostname))
    if (
      !allowedProtocol ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

function vercelOrigin(value: string | undefined): string | null {
  const hostname = value?.trim().toLowerCase()
  if (!hostname || !HOSTNAME.test(hostname)) return null
  return `https://${hostname}`
}

function localOrigin(host: string | null | undefined): string | null {
  if (!host || CONTROL_CHARACTERS.test(host)) return null

  try {
    const url = new URL(`http://${host}`)
    if (url.username || url.password || !isLoopback(url.hostname) || url.pathname !== '/') return null
    return url.origin
  } catch {
    return null
  }
}

export function resolveMagicLinkOrigin(
  environment: OriginEnvironment,
  requestHost?: string | null,
): string {
  const deploymentEnvironment = environment.VERCEL_ENV ?? environment.NEXT_PUBLIC_VERCEL_ENV
  const appOrigin = configuredOrigin(environment.NEXT_PUBLIC_APP_URL)

  if (deploymentEnvironment === 'preview') {
    const previewOrigin =
      vercelOrigin(environment.VERCEL_BRANCH_URL ?? environment.NEXT_PUBLIC_VERCEL_BRANCH_URL) ??
      vercelOrigin(environment.VERCEL_URL ?? environment.NEXT_PUBLIC_VERCEL_URL)
    if (previewOrigin) return previewOrigin
  }

  if (appOrigin) return appOrigin

  if (deploymentEnvironment === 'production') {
    const productionOrigin =
      vercelOrigin(environment.VERCEL_PROJECT_PRODUCTION_URL ?? environment.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
      vercelOrigin(environment.VERCEL_URL ?? environment.NEXT_PUBLIC_VERCEL_URL)
    if (productionOrigin) return productionOrigin
  }

  if (environment.NODE_ENV === 'development' || deploymentEnvironment === 'development') {
    const developmentOrigin = localOrigin(requestHost)
    if (developmentOrigin) return developmentOrigin
  }

  throw new Error('No trusted application origin is configured.')
}

export function sanitizeInternalRedirect(
  value: string | null | undefined,
  fallback = '/admin',
): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    CONTROL_CHARACTERS.test(value) ||
    ENCODED_PATH_SEPARATOR.test(value)
  ) {
    return fallback
  }

  try {
    const base = new URL('https://internal.voltastore.invalid')
    const destination = new URL(value, base)
    if (destination.origin !== base.origin) return fallback
    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch {
    return fallback
  }
}
