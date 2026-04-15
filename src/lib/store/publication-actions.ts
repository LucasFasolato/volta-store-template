'use server'

import { refresh, revalidatePath } from 'next/cache'
import { getAdminProducts } from '@/lib/queries/store'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { createClient } from '@/lib/supabase/server'
import {
  evaluateStorePublicationState,
  type StorePublicationActionResult,
} from '@/lib/store/publication'
import type { StoreStatus } from '@/types/store'

function revalidatePublicationPaths(slug: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/configuracion')
  revalidatePath('/admin/apariencia')
  revalidatePath('/admin/productos')
  revalidatePath('/admin/vista-previa')
  revalidatePath(`/tienda/${slug}`)
}

async function persistPublicationStatus({
  storeId,
  ownerId,
  slug,
  status,
  isActive,
}: {
  storeId: string
  ownerId: string
  slug: string
  status: StoreStatus
  isActive: boolean
}): Promise<StorePublicationActionResult> {
  const supabase = await createClient()

  const { data: updatedStore, error } = await supabase
    .from('stores')
    .update({ status, is_active: isActive })
    .eq('id', storeId)
    .eq('owner_id', ownerId)
    .select('slug, status, is_active')
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  if (!updatedStore) {
    return {
      error: 'No pudimos actualizar el estado de publicacion de la tienda. Revisa tu sesion e intenta de nuevo.',
    }
  }

  revalidatePublicationPaths(updatedStore.slug ?? slug)
  refresh()

  return { success: true, status: updatedStore.status }
}

export async function publishStore(): Promise<StorePublicationActionResult> {
  const { user, storeData } = await requireAuthenticatedAdminStore()
  const products = await getAdminProducts(storeData.store.id)
  const publication = evaluateStorePublicationState({ storeData, products })

  if (!publication.canPublish) {
    return {
      error: 'La tienda todavia no cumple lo minimo para publicarse.',
      blockers: publication.readiness.blockingChecks.filter((check) => !check.passed),
    }
  }

  if (publication.isPublished && storeData.store.is_active) {
    return { success: true, status: 'published' }
  }

  return persistPublicationStatus({
    storeId: storeData.store.id,
    ownerId: user.id,
    slug: storeData.store.slug,
    status: 'published',
    isActive: true,
  })
}

export async function unpublishStore(): Promise<StorePublicationActionResult> {
  const { user, storeData } = await requireAuthenticatedAdminStore()

  if (storeData.store.status === 'draft' && !storeData.store.is_active) {
    return { success: true, status: 'draft' }
  }

  return persistPublicationStatus({
    storeId: storeData.store.id,
    ownerId: user.id,
    slug: storeData.store.slug,
    status: 'draft',
    isActive: false,
  })
}
