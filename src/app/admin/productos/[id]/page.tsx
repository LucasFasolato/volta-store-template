import { redirect } from 'next/navigation'

export default async function EditProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/catalogo/${id}`)
}
