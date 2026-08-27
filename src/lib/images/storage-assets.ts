const MEBIBYTE = 1024 * 1024

export const STORE_ASSET_BUCKET = 'store-assets'
export const MAX_PRODUCT_IMAGES = 12

export const OPTIMIZED_IMAGE_LIMITS = {
  product: 1.5 * MEBIBYTE,
  hero: 2.1 * MEBIBYTE,
  logo: 1 * MEBIBYTE,
} as const

export type ServerImageProfile = keyof typeof OPTIMIZED_IMAGE_LIMITS
export type OptimizedImageMime = 'image/jpeg' | 'image/png' | 'image/webp'

const IMAGE_EXTENSION_BY_MIME: Record<OptimizedImageMime, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function detectImageMime(bytes: Uint8Array): OptimizedImageMime | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  return null
}

export async function getOptimizedImageMetadata(file: File, profile: ServerImageProfile) {
  if (!file || file.size <= 0) {
    return {
      error: 'No recibimos una imagen válida.',
      contentType: null,
      extension: null,
    }
  }

  if (file.size > OPTIMIZED_IMAGE_LIMITS[profile]) {
    return {
      error: 'La imagen optimizada sigue siendo demasiado pesada. Probá con otra foto.',
      contentType: null,
      extension: null,
    }
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const contentType = detectImageMime(header)

  if (!contentType) {
    return {
      error: 'No pudimos validar esa imagen. Volvé a seleccionarla e intentá nuevamente.',
      contentType: null,
      extension: null,
    }
  }

  return {
    error: null,
    contentType,
    extension: IMAGE_EXTENSION_BY_MIME[contentType],
  }
}

/**
 * Backward-compatible validator kept while older upload actions migrate.
 * The browser may legitimately fall back to JPEG/PNG when WebP canvas encoding
 * is unavailable (notably some Safari/iOS versions), so validation is based on
 * the real file signature instead of trusting the declared MIME type.
 */
export async function validateOptimizedWebp(file: File, profile: ServerImageProfile) {
  const metadata = await getOptimizedImageMetadata(file, profile)
  return metadata.error
}

export function storagePathFromPublicUrl(publicUrl: string | null | undefined) {
  if (!publicUrl) return null

  try {
    const url = new URL(publicUrl)
    const marker = `/storage/v1/object/public/${STORE_ASSET_BUCKET}/`
    const index = url.pathname.indexOf(marker)
    if (index < 0) return null

    const encodedPath = url.pathname.slice(index + marker.length)
    return decodeURIComponent(encodedPath)
  } catch {
    return null
  }
}

export async function removeStoragePaths(
  supabase: any,
  paths: Array<string | null | undefined>,
) {
  const uniquePaths = Array.from(
    new Set(paths.filter((path): path is string => Boolean(path && path.trim()))),
  )

  if (uniquePaths.length === 0) return null

  for (let index = 0; index < uniquePaths.length; index += 100) {
    const chunk = uniquePaths.slice(index, index + 100)
    const { error } = await supabase.storage.from(STORE_ASSET_BUCKET).remove(chunk)
    if (error) return error.message
  }

  return null
}

export async function listStorageFolderPaths(supabase: any, folder: string) {
  const paths: string[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(STORE_ASSET_BUCKET).list(folder, {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) return { paths, error: error.message }
    const entries = data ?? []

    for (const entry of entries) {
      if (entry.name) paths.push(`${folder}/${entry.name}`)
    }

    if (entries.length < 100) break
    offset += entries.length
  }

  return { paths, error: null as string | null }
}
