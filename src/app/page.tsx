import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/server/store-context'

export default async function RootPage() {
  const user = await getAuthenticatedUser()

  if (user) {
    redirect('/admin')
  } else {
    redirect('/login')
  }
}
