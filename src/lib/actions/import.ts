'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedStoreContext } from '@/lib/server/store-context'
import { slugify } from '@/lib/utils/format'

// ── Types ──────────────────────────────────────────────────────────────────

export type ImportRow = {
  nombre: string
  descripcion_corta?: string
  descripcion?: string
  precio: string | number
  precio_comparacion?: string | number
  badge?: string
  categoria?: string
  imagen_url?: string
  slug?: string
  /** Option columns: opcion_talle, opcion_color, etc. Values: "S,M,L" or "S/M/L" */
  [key: string]: unknown
}

export type ImportResult = {
  created: number
  skipped: number
  errors: Array<{ row: number; reason: string }>
}

// ── Validation schema per row ──────────────────────────────────────────────

const rowSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(55, 'Nombre demasiado largo (máx 55)'),
  descripcion_corta: z.string().max(90).optional(),
  descripcion: z.string().max(280).optional(),
  precio: z
    .union([z.string(), z.number()])
    .transform((v) => {
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
      return Number.isNaN(n) ? null : n
    })
    .refine((v) => v !== null && v >= 0, 'El precio debe ser un número mayor o igual a 0'),
  precio_comparacion: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === '' || v === null) return undefined
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
      return Number.isNaN(n) ? undefined : n
    }),
  badge: z.string().max(18).optional(),
  categoria: z.string().optional(),
  imagen_url: z.string().url().optional().or(z.literal('')),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Slug inválido (solo letras, números y guiones)')
    .optional()
    .or(z.literal('')),
})

type ValidatedRow = z.infer<typeof rowSchema>

// ── Helpers ────────────────────────────────────────────────────────────────

function parseOptionColumns(row: ImportRow): Array<{ name: string; values: string[] }> {
  const options: Array<{ name: string; values: string[] }> = []

  for (const [key, rawValue] of Object.entries(row)) {
    if (!key.toLowerCase().startsWith('opcion_') && !key.toLowerCase().startsWith('opción_')) continue
    const optionName = key.replace(/^opci[oó]n_/i, '').trim()
    if (!optionName) continue
    const raw = String(rawValue ?? '').trim()
    if (!raw) continue
    // Values may be comma or slash-separated
    const separator = raw.includes('/') && !raw.includes(',') ? '/' : ','
    const values = raw
      .split(separator)
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
    if (values.length > 0) {
      options.push({ name: optionName.charAt(0).toUpperCase() + optionName.slice(1), values })
    }
  }

  return options
}

async function getUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storeId: string,
  base: string,
): Promise<string> {
  const baseSlug = slugify(base)
  let suffix = 0

  while (true) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', storeId)
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) return candidate
    suffix += 1
  }
}

// ── Server action ──────────────────────────────────────────────────────────

/**
 * Import a batch of parsed CSV rows as products.
 * - Resolves or creates categories by name.
 * - Generates unique slugs.
 * - Attaches image_url as a product_images record when provided.
 * - Attaches option columns as product_options records.
 * - Returns per-row error details for UX reporting.
 */
export async function importProductsFromCSV(rows: ImportRow[]): Promise<ImportResult> {
  const { supabase, store } = await requireAuthenticatedStoreContext()

  const result: ImportResult = { created: 0, skipped: 0, errors: [] }

  // Cache category name → id to avoid repeated queries
  const categoryCache = new Map<string, string | null>()

  async function resolveCategoryId(name: string | undefined): Promise<string | null> {
    if (!name?.trim()) return null
    const key = name.trim().toLowerCase()

    if (categoryCache.has(key)) return categoryCache.get(key)!

    // Look for existing category
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('store_id', store.id)
      .ilike('name', name.trim())
      .maybeSingle()

    if (existing) {
      categoryCache.set(key, existing.id)
      return existing.id
    }

    // Auto-create it
    const catSlug = slugify(name.trim())
    const { data: created } = await supabase
      .from('categories')
      .insert({ store_id: store.id, name: name.trim(), slug: catSlug, sort_order: 0 })
      .select('id')
      .maybeSingle()

    const id = created?.id ?? null
    categoryCache.set(key, id)
    return id
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 1

    // Validate the row
    const parsed = rowSchema.safeParse(row)
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ')
      result.errors.push({ row: rowNumber, reason: msg })
      result.skipped += 1
      continue
    }

    const data: ValidatedRow = parsed.data

    // Resolve category
    const categoryId = await resolveCategoryId(data.categoria)

    // Generate unique slug
    const slug = await getUniqueSlug(supabase, store.id, data.slug?.trim() || data.nombre)

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        slug,
        name: data.nombre,
        short_description: data.descripcion_corta || null,
        description: data.descripcion || null,
        price: data.precio as number,
        compare_price: data.precio_comparacion ?? null,
        badge: data.badge || null,
        category_id: categoryId,
        is_active: true,
        is_featured: false,
        sort_order: 0,
      })
      .select('id')
      .single()

    if (productError || !product) {
      result.errors.push({ row: rowNumber, reason: productError?.message ?? 'Error al crear el producto' })
      result.skipped += 1
      continue
    }

    // Attach image if provided
    const imageUrl = (data.imagen_url ?? '').trim()
    if (imageUrl) {
      await supabase
        .from('product_images')
        .insert({ product_id: product.id, url: imageUrl, sort_order: 0 })
    }

    // Attach options if present
    const options = parseOptionColumns(row)
    if (options.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('product_options').insert(
        options.map((opt, idx) => ({
          product_id: product.id,
          name: opt.name,
          values: opt.values,
          sort_order: idx,
        })),
      )
    }

    result.created += 1
  }

  revalidatePath('/admin')
  revalidatePath('/admin/productos')
  revalidatePath(`/tienda/${store.slug}`)

  return result
}
