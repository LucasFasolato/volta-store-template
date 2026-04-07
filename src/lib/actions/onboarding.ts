'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { User } from '@supabase/supabase-js'
import { DEFAULT_CONTENT, DEFAULT_LAYOUT, DEFAULT_THEME, CONTENT_LIMITS } from '@/data/defaults'
import { getPresetById } from '@/data/theme-presets'
import { getOwnerStoreIdentity } from '@/lib/server/store-context'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/format'
import type { StoreThemeInput } from '@/lib/validations/store'

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
    hero_title: storeName,
    hero_subtitle: `Descubri ${storeName} y hace tu pedido por WhatsApp de forma simple y directa.`,
    support_text: 'Catalogo listo para compartir',
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

async function getUniqueProductSlug({
  supabase,
  storeId,
  value,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  storeId: string
  value: string
}) {
  const baseSlug = slugify(value)
  let suffix = 0

  while (true) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`
    const { data: existing, error } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', storeId)
      .eq('slug', candidate)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to generate product slug: ${error.message}`)
    }

    if (!existing) return candidate
    suffix += 1
  }
}

async function countActiveProducts({
  supabase,
  storeId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  storeId: string
}) {
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`Failed to count products: ${error.message}`)
  }

  return count ?? 0
}

async function createFirstProductIfNeeded({
  supabase,
  storeId,
  productName,
  productPrice,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  storeId: string
  productName?: string
  productPrice?: number
}) {
  const activeProductCount = await countActiveProducts({ supabase, storeId })
  if (activeProductCount >= 1) {
    return
  }

  const nameSchema = z
    .string()
    .trim()
    .min(1, 'Para continuar, agrega tu primer producto.')
    .max(CONTENT_LIMITS.product_name, `Maximo ${CONTENT_LIMITS.product_name} caracteres`)
  const priceSchema = z.number().positive('Ingresa un precio valido para tu primer producto.')

  const parsedName = nameSchema.safeParse(productName ?? '')
  if (!parsedName.success) {
    return { error: parsedName.error.errors[0].message }
  }

  const parsedPrice = priceSchema.safeParse(productPrice)
  if (!parsedPrice.success) {
    return { error: parsedPrice.error.errors[0].message }
  }

  const slug = await getUniqueProductSlug({
    supabase,
    storeId,
    value: parsedName.data,
  })

  const { error } = await supabase.from('products').insert({
    store_id: storeId,
    slug,
    name: parsedName.data,
    short_description: null,
    description: null,
    price: parsedPrice.data,
    compare_price: null,
    badge: 'Nuevo',
    category_id: null,
    is_featured: true,
    is_active: true,
    sort_order: 0,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

function buildMergedPresetTheme({
  current,
  presetId,
}: {
  current: Record<string, unknown>
  presetId?: string
}) {
  const preset = getPresetById(presetId ?? 'minimal')
  if (!preset) return null

  const merged: StoreThemeInput = {
    primary_color: current.primary_color as string,
    secondary_color: current.secondary_color as string,
    accent_color: current.accent_color as string,
    background_color: current.background_color as string,
    surface_color: current.surface_color as string,
    text_color: current.text_color as string,
    visual_mode: current.visual_mode as StoreThemeInput['visual_mode'],
    border_radius: current.border_radius as StoreThemeInput['border_radius'],
    container_width: current.container_width as StoreThemeInput['container_width'],
    font_preset: current.font_preset as StoreThemeInput['font_preset'],
    heading_font: current.heading_font as StoreThemeInput['heading_font'],
    body_font: current.body_font as StoreThemeInput['body_font'],
    font_family: current.font_family as StoreThemeInput['font_family'],
    heading_scale: current.heading_scale as StoreThemeInput['heading_scale'],
    heading_weight: current.heading_weight as StoreThemeInput['heading_weight'],
    body_scale: current.body_scale as StoreThemeInput['body_scale'],
    ui_density: current.ui_density as StoreThemeInput['ui_density'],
    spacing_scale: current.spacing_scale as StoreThemeInput['spacing_scale'],
    card_style: current.card_style as StoreThemeInput['card_style'],
    card_layout: current.card_layout as StoreThemeInput['card_layout'],
    button_style: current.button_style as StoreThemeInput['button_style'],
    grid_columns: current.grid_columns as number,
    image_ratio: current.image_ratio as StoreThemeInput['image_ratio'],
    background_color_2: (current.background_color_2 as string | null | undefined) ?? null,
    background_direction: ((current.background_direction as string | null | undefined) ?? 'diagonal') as StoreThemeInput['background_direction'],
    ...(preset.theme as Partial<StoreThemeInput>),
    ...(preset.theme.body_font
      ? { font_family: preset.theme.body_font as StoreThemeInput['font_family'] }
      : {}),
  }

  return merged
}

export async function needsOnboarding(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, whatsapp')
    .eq('owner_id', userId)
    .maybeSingle()

  if (error || !store?.id) return true
  if (!store.whatsapp?.trim()) return true

  const activeProductCount = await countActiveProducts({ supabase, storeId: store.id })
  return activeProductCount < 1
}

export async function completeOnboarding(data: {
  storeName: string
  whatsapp: string
  firstProductName?: string
  firstProductPrice?: number
  presetId?: string
}): Promise<{ success?: boolean; error?: string; publicPath?: string }> {
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const store = await getOwnerStoreIdentity(user.id, supabase)
  if (!store) return { error: 'Tienda no encontrada' }

  const firstProductResult = await createFirstProductIfNeeded({
    supabase,
    storeId: store.id,
    productName: data.firstProductName,
    productPrice: data.firstProductPrice,
  })

  if (firstProductResult?.error) {
    return { error: firstProductResult.error }
  }

  const heroContent = buildInitialHeroContent(nameResult.data)

  const [{ error: storeError }, { error: contentError }, themeResponse] = await Promise.all([
    supabase
      .from('stores')
      .update({ name: nameResult.data, whatsapp: waResult.data })
      .eq('id', store.id),
    supabase
      .from('store_content')
      .update(heroContent)
      .eq('store_id', store.id),
    supabase
      .from('store_theme')
      .select('*')
      .eq('store_id', store.id)
      .single(),
  ])

  if (storeError) return { error: storeError.message }
  if (contentError) return { error: contentError.message }
  if (themeResponse.error || !themeResponse.data) {
    return { error: themeResponse.error?.message ?? 'No se encontro el tema de la tienda.' }
  }

  const nextTheme = buildMergedPresetTheme({
    current: themeResponse.data,
    presetId: data.presetId,
  })

  if (nextTheme) {
    const { error: themeError } = await supabase
      .from('store_theme')
      .update(nextTheme)
      .eq('store_id', store.id)

    if (themeError) return { error: themeError.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/apariencia')
  revalidatePath('/admin/productos')
  revalidatePath('/onboarding')
  revalidatePath(`/tienda/${store.slug}`)

  return {
    success: true,
    publicPath: `/tienda/${store.slug}`,
  }
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
