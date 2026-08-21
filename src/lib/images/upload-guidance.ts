import type { ImageUploadProfile } from '@/lib/images/client-optimizer'

export const IMAGE_WIDTH_GUIDANCE: Record<
  ImageUploadProfile,
  { minimum: number | null; recommended: number }
> = {
  product: { minimum: null, recommended: 800 },
  hero: { minimum: null, recommended: 1200 },
  logo: { minimum: 240, recommended: 240 },
}

export function buildImageQualityHint(profile: ImageUploadProfile, width: number) {
  const recommended = IMAGE_WIDTH_GUIDANCE[profile].recommended
  if (!Number.isFinite(width) || width >= recommended) return null

  if (profile === 'hero') {
    return `La subimos igual. Para una portada más nítida en pantallas grandes, cuando puedas usá una imagen de ${recommended}px o más.`
  }

  if (profile === 'product') {
    return `La imagen se puede usar. Para que se vea más nítida en pantallas grandes, recomendamos ${recommended}px o más de ancho.`
  }

  return `Para una imagen más nítida, recomendamos ${recommended}px o más de ancho.`
}
