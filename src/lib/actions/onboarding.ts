'use server'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_CONTENT } from '@/data/defaults'
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

export async function ensureOnboarding(user: User): Promise<{ storeSlug: string }> {
  const supabase = await createClient()

  // 1. Ensure profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name ?? null,
    })
  }

  // 2. Check if store exists
  const { data: store } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  if (store) {
    return { storeSlug: store.slug }
  }

  // 3. Create store with unique slug
  let slug = generateSlugFromEmail(user.email!)
  let suffix = 0

  while (true) {
    const candidateSlug = suffix === 0 ? slug : `${slug}-${suffix}`
    const { data: existing } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', candidateSlug)
      .single()

    if (!existing) {
      slug = candidateSlug
      break
    }
    suffix++
  }

  const storeName = user.user_metadata?.full_name ?? user.email!.split('@')[0]

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

  if (storeError || !newStore) {
    throw new Error(`Failed to create store: ${storeError?.message}`)
  }

  // 4. Create theme, layout, content with defaults
  await Promise.all([
    supabase.from('store_theme').insert({ store_id: newStore.id, ...DEFAULT_THEME }),
    supabase.from('store_layout').insert({ store_id: newStore.id, ...DEFAULT_LAYOUT }),
    supabase.from('store_content').insert({ store_id: newStore.id, ...DEFAULT_CONTENT }),
  ])

  return { storeSlug: newStore.slug }
}
