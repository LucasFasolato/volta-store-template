export type ImageUploadProfile = 'product' | 'hero' | 'logo'

type EncodedImageMime = 'image/jpeg' | 'image/png' | 'image/webp'

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

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i
const FILE_EXTENSION_BY_MIME: Record<EncodedImageMime, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

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
      reject(new Error('No pudimos leer esa imagen. Probá con otra foto o captura.'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: EncodedImageMime,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No pudimos optimizar esa imagen. Probá con otro archivo.'))
          return
        }
        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

async function detectBlobMime(blob: Blob): Promise<EncodedImageMime | null> {
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer())

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

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: EncodedImageMime,
  quality: number,
) {
  const blob = await canvasToBlob(canvas, mimeType, quality)
  const detectedMime = await detectBlobMime(blob)

  if (!detectedMime) {
    throw new Error('Tu navegador generó una imagen que no pudimos validar.')
  }

  return { blob, mimeType: detectedMime }
}

function addJpegBackground(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  context.save()
  context.globalCompositeOperation = 'destination-over'
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.restore()
}

export async function optimizeImageForUpload(
  file: File,
  profile: ImageUploadProfile,
): Promise<OptimizationResult> {
  const normalizedType = file.type.toLowerCase()
  const typeAllowed = ALLOWED_TYPES.has(normalizedType)
  const extensionAllowed = ALLOWED_EXTENSIONS.test(file.name)

  if (!typeAllowed && !extensionAllowed) {
    throw new Error('Elegí una foto o imagen JPG, PNG, WebP, HEIC o HEIF.')
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
    const scaleSteps = [1, 0.88, 0.76, 0.64, 0.52]
    const qualitySteps = [
      settings.quality,
      Math.max(0.68, settings.quality - 0.08),
      Math.max(0.62, settings.quality - 0.15),
    ]

    let outputMime: EncodedImageMime | null = null
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
        let encoded = await encodeCanvas(canvas, outputMime ?? 'image/webp', quality)

        // Older Safari/iOS versions may silently return PNG bytes when WebP is
        // requested. Never relabel those bytes as WebP: switch to a format the
        // browser can actually encode and preserve transparency for logos.
        if (!outputMime && encoded.mimeType !== 'image/webp') {
          outputMime = profile === 'logo' ? 'image/png' : 'image/jpeg'
          if (outputMime === 'image/jpeg') addJpegBackground(canvas, context)
          encoded = await encodeCanvas(canvas, outputMime, quality)
        } else if (!outputMime) {
          outputMime = encoded.mimeType
        }

        lastBlob = encoded.blob
        lastWidth = width
        lastHeight = height

        if (encoded.blob.size <= settings.maxBytes) {
          const actualMime = encoded.mimeType
          const extension = FILE_EXTENSION_BY_MIME[actualMime]
          const optimizedFile = new File(
            [encoded.blob],
            `${sanitizeBaseName(file.name)}.${extension}`,
            {
              type: actualMime,
              lastModified: Date.now(),
            },
          )

          return {
            file: optimizedFile,
            originalBytes: file.size,
            optimizedBytes: encoded.blob.size,
            width,
            height,
          }
        }

        if (outputMime === 'image/png') break
      }
    }

    if (!lastBlob) {
      throw new Error('No pudimos optimizar esa imagen. Probá con otro archivo.')
    }

    throw new Error(
      'La imagen sigue siendo demasiado pesada después de optimizarla. Probá con una foto más simple o de menor resolución.',
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
