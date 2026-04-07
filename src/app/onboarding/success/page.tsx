import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingSuccess } from '@/components/onboarding/OnboardingSuccess'
import { needsOnboarding } from '@/lib/actions/onboarding'
import { requireAuthenticatedUser } from '@/lib/server/store-context'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Tu tienda fue creada - Volta Store',
  description: 'Volta Store creo tu tienda y te lleva al admin para terminar de activarla.',
}

export default async function OnboardingSuccessPage() {
  const user = await requireAuthenticatedUser()
  const stillNeedsOnboarding = await needsOnboarding(user.id)

  if (stillNeedsOnboarding) {
    redirect('/onboarding')
  }

  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name')
    .eq('owner_id', user.id)
    .maybeSingle()

  return <OnboardingSuccess storeName={store?.name ?? 'Tu tienda'} />
}
