import { evaluateStoreReadiness, type StoreReadinessCheck, type StoreReadinessReport } from '@/lib/store/readiness'
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

export type StorePublicationActionResult = {
  success?: true
  error?: string
  blockers?: StoreReadinessCheck[]
  status?: StoreStatus
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
