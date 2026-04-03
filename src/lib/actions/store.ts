'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  storeConfigSchema,
  storeContentSchema,
  storeThemeSchema,
  storeLayoutSchema,
  type StoreConfigInput,
  type StoreContentInput,
  type StoreThemeInput,
  type StoreLayoutInput,
} from '@/lib/validations/store'

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

  const { error } = await supabase
    .from('stores')
    .update({
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
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
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
