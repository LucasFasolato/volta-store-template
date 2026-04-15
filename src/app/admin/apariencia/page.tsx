import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AparienciaPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const rawTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab
  const suffix = rawTab ? `?tab=${encodeURIComponent(rawTab)}` : ''

  redirect(`/admin/tienda${suffix}`)
}
