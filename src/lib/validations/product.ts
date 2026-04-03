import { z } from 'zod'
import { CONTENT_LIMITS } from '@/data/defaults'

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(CONTENT_LIMITS.product_name, `Máximo ${CONTENT_LIMITS.product_name} caracteres`),
  short_description: z
    .string()
    .max(
      CONTENT_LIMITS.product_short_description,
      `Máximo ${CONTENT_LIMITS.product_short_description} caracteres`,
    )
    .nullable()
    .optional(),
  description: z
    .string()
    .max(CONTENT_LIMITS.product_description, `Máximo ${CONTENT_LIMITS.product_description} caracteres`)
    .nullable()
    .optional(),
  price: z.number({ invalid_type_error: 'El precio debe ser un número' }).min(0, 'El precio debe ser mayor a 0'),
  compare_price: z
    .number()
    .min(0)
    .nullable()
    .optional(),
  badge: z
    .string()
    .max(CONTENT_LIMITS.badge, `Máximo ${CONTENT_LIMITS.badge} caracteres`)
    .nullable()
    .optional(),
  category_id: z.string().uuid().nullable().optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
})

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(CONTENT_LIMITS.category_name, `Máximo ${CONTENT_LIMITS.category_name} caracteres`),
  sort_order: z.number().int().min(0),
})

export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
