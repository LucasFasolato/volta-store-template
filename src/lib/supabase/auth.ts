import type { User } from '@supabase/supabase-js'

type AuthUserResponse = {
  data?: {
    user?: User | null
  } | null
  error?: unknown
}

type AuthClientLike = {
  auth: {
    getUser: () => Promise<AuthUserResponse>
  }
}

export type SafeUserResult = {
  user: User | null
  error: unknown | null
  invalidRefreshToken: boolean
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error) return false

  const fragments = [
    typeof error === 'string' ? error : null,
    error instanceof Error ? error.message : null,
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : null,
    typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : null,
    typeof error === 'object' && error !== null && 'error_code' in error ? String(error.error_code) : null,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return (
    fragments.includes('refresh_token_not_found') ||
    fragments.includes('invalid refresh token') ||
    fragments.includes('refresh token not found')
  )
}

export function isSupabaseAuthCookieName(name: string): boolean {
  const normalized = name.toLowerCase()
  return (
    normalized.startsWith('sb-') ||
    normalized.includes('supabase') ||
    normalized.includes('auth-token')
  )
}

export async function safeGetUser(client: AuthClientLike): Promise<SafeUserResult> {
  try {
    const { data, error } = await client.auth.getUser()

    if (error) {
      return {
        user: null,
        error,
        invalidRefreshToken: isInvalidRefreshTokenError(error),
      }
    }

    return {
      user: data?.user ?? null,
      error: null,
      invalidRefreshToken: false,
    }
  } catch (error) {
    return {
      user: null,
      error,
      invalidRefreshToken: isInvalidRefreshTokenError(error),
    }
  }
}
