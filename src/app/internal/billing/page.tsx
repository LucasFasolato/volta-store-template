import { InternalBillingConsole } from '@/components/internal/InternalBillingConsole'
import { getInternalBillingStores } from '@/lib/internal/billing'
import { requireInternalAdmin } from '@/lib/internal/auth'

export const dynamic = 'force-dynamic'

export default async function InternalBillingPage() {
  await requireInternalAdmin()
  const stores = await getInternalBillingStores()
  return <InternalBillingConsole stores={stores} />
}
