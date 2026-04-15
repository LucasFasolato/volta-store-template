'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import {
  storeConfigSchema,
  storeContentSchema,
  storeThemeSchema,
  storeLayoutSchema,
  storeSlugSchema,
  type StoreConfigInput,
  type StoreContentInput,
  type StoreThemeInput,
  type StoreLayoutInput,
} from '@/lib/validations/store'
import { slugify } from '@/lib/utils/format'
import { normalizeThemeFontSelection } from '@/data/defaults'
import { getPresetById } from '@/data/theme-presets'

export async function updateStoreConfig(input: StoreConfigInput) {
  const validated = storeConfigSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const nextSlug = validated.data.slug

  if (nextSlug !== store.slug) {
    const { data: existingStore, error: existingStoreError } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', nextSlug)
      .neq('id', store.id)
      .maybeSingle()

    if (existingStoreError) {
      return { error: { formErrors: [existingStoreError.message], fieldErrors: {} } }
    }

    if (existingStore) {
      return {
        error: {
          formErrors: [],
          fieldErrors: {
            slug: ['Ese enlace ya esta en uso. Prueba con otra variante.'],
          },
        },
      }
    }
  }

  const { error } = await supabase
    .from('stores')
    .update({
      slug: nextSlug,
      name: validated.data.name,
      whatsapp: validated.data.whatsapp,
      instagram: validated.data.instagram ?? null,
      address: validated.data.address ?? null,
      hours: validated.data.hours ?? null,
    })
    .eq('id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin')
  revalidatePath('/admin/negocio')
  revalidatePath(`/tienda/${validated.data.slug}`)
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function checkStoreSlugAvailability(rawSlug: string) {
  const normalizedSlug = slugify(rawSlug).slice(0, 48)
  const validated = storeSlugSchema.safeParse(normalizedSlug)

  if (!validated.success) {
    return {
      available: false,
      normalizedSlug,
      message: validated.error.flatten().formErrors[0] ?? 'Revisa el formato del enlace publico.',
    }
  }

  const { supabase, store } = await requireAuthenticatedStoreContext()

  if (validated.data === store.slug) {
    return {
      available: true,
      normalizedSlug: validated.data,
      message: 'Estas usando el enlace actual de tu tienda.',
      unchanged: true,
    }
  }

  const { data: existingStore, error } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', validated.data)
    .neq('id', store.id)
    .maybeSingle()

  if (error) {
    return {
      available: false,
      normalizedSlug: validated.data,
      message: error.message,
    }
  }

  if (existingStore) {
    return {
      available: false,
      normalizedSlug: validated.data,
      message: 'Ese enlace ya esta en uso. Elige otra opcion.',
    }
  }

  return {
    available: true,
    normalizedSlug: validated.data,
    message: 'Disponible. Asi se vera la URL de tu tienda.',
  }
}

export async function updateStoreContent(input: StoreContentInput) {
  const validated = storeContentSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('store_content')
    .update({
      banner_mode: validated.data.banner_mode,
      banner_speed: validated.data.banner_speed,
      hero_title: validated.data.hero_title,
      hero_subtitle: validated.data.hero_subtitle,
      support_text: validated.data.support_text,
    })
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin')
  revalidatePath('/admin/tienda')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function updateStoreTheme(input: StoreThemeInput) {
  const normalizedInput = normalizeThemeFontSelection({
    ...input,
    font_family: input.body_font,
  })
  const validated = storeThemeSchema.safeParse(normalizedInput)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('store_theme')
    .update(validated.data)
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin/tienda')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function updateStoreLayout(input: StoreLayoutInput) {
  const validated = storeLayoutSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { error } = await supabase
    .from('store_layout')
    .update(validated.data)
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin/tienda')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function uploadLogo(formData: FormData) {
  const { supabase, store, user } = await requireAuthenticatedStoreContext()

  const file = formData.get('logo') as File
  if (!file) return { error: 'No file provided' }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('stores')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', store.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin')
  revalidatePath('/admin/tienda')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true, url: urlData.publicUrl }
}

export async function uploadHeroImage(formData: FormData) {
  const { supabase, store, user } = await requireAuthenticatedStoreContext()

  const file = formData.get('hero') as File
  if (!file) return { error: 'No file provided' }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/hero.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(path)
  // Append a version param so Next.js Image and browser never serve a stale cached copy
  // when the same storage path is overwritten by a new upload.
  const versionedUrl = `${urlData.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('store_content')
    .update({ hero_image_url: versionedUrl })
    .eq('store_id', store.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin')
  revalidatePath('/admin/tienda')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true, url: versionedUrl }
}

/**
 * Apply a named theme preset over the current theme.
 * Only preset fields are overridden; everything else stays as-is.
 * The user can freely modify any field afterwards.
 */
export async function applyThemePreset(presetId: string) {
  const preset = getPresetById(presetId)
  if (!preset) return { error: { formErrors: ['Preset no encontrado'], fieldErrors: {} } }

  const { supabase, store } = await requireAuthenticatedStoreContext()

  const { data: current } = await supabase
    .from('store_theme')
    .select('*')
    .eq('store_id', store.id)
    .single()

  if (!current) return { error: { formErrors: ['No se encontró el tema actual'], fieldErrors: {} } }

  // Build full StoreThemeInput from current DB values, then override with preset
  const merged: StoreThemeInput = {
    primary_color: current.primary_color,
    secondary_color: current.secondary_color,
    accent_color: current.accent_color,
    background_color: current.background_color,
    surface_color: current.surface_color,
    text_color: current.text_color,
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
    grid_columns: current.grid_columns,
    image_ratio: current.image_ratio as StoreThemeInput['image_ratio'],
    background_color_2: current.background_color_2 ?? null,
    background_direction: (current.background_direction ?? 'diagonal') as StoreThemeInput['background_direction'],
    // Override with preset fields (cast to any: ThemePresetValues uses StoreTheme
    // where enum fields are string; StoreThemeInput uses narrower literal unions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(preset.theme as any),
    // Sync font_family with body_font if preset sets it
    ...(preset.theme.body_font ? { font_family: preset.theme.body_font as StoreThemeInput['font_family'] } : {}),
  }

  return updateStoreTheme(merged)
}
