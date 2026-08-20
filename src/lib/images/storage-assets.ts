const MEBIBYTE = 1024 * 1024

export const STORE_ASSET_BUCKET = 'store-assets'
export const MAX_PRODUCT_IMAGES = 12

export const OPTIMIZED_IMAGE_LIMITS = {
  product: 1.5 * MEBIBYTE,
  hero: 2.1 * MEBIBYTE,
  logo: 1 * MEBIBYTE,
} as const

export type ServerImageProfile = keyof typeof OPTIMIZED_IMAGE_LIMITS

function isWebpHeader(bytes: Uint8Array) {
  if (bytes.length < 12) return false

  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
}

export async function validateOptimizedWebp(file: File, profile: ServerImageProfile) {
  if (!file || file.size <= 0) return 'No recibimos una imagen válida.'

  if (file.type !== 'image/webp') {
    return 'La imagen no llegó optimizada. Volvé a seleccionarla desde VOLTA.'
  }

  if (file.size > OPTIMIZED_IMAGE_LIMITS[profile]) {
    return 'La imagen optimizada sigue siendo demasiado pesada. Probá con otra foto.'
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (!isWebpHeader(header)) {
    return 'El archivo no es una imagen WebP válida.'
  }

  return null
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
