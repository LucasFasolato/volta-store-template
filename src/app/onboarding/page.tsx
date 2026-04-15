import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { ensureOnboarding } from '@/lib/actions/onboarding'
import { requireAuthenticatedUser } from '@/lib/server/store-context'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Empieza a activar tu tienda - Volta Store',
  description: 'Completa lo esencial y entra al panel de activacion de tu tienda.',
}

export default async function OnboardingPage() {
  const user = await requireAuthenticatedUser()
  await ensureOnboarding(user)

  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name, whatsapp')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (store?.whatsapp?.trim()) {
    redirect('/admin')
  }

  return <OnboardingWizard initialName={store?.name ?? ''} />
}
