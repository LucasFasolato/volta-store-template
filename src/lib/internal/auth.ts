import 'server-only'

import { redirect } from 'next/navigation'
import { requireAuthenticatedUser } from '@/lib/server/store-context'

function internalAdminEmails() {
  return new Set(
    (process.env.VOLTA_INTERNAL_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isInternalAdminConfigured() {
  return internalAdminEmails().size > 0
}

export async function requireInternalAdmin() {
  const user = await requireAuthenticatedUser()
  const email = user.email?.trim().toLowerCase()
  if (!email || !internalAdminEmails().has(email)) redirect('/admin')
  return user
}
