import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuthenticatedUser } from '@/lib/server/store-context'
import { ensureOnboarding } from '@/lib/actions/onboarding'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const metadata: Metadata = {
  title: 'Configura tu tienda - Volta Store',
  description: 'Configura tu tienda en menos de un minuto',
}

export default async function OnboardingPage() {
  const user = await requireAuthenticatedUser()
  await ensureOnboarding(user)

  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name, whatsapp')
    .eq('owner_id', user.id)
    .single()

  // Already completed onboarding
  if (store?.whatsapp) {
    redirect('/admin')
  }

  return <OnboardingWizard initialName={store?.name ?? ''} />
}
