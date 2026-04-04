'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

async function getAuthStore() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  if (!store) throw new Error('Store not found')
  return { supabase, store }
}

export async function updateStoreConfig(input: StoreConfigInput) {
  const validated = storeConfigSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await getAuthStore()
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
  revalidatePath('/admin/configuracion')
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

  const { supabase, store } = await getAuthStore()

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

  const { supabase, store } = await getAuthStore()

  const { error } = await supabase
    .from('store_content')
    .update({
      hero_title: validated.data.hero_title,
      hero_subtitle: validated.data.hero_subtitle,
      support_text: validated.data.support_text,
    })
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin/contenido')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function updateStoreTheme(input: StoreThemeInput) {
  const validated = storeThemeSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await getAuthStore()

  const { error } = await supabase
    .from('store_theme')
    .update(validated.data)
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin/apariencia')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function updateStoreLayout(input: StoreLayoutInput) {
  const validated = storeLayoutSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await getAuthStore()

  const { error } = await supabase
    .from('store_layout')
    .update(validated.data)
    .eq('store_id', store.id)

  if (error) return { error: { formErrors: [error.message], fieldErrors: {} } }

  revalidatePath('/admin/apariencia')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  if (!store) throw new Error('Store not found')

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
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true, url: urlData.publicUrl }
}

export async function uploadHeroImage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  if (!store) throw new Error('Store not found')

  const file = formData.get('hero') as File
  if (!file) return { error: 'No file provided' }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/hero.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('store_content')
    .update({ hero_image_url: urlData.publicUrl })
    .eq('store_id', store.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin/contenido')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true, url: urlData.publicUrl }
}
