'use server'

import { updateStoreConfig as updateStoreConfigBase } from '@/lib/actions/store'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import { createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/format'
import { storeConfigSchema, storeSlugSchema, type StoreConfigInput } from '@/lib/validations/store'

const RESERVED_SLUG_MESSAGE = 'Ese enlace ya fue usado por otra tienda. Elegí otra variante.'

type StoreConfigActionError = {
  formErrors: string[]
  fieldErrors: Partial<Record<keyof StoreConfigInput, string[]>>
}

type StoreConfigActionResult =
  | { success: true; error?: never }
  | { error: StoreConfigActionError; success?: never }

async function inspectSlugReservation(slug: string, storeId: string) {
  const admin = await createAdminClient()
  const db = admin as any

  const [currentResult, historyResult] = await Promise.all([
    db.from('stores').select('id').eq('slug', slug).maybeSingle(),
    db.from('store_slug_history').select('store_id').eq('slug', slug).maybeSingle(),
  ])

  if (currentResult.error) throw new Error(currentResult.error.message)
  if (historyResult.error) throw new Error(historyResult.error.message)

  const currentStoreId = currentResult.data?.id as string | undefined
  const historicalStoreId = historyResult.data?.store_id as string | null | undefined

  if (currentStoreId && currentStoreId !== storeId) {
    return { available: false, ownHistory: false }
  }

  if (historyResult.data && historicalStoreId !== storeId) {
    return { available: false, ownHistory: false }
  }

  return {
    available: true,
    ownHistory: Boolean(historyResult.data && historicalStoreId === storeId),
  }
}

function reservedSlugError(): StoreConfigActionResult {
  return {
    error: {
      formErrors: [],
      fieldErrors: { slug: [RESERVED_SLUG_MESSAGE] },
    },
  }
}

function isReservedSlugDatabaseError(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes('store_slug_reserved')
    || normalized.includes('stores_slug_key')
    || normalized.includes('duplicate key value')
}

export async function checkStoreSlugAvailability(rawSlug: string) {
  const normalizedSlug = slugify(rawSlug).slice(0, 48)
  const validated = storeSlugSchema.safeParse(normalizedSlug)

  if (!validated.success) {
    return {
      available: false,
      normalizedSlug,
      message: validated.error.flatten().formErrors[0] ?? 'Revisá el formato del enlace público.',
    }
  }

  const { store } = await requireAuthenticatedStoreContext()

  if (validated.data === store.slug) {
    return {
      available: true,
      normalizedSlug: validated.data,
      message: 'Este es el enlace actual de tu tienda.',
      unchanged: true,
    }
  }

  try {
    const reservation = await inspectSlugReservation(validated.data, store.id)
    if (!reservation.available) {
      return {
        available: false,
        normalizedSlug: validated.data,
        message: RESERVED_SLUG_MESSAGE,
      }
    }

    if (reservation.ownHistory) {
      return {
        available: true,
        normalizedSlug: validated.data,
        message: 'Es un enlace anterior de tu tienda. Podés volver a usarlo.',
        historical: true,
      }
    }
  } catch {
    return {
      available: false,
      normalizedSlug: validated.data,
      message: 'No pudimos validar el enlace ahora. Probá nuevamente.',
    }
  }

  return {
    available: true,
    normalizedSlug: validated.data,
    message: 'Disponible. Tus enlaces anteriores seguirán redirigiendo a este.',
  }
}

export async function updateStoreConfig(input: StoreConfigInput): Promise<StoreConfigActionResult> {
  const validated = storeConfigSchema.safeParse(input)
  if (!validated.success) {
    return { error: validated.error.flatten() as StoreConfigActionError }
  }

  const { store } = await requireAuthenticatedStoreContext()
  const nextSlug = validated.data.slug

  if (nextSlug !== store.slug) {
    try {
      const reservation = await inspectSlugReservation(nextSlug, store.id)
      if (!reservation.available) return reservedSlugError()
    } catch (error) {
      return {
        error: {
          formErrors: [error instanceof Error ? error.message : 'No pudimos validar el enlace público.'],
          fieldErrors: {},
        },
      }
    }
  }

  const result = await updateStoreConfigBase(validated.data) as StoreConfigActionResult
  const databaseMessage = result.error?.formErrors?.[0]
  if (databaseMessage && isReservedSlugDatabaseError(databaseMessage)) {
    return reservedSlugError()
  }

  return result
}
