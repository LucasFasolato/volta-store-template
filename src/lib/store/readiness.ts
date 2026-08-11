import type { AdminStoreData, ProductWithImages } from '@/types/store'
import { storeConfigSchema, storeSlugSchema } from '@/lib/validations/store'

export type StoreReadinessCheckKey =
  | 'brand-name'
  | 'slug'
  | 'whatsapp'
  | 'hero-copy'
  | 'hero-image'
  | 'active-product'
  | 'product-price'

export type StoreReadinessCheck = {
  key: StoreReadinessCheckKey
  label: string
  passed: boolean
  blocking: boolean
  detail: string
  href: string
  ctaLabel: string
}

export type StoreReadinessReport = {
  canPublish: boolean
  score: number
  checks: StoreReadinessCheck[]
  blockingChecks: StoreReadinessCheck[]
  passedChecks: number
  totalChecks: number
  passedBlockingChecks: number
  totalBlockingChecks: number
}

function isValidStoreName(name: string) {
  return name.trim().length >= 2
}

function isValidSlug(slug: string) {
  return storeSlugSchema.safeParse(slug.trim()).success
}

function isValidWhatsapp(whatsapp: string) {
  return storeConfigSchema.shape.whatsapp.safeParse(whatsapp.trim()).success
}

function hasValidHeroCopy(title: string, subtitle: string) {
  return title.trim().length >= 4 && subtitle.trim().length >= 12
}

function buildCheck(input: StoreReadinessCheck) {
  return input
}

export function evaluateStoreReadiness({
  storeData,
  products,
}: {
  storeData: AdminStoreData
  products: ProductWithImages[]
}): StoreReadinessReport {
  const { store, content } = storeData
  const activeProducts = products.filter((product) => product.is_active)
  const activeProductsWithPrice = activeProducts.filter((product) => product.price > 0)

  const checks = [
    buildCheck({
      key: 'brand-name',
      label: 'Nombre del negocio',
      passed: isValidStoreName(store.name),
      blocking: true,
      detail: isValidStoreName(store.name)
        ? 'Tu marca ya se muestra con un nombre claro.'
        : 'Definí un nombre corto y claro para que la tienda se entienda rápido.',
      href: '/admin/negocio',
      ctaLabel: 'Completar negocio',
    }),
    buildCheck({
      key: 'slug',
      label: 'Enlace público',
      passed: isValidSlug(store.slug),
      blocking: true,
      detail: isValidSlug(store.slug)
        ? 'La URL pública ya tiene un formato válido.'
        : 'Revisá el enlace público para que sea fácil de compartir y no falle.',
      href: '/admin/negocio',
      ctaLabel: 'Revisar enlace',
    }),
    buildCheck({
      key: 'whatsapp',
      label: 'WhatsApp para pedidos',
      passed: isValidWhatsapp(store.whatsapp),
      blocking: true,
      detail: isValidWhatsapp(store.whatsapp)
        ? 'El número que recibe pedidos ya está listo.'
        : 'Agregá un WhatsApp válido para que los pedidos lleguen sin fricción.',
      href: '/admin/negocio',
      ctaLabel: 'Configurar WhatsApp',
    }),
    buildCheck({
      key: 'hero-copy',
      label: 'Portada con mensaje claro',
      passed: hasValidHeroCopy(content.hero_title, content.hero_subtitle),
      blocking: true,
      detail: hasValidHeroCopy(content.hero_title, content.hero_subtitle)
        ? 'La portada ya explica qué vendés en un vistazo.'
        : 'Completá título y subtítulo para que la portada cuente rápido qué vendés.',
      href: '/admin/tienda?tab=contenido',
      ctaLabel: 'Completar portada',
    }),
    buildCheck({
      key: 'hero-image',
      label: 'Imagen de portada',
      passed: Boolean(content.hero_image_url),
      blocking: true,
      detail: content.hero_image_url
        ? 'La portada ya tiene una imagen que completa la primera impresión.'
        : 'Subí una imagen de portada para completar este paso.',
      href: '/admin/tienda?tab=contenido',
      ctaLabel: 'Subir portada',
    }),
    buildCheck({
      key: 'active-product',
      label: 'Producto activo',
      passed: activeProducts.length >= 1,
      blocking: true,
      detail:
        activeProducts.length >= 1
          ? 'Ya hay al menos un producto real para vender.'
          : 'Agregá al menos un producto activo para que la tienda tenga algo concreto.',
      href: activeProducts.length > 0 ? '/admin/catalogo' : '/admin/catalogo/nuevo',
      ctaLabel: activeProducts.length > 0 ? 'Ver productos' : 'Agregar producto',
    }),
    buildCheck({
      key: 'product-price',
      label: 'Producto con precio',
      passed: activeProductsWithPrice.length >= 1,
      blocking: true,
      detail:
        activeProductsWithPrice.length >= 1
          ? 'Al menos un producto activo ya tiene precio visible.'
          : 'Necesitás al menos un producto activo con precio para publicar.',
      href: activeProducts.length > 0 ? '/admin/catalogo' : '/admin/catalogo/nuevo',
      ctaLabel: activeProducts.length > 0 ? 'Completar producto' : 'Agregar producto',
    }),
  ] satisfies StoreReadinessCheck[]

  const blockingChecks = checks.filter((check) => check.blocking)
  const passedChecks = checks.filter((check) => check.passed).length
  const passedBlockingChecks = blockingChecks.filter((check) => check.passed).length
  const totalChecks = checks.length
  const totalBlockingChecks = blockingChecks.length

  return {
    canPublish: blockingChecks.every((check) => check.passed),
    score: Math.round((passedChecks / totalChecks) * 100),
    checks,
    blockingChecks,
    passedChecks,
    totalChecks,
    passedBlockingChecks,
    totalBlockingChecks,
  }
}
