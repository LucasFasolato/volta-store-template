import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingSuccessTransition } from '@/components/onboarding/OnboardingSuccessTransition'
import { needsOnboarding } from '@/lib/actions/onboarding'
import { requireAuthenticatedUser } from '@/lib/server/store-context'

export const metadata: Metadata = {
  title: 'Estamos creando tu tienda - Volta Store',
  description: 'VOLTA está preparando tu tienda para guiarte paso a paso.',
}

export default async function OnboardingSuccessPage() {
  const user = await requireAuthenticatedUser()
  const stillNeedsOnboarding = await needsOnboarding(user.id)

  if (stillNeedsOnboarding) redirect('/onboarding')

  return <OnboardingSuccessTransition />
}
