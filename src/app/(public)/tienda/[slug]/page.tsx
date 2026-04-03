import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoreLayout } from '@/components/landing/StoreLayout'
import { getStoreBySlug } from '@/lib/queries/store'
import { buildThemeVars, FONT_FAMILY_CSS, FONT_URLS } from '@/lib/utils/theme'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ categoria?: string; producto?: string }>
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
  const { categoria, producto } = await searchParams

  const data = await getStoreBySlug(slug)
  if (!data) notFound()

  const themeVars = buildThemeVars(data.theme)
  const fontFamily = FONT_FAMILY_CSS[data.theme.font_family] ?? FONT_FAMILY_CSS.inter
  const fontUrl = FONT_URLS[data.theme.font_family]

  return (
    <>
      {fontUrl ? <link rel="stylesheet" href={fontUrl} /> : null}

      <div
        style={{
          ...themeVars,
          backgroundColor: 'var(--store-bg)',
          color: 'var(--store-text)',
          fontFamily,
          minHeight: '100dvh',
        }}
      >
        <StoreLayout data={data} activeCategory={categoria} activeProduct={producto} />
      </div>
    </>
  )
}
