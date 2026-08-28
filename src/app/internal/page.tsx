import { redirect } from 'next/navigation'
import { requireInternalAdmin } from '@/lib/internal/auth'

export default async function InternalPage() {
  await requireInternalAdmin()
  redirect('/internal/analytics')
}
