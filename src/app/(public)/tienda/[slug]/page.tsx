import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoreLayout } from '@/components/landing/StoreLayout'
import { resolveStorefrontView, type StorefrontSearchParams } from '@/lib/storefront/view'
import { getStoreBySlug } from '@/lib/queries/store'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<StorefrontSearchParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data) return { title: 'Tienda no encontrada' }

  return {
    title: `${data.store.name} - Tienda`,
    description: data.content.hero_subtitle,
    openGraph: {
      title: data.store.name,
      description: data.content.hero_subtitle,
      images: data.content.hero_image_url ? [data.content.hero_image_url] : [],
    },
  }
}

export default async function TiendaPage({ params, searchParams }: Props) {
  const { slug } = await params
  const storefrontSearchParams = await searchParams

  const data = await getStoreBySlug(slug)
  if (!data) notFound()

  const view = resolveStorefrontView(data.products, data.categories, storefrontSearchParams)

  return <StoreLayout data={data} pathname={`/tienda/${slug}`} view={view} />
}
