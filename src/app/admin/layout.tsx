import { redirect } from 'next/navigation'
import { ensureOnboarding, needsOnboarding } from '@/lib/actions/onboarding'
import { getOwnerStoreData, requireAuthenticatedUser } from '@/lib/server/store-context'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthenticatedUser()
  await ensureOnboarding(user)
  const shouldFinishOnboarding = await needsOnboarding(user.id)
  if (shouldFinishOnboarding) redirect('/onboarding')
  const storeData = await getOwnerStoreData(user.id)
  if (!storeData) redirect('/login')
  return <AdminShell storeName={storeData.store.name}>{children}</AdminShell>
}
