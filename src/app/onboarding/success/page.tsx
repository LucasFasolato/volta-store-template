import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { needsOnboarding } from '@/lib/actions/onboarding'
import { requireAuthenticatedUser } from '@/lib/server/store-context'

export const metadata: Metadata = {
  title: 'Activando tu tienda - Volta Store',
  description: 'Volta Store te lleva al admin para seguir activando tu tienda.',
}

export default async function OnboardingSuccessPage() {
  const user = await requireAuthenticatedUser()
  const stillNeedsOnboarding = await needsOnboarding(user.id)

  if (stillNeedsOnboarding) {
    redirect('/onboarding')
  }

  redirect('/admin')
}
