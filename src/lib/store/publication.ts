import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedAdminStore } from '@/lib/server/store-context'
import { getAdminProducts } from '@/lib/queries/store'
import { evaluateStoreReadiness, type StoreReadinessReport } from '@/lib/store/readiness'
import type { AdminStoreData, ProductWithImages, StoreStatus } from '@/types/store'

export type StorePublicationState = 'draft' | 'ready' | 'published'

export type StorePublicationSnapshot = {
  persistedStatus: StoreStatus
  state: StorePublicationState
  canPublish: boolean
  isPublished: boolean
  isReadyToPublish: boolean
  readiness: StoreReadinessReport
}

function revalidatePublicationPaths(slug: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/configuracion')
  revalidatePath('/admin/apariencia')
  revalidatePath('/admin/productos')
  revalidatePath(`/tienda/${slug}`)
}

export function evaluateStorePublicationState({
  storeData,
  products,
}: {
  storeData: AdminStoreData
  products: ProductWithImages[]
}): StorePublicationSnapshot {
  const readiness = evaluateStoreReadiness({ storeData, products })
  const isPublished = storeData.store.status === 'published'
  const isReadyToPublish = !isPublished && readiness.canPublish

  return {
    persistedStatus: storeData.store.status,
    state: isPublished ? 'published' : readiness.canPublish ? 'ready' : 'draft',
    canPublish: readiness.canPublish,
    isPublished,
    isReadyToPublish,
    readiness,
  }
}

export async function publishStore() {
  'use server'

  const { user, storeData } = await requireAuthenticatedAdminStore()
  const products = await getAdminProducts(storeData.store.id)
  const publication = evaluateStorePublicationState({ storeData, products })

  if (!publication.canPublish) {
    return {
      error: 'La tienda todavia no cumple lo minimo para publicarse.',
      blockers: publication.readiness.blockingChecks.filter((check) => !check.passed),
    }
  }

  if (publication.isPublished) {
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('stores')
    .update({ status: 'published' })
    .eq('id', storeData.store.id)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePublicationPaths(storeData.store.slug)
  return { success: true }
}

export async function unpublishStore() {
  'use server'

  const { user, storeData } = await requireAuthenticatedAdminStore()
  const supabase = await createClient()

  const { error } = await supabase
    .from('stores')
    .update({ status: 'draft' })
    .eq('id', storeData.store.id)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePublicationPaths(storeData.store.slug)
  return { success: true }
}
