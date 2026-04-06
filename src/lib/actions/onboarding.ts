'use server'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_CONTENT } from '@/data/defaults'
import { getOwnerStoreIdentity } from '@/lib/server/store-context'
import type { User } from '@supabase/supabase-js'

function generateSlugFromEmail(email: string): string {
  const base = email.split('@')[0]
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || 'mtienda'
}

async function ensureProfile(user: User) {
  const supabase = await createClient()
  const email = user.email?.trim()

  if (!email) {
    throw new Error('User email is required for onboarding.')
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email,
      full_name: user.user_metadata?.full_name ?? null,
    }, {
      onConflict: 'id',
    })

  if (error) {
    throw new Error(`Failed to ensure profile: ${error.message}`)
  }
}

async function findAvailableStoreSlug(email: string) {
  const supabase = await createClient()
  const baseSlug = generateSlugFromEmail(email)
  let suffix = 0

  while (true) {
    const candidateSlug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`
    const { data: existing, error } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', candidateSlug)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check store slug availability: ${error.message}`)
    }

    if (!existing) {
      return candidateSlug
    }

    suffix++
  }
}

async function ensureStoreScaffold(storeId: string) {
  const supabase = await createClient()
  const results = await Promise.all([
    supabase
      .from('store_theme')
      .upsert({ store_id: storeId, ...DEFAULT_THEME }, { onConflict: 'store_id', ignoreDuplicates: true }),
    supabase
      .from('store_layout')
      .upsert({ store_id: storeId, ...DEFAULT_LAYOUT }, { onConflict: 'store_id', ignoreDuplicates: true }),
    supabase
      .from('store_content')
      .upsert({ store_id: storeId, ...DEFAULT_CONTENT }, { onConflict: 'store_id', ignoreDuplicates: true }),
  ])

  const firstError = results.find((result) => result.error)?.error

  if (firstError) {
    throw new Error(`Failed to ensure store scaffold: ${firstError.message}`)
  }
}

async function createStoreForOwner(user: User) {
  const supabase = await createClient()
  const email = user.email?.trim()

  if (!email) {
    throw new Error('User email is required for onboarding.')
  }

  const storeName = user.user_metadata?.full_name ?? email.split('@')[0]

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = await findAvailableStoreSlug(email)

    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert({
        owner_id: user.id,
        slug,
        name: storeName,
        whatsapp: '',
      })
      .select('id, slug')
      .single()

    if (!storeError && newStore) {
      return newStore
    }

    const existingStore = await getOwnerStoreIdentity(user.id, supabase)
    if (existingStore) {
      return existingStore
    }

    if (storeError?.code === '23505') {
      continue
    }

    throw new Error(`Failed to create store: ${storeError?.message ?? 'Unknown error'}`)
  }

  throw new Error('Failed to create store after retrying.')
}

export async function ensureOnboarding(user: User): Promise<{ storeSlug: string }> {
  const supabase = await createClient()
  const email = user.email?.trim()

  if (!email) {
    throw new Error('User email is required for onboarding.')
  }

  await ensureProfile(user)

  let store = await getOwnerStoreIdentity(user.id, supabase)

  if (!store) {
    store = await createStoreForOwner(user)
  }

  await ensureStoreScaffold(store.id)

  return { storeSlug: store.slug }
}
