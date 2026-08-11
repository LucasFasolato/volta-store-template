import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingSuccessTransition } from '@/components/onboarding/OnboardingSuccessTransition'
import { needsOnboarding } from '@/lib/actions/onboarding'
import { requireAuthenticatedUser } from '@/lib/server/store-context'

export const metadata: Metadata = {
  title: 'Tu tienda ya existe - Volta Store',
  description: 'VOLTA está preparando tu tienda para entrar al panel.',
}

export default async function OnboardingSuccessPage() {
  const user = await requireAuthenticatedUser()
  const stillNeedsOnboarding = await needsOnboarding(user.id)

  if (stillNeedsOnboarding) redirect('/onboarding')

  return <OnboardingSuccessTransition />
}
