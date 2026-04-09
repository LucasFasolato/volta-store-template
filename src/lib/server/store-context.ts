import 'server-only'

import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import type { AdminStoreData, Store } from '@/types/store'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>
type StoreIdentity = Pick<Store, 'id' | 'slug'>

function formatLookupError(resource: string, message: string) {
  return new Error(`Failed to resolve ${resource}: ${message}`)
}

async function getServerUser(supabase: ServerSupabaseClient): Promise<User | null> {
  const result = await safeGetUser(supabase)

  if (result.error) {
    console.warn('Supabase auth getUser failed in server context.', result.error)
  }

  return result.user
}

export async function getAuthenticatedUser(
  supabase?: ServerSupabaseClient,
): Promise<User | null> {
  const client = supabase ?? await createClient()
  return getServerUser(client)
}

export async function requireAuthenticatedUser(): Promise<User> {
  const supabase = await createClient()
  const user = await getServerUser(supabase)

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function getOwnerStoreIdentity(
  userId: string,
  supabase?: ServerSupabaseClient,
): Promise<StoreIdentity | null> {
  const client = supabase ?? await createClient()
  const { data: store, error } = await client
    .from('stores')
    .select('id, slug')
    .eq('owner_id', userId)
    .maybeSingle()

  if (error) {
    throw formatLookupError('owner store', error.message)
  }

  return store
}

export async function getOwnerStoreData(
  userId: string,
  supabase?: ServerSupabaseClient,
): Promise<AdminStoreData | null> {
  const client = supabase ?? await createClient()
  const { data: store, error: storeError } = await client
    .from('stores')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle()

  if (storeError) {
    throw formatLookupError('owner store', storeError.message)
  }

  if (!store) {
    return null
  }

  const [themeRes, layoutRes, contentRes] = await Promise.all([
    client.from('store_theme').select('*').eq('store_id', store.id).maybeSingle(),
    client.from('store_layout').select('*').eq('store_id', store.id).maybeSingle(),
    client.from('store_content').select('*').eq('store_id', store.id).maybeSingle(),
  ])

  if (themeRes.error) {
    throw formatLookupError('store theme', themeRes.error.message)
  }

  if (layoutRes.error) {
    throw formatLookupError('store layout', layoutRes.error.message)
  }

  if (contentRes.error) {
    throw formatLookupError('store content', contentRes.error.message)
  }

  if (!themeRes.data || !layoutRes.data || !contentRes.data) {
    return null
  }

  return {
    store,
    theme: themeRes.data,
    layout: layoutRes.data,
    content: contentRes.data,
  }
}

export async function requireAuthenticatedStoreContext(): Promise<{
  supabase: ServerSupabaseClient
  user: User
  store: StoreIdentity
}> {
  const supabase = await createClient()
  const user = await getServerUser(supabase)

  if (!user) {
    redirect('/login')
  }

  const store = await getOwnerStoreIdentity(user.id, supabase)

  if (!store) {
    redirect('/login')
  }

  return { supabase, user, store }
}

export async function requireAuthenticatedAdminStore(): Promise<{
  user: User
  storeData: AdminStoreData
}> {
  const supabase = await createClient()
  const user = await getServerUser(supabase)

  if (!user) {
    redirect('/login')
  }

  const storeData = await getOwnerStoreData(user.id, supabase)

  if (!storeData) {
    redirect('/login')
  }

  return { user, storeData }
}
