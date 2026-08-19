'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import { storeContentSchema, type StoreContentInput } from '@/lib/validations/store'

export async function updateHeroContent(input: StoreContentInput, showHero = true) {
  const validated = storeContentSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.flatten() }

  const { supabase, store } = await requireAuthenticatedStoreContext()
  const db = supabase as any

  const { error: contentError } = await db
    .from('store_content')
    .update({
      banner_mode: validated.data.banner_mode,
      banner_speed: validated.data.banner_speed,
      hero_image_layout: validated.data.hero_image_layout ?? 'side',
      hero_overlay_opacity: validated.data.hero_overlay_opacity ?? 55,
      hero_title_font: validated.data.hero_title_font ?? 'inherit',
      hero_title_scale: validated.data.hero_title_scale ?? 'balanced',
      hero_text_align: validated.data.hero_text_align ?? 'left',
      hero_title_weight: validated.data.hero_title_weight ?? 'semibold',
      hero_title: validated.data.hero_title,
      hero_subtitle: validated.data.hero_subtitle,
      support_text: validated.data.support_text,
    })
    .eq('store_id', store.id)

  if (contentError) return { error: { formErrors: [contentError.message], fieldErrors: {} } }

  const { error: layoutError } = await db
    .from('store_layout')
    .update({ show_hero: showHero })
    .eq('store_id', store.id)

  if (layoutError) return { error: { formErrors: [layoutError.message], fieldErrors: {} } }

  revalidatePath('/admin')
  revalidatePath('/admin/tienda')
  revalidatePath('/admin/vista-previa')
  revalidatePath(`/tienda/${store.slug}`)
  return { success: true }
}
