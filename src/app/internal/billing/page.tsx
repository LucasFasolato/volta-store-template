import { InternalBillingConsole } from '@/components/internal/InternalBillingConsole'
import { getInternalBillingStores, getInternalBillingUnitEconomics } from '@/lib/internal/billing'
import { requireInternalAdmin } from '@/lib/internal/auth'

export const dynamic = 'force-dynamic'

export default async function InternalBillingPage() {
  await requireInternalAdmin()
  const [stores, economics] = await Promise.all([
    getInternalBillingStores(),
    getInternalBillingUnitEconomics(),
  ])
  return <InternalBillingConsole stores={stores} economics={economics} />
}
