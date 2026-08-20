export type ImageUploadProfile = 'product' | 'hero' | 'logo'

const MEBIBYTE = 1024 * 1024

export const IMAGE_UPLOAD_LIMITS = {
  sourceBytes: 20 * MEBIBYTE,
  sourcePixels: 55_000_000,
  product: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    maxBytes: 1.35 * MEBIBYTE,
  },
  hero: {
    maxWidth: 2200,
    maxHeight: 1600,
    quality: 0.84,
    maxBytes: 1.9 * MEBIBYTE,
  },
  logo: {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 0.9,
    maxBytes: 0.8 * MEBIBYTE,
  },
} as const

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i

type OptimizationResult = {
  file: File
  originalBytes: number
  optimizedBytes: number
  width: number
  height: number
}

function friendlyMegabytes(bytes: number) {
  return Math.max(1, Math.round(bytes / MEBIBYTE))
}

function sanitizeBaseName(name: string) {
  const withoutExtension = name.replace(/\.[^.]+$/, '')
  const safe = withoutExtension
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)

  return safe || 'imagen'
}

function loadImage(file: File) {
  return new Promise<{ image: HTMLImageElement; objectUrl: string }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = document.createElement('img')
    image.decoding = 'async'

    image.onload = () => resolve({ image, objectUrl })
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No pudimos leer esa imagen. Probá con otro archivo.'))
    }
    image.src = objectUrl
  })
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No pudimos optimizar esa imagen. Probá con otro archivo.'))
          return
        }
        resolve(blob)
      },
      'image/webp',
      quality,
    )
  })
}

export async function optimizeImageForUpload(
  file: File,
  profile: ImageUploadProfile,
): Promise<OptimizationResult> {
  const typeAllowed = ALLOWED_TYPES.has(file.type.toLowerCase())
  const extensionAllowed = ALLOWED_EXTENSIONS.test(file.name)

  if (!typeAllowed && !extensionAllowed) {
    throw new Error('Elegí una imagen JPG, PNG o WebP.')
  }

  if (file.size <= 0) {
    throw new Error('La imagen está vacía. Elegí otro archivo.')
  }

  if (file.size > IMAGE_UPLOAD_LIMITS.sourceBytes) {
    throw new Error(
      `La imagen original puede pesar hasta ${friendlyMegabytes(IMAGE_UPLOAD_LIMITS.sourceBytes)} MB.`,
    )
  }

  const settings = IMAGE_UPLOAD_LIMITS[profile]
  const { image, objectUrl } = await loadImage(file)

  try {
    const sourceWidth = image.naturalWidth
    const sourceHeight = image.naturalHeight

    if (!sourceWidth || !sourceHeight) {
      throw new Error('No pudimos detectar el tamaño de esa imagen.')
    }

    if (sourceWidth * sourceHeight > IMAGE_UPLOAD_LIMITS.sourcePixels) {
      throw new Error('La imagen es demasiado grande. Elegí una versión de menor resolución.')
    }

    const fitScale = Math.min(
      1,
      settings.maxWidth / sourceWidth,
      settings.maxHeight / sourceHeight,
    )
    const scaleSteps = [1, 0.88, 0.76]
    const qualitySteps = [
      settings.quality,
      Math.max(0.68, settings.quality - 0.08),
      Math.max(0.62, settings.quality - 0.15),
    ]

    let lastBlob: Blob | null = null
    let lastWidth = Math.max(1, Math.round(sourceWidth * fitScale))
    let lastHeight = Math.max(1, Math.round(sourceHeight * fitScale))

    for (const extraScale of scaleSteps) {
      const width = Math.max(1, Math.round(sourceWidth * fitScale * extraScale))
      const height = Math.max(1, Math.round(sourceHeight * fitScale * extraScale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d', { alpha: true })
      if (!context) {
        throw new Error('Tu navegador no pudo preparar la imagen. Intentá nuevamente.')
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, width, height)

      for (const quality of qualitySteps) {
        const blob = await canvasToWebp(canvas, quality)
        lastBlob = blob
        lastWidth = width
        lastHeight = height

        if (blob.size <= settings.maxBytes) {
          const optimizedFile = new File([blob], `${sanitizeBaseName(file.name)}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          })

          return {
            file: optimizedFile,
            originalBytes: file.size,
            optimizedBytes: blob.size,
            width,
            height,
          }
        }
      }
    }

    if (!lastBlob) {
      throw new Error('No pudimos optimizar esa imagen. Probá con otro archivo.')
    }

    throw new Error(
      `La imagen sigue siendo demasiado pesada después de optimizarla. Probá con una foto más simple o de menor resolución.`,
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
