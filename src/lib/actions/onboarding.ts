'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { User } from '@supabase/supabase-js'
import { DEFAULT_CONTENT, DEFAULT_LAYOUT, DEFAULT_THEME } from '@/data/defaults'
import { getOwnerStoreIdentity } from '@/lib/server/store-context'
import { safeGetUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

function generateSlugFromEmail(email: string): string {
  const base = email.split('@')[0]
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32) || 'mtienda'
  )
}

function buildInitialHeroContent(storeName: string) {
  return {
    banner_mode: 'static' as const,
    banner_speed: 'normal' as const,
    hero_title: storeName,
    hero_subtitle: `Descubri todo lo que tiene ${storeName} para ofrecerte.`,
    support_text: undefined,
  }
}

async function ensureProfile(user: User) {
  const supabase = await createClient()
  const email = user.email?.trim()

  if (!email) {
    throw new Error('User email is required for onboarding.')
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email,
      full_name: user.user_metadata?.full_name ?? null,
    },
    {
      onConflict: 'id',
    },
  )

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

    suffix += 1
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
        status: 'draft',
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

export async function needsOnboarding(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: store, error } = await supabase
    .from('stores')
    .select('name, whatsapp')
    .eq('owner_id', userId)
    .maybeSingle()

  if (error || !store) return true

  const hasName = (store.name ?? '').trim().length >= 2
  const hasWhatsapp = (store.whatsapp ?? '').trim().length >= 8

  return !hasName || !hasWhatsapp
}

export async function completeOnboarding(data: {
  storeName: string
  whatsapp: string
}): Promise<{ success?: boolean; error?: string }> {
  const nameSchema = z.string().trim().min(2, 'Minimo 2 caracteres').max(48)
  const waSchema = z
    .string()
    .trim()
    .min(8, 'Ingresa un numero valido')
    .regex(/^\+?[0-9\s\-()]+$/, 'Formato invalido. Ejemplo: +5491112345678')

  const nameResult = nameSchema.safeParse(data.storeName)
  if (!nameResult.success) return { error: nameResult.error.errors[0].message }

  const waResult = waSchema.safeParse(data.whatsapp)
  if (!waResult.success) return { error: waResult.error.errors[0].message }

  const supabase = await createClient()
  const { user } = await safeGetUser(supabase)

  if (!user) return { error: 'No autorizado' }

  const store = await getOwnerStoreIdentity(user.id, supabase)
  if (!store) return { error: 'Tienda no encontrada' }

  const [{ error: storeError }, { error: contentError }] = await Promise.all([
    supabase
      .from('stores')
      .update({
        name: nameResult.data,
        whatsapp: waResult.data,
      })
      .eq('id', store.id),
    supabase
      .from('store_content')
      .update(buildInitialHeroContent(nameResult.data))
      .eq('store_id', store.id),
  ])

  if (storeError) return { error: storeError.message }
  if (contentError) return { error: contentError.message }

  revalidatePath('/admin')
  revalidatePath('/onboarding')
  revalidatePath('/onboarding/success')
  revalidatePath(`/tienda/${store.slug}`)

  return { success: true }
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
