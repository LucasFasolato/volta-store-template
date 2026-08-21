import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { StoreLayout } from '@/components/landing/StoreLayout'
import { resolveStorefrontView, type StorefrontSearchParams } from '@/lib/storefront/view'
import { getStoreBySlug, resolveHistoricalStoreSlug } from '@/lib/queries/store'
import { buildProductPublicUrl, buildStorePublicUrl } from '@/lib/sharing/links'
import { buildStoreSlugRedirectPath, type StoreSlugRedirectSearchParams } from '@/lib/store/slug-history'
import { formatCurrency } from '@/lib/utils/format'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<StorefrontSearchParams>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, storefrontSearchParams] = await Promise.all([params, searchParams])
  let data = await getStoreBySlug(slug)

  if (!data) {
    const canonicalSlug = await resolveHistoricalStoreSlug(slug)
    if (canonicalSlug) data = await getStoreBySlug(canonicalSlug)
  }

  if (!data) return { title: 'Tienda no encontrada', robots: { index: false, follow: false } }

  const requestedProductSlug = firstValue(storefrontSearchParams.producto)
  const product = requestedProductSlug
    ? data.products.find((candidate) => candidate.slug === requestedProductSlug) ?? null
    : null
  const storeUrl = buildStorePublicUrl(data.store.slug)

  if (product) {
    const productUrl = buildProductPublicUrl(data.store.slug, product.slug)
    const productDescription = product.short_description?.trim()
      || product.description?.trim()
      || `${product.name} en ${data.store.name}. ${formatCurrency(product.price)}. Consultá y armá tu pedido por WhatsApp.`
    const images = product.images[0]?.url ? [product.images[0].url] : []
    const title = `${product.name} · ${data.store.name}`

    return {
      title,
      description: productDescription,
      alternates: { canonical: productUrl },
      openGraph: {
        type: 'website',
        url: productUrl,
        siteName: data.store.name,
        title,
        description: productDescription,
        images,
      },
      twitter: {
        card: images.length > 0 ? 'summary_large_image' : 'summary',
        title,
        description: productDescription,
        images,
      },
    }
  }

  const description = data.content.hero_subtitle?.trim()
    || `Mirá el catálogo de ${data.store.name} y armá tu pedido por WhatsApp.`
  const images = data.content.hero_image_url ? [data.content.hero_image_url] : []

  return {
    title: `${data.store.name} · Catálogo online`,
    description,
    alternates: { canonical: storeUrl },
    openGraph: {
      type: 'website',
      url: storeUrl,
      siteName: data.store.name,
      title: data.store.name,
      description,
      images,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title: data.store.name,
      description,
      images,
    },
  }
}

export default async function TiendaPage({ params, searchParams }: Props) {
  const { slug } = await params
  const storefrontSearchParams = await searchParams

  const data = await getStoreBySlug(slug)
  if (!data) {
    const canonicalSlug = await resolveHistoricalStoreSlug(slug)
    if (canonicalSlug) {
      permanentRedirect(
        buildStoreSlugRedirectPath(
          canonicalSlug,
          storefrontSearchParams as StoreSlugRedirectSearchParams,
        ),
      )
    }
    notFound()
  }

  const view = resolveStorefrontView(data.products, data.categories, data.brands, storefrontSearchParams)

  return <StoreLayout data={data} pathname={`/tienda/${data.store.slug}`} view={view} />
}
