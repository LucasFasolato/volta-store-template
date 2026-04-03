import { z } from 'zod'
import { CONTENT_LIMITS } from '@/data/defaults'

export const storeConfigSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(CONTENT_LIMITS.store_name, `Máximo ${CONTENT_LIMITS.store_name} caracteres`),
  whatsapp: z
    .string()
    .min(8, 'Ingresá un número de WhatsApp válido')
    .regex(/^\+?[0-9\s\-()]+$/, 'Formato inválido. Ejemplo: +5491112345678'),
  instagram: z.string().max(64).nullable().optional(),
  address: z.string().max(120).nullable().optional(),
  hours: z.string().max(120).nullable().optional(),
})

export const storeContentSchema = z.object({
  hero_title: z
    .string()
    .max(CONTENT_LIMITS.hero_title, `Máximo ${CONTENT_LIMITS.hero_title} caracteres`)
    .min(1, 'El título es requerido'),
  hero_subtitle: z
    .string()
    .max(CONTENT_LIMITS.hero_subtitle, `Máximo ${CONTENT_LIMITS.hero_subtitle} caracteres`)
    .min(1, 'El subtítulo es requerido'),
  support_text: z
    .string()
    .max(CONTENT_LIMITS.support_text, `Máximo ${CONTENT_LIMITS.support_text} caracteres`),
})

export const storeThemeSchema = z.object({
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
  background_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
  text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
  border_radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  container_width: z.enum(['sm', 'md', 'lg', 'xl', 'full']),
  font_family: z.enum(['inter', 'manrope', 'geist', 'dm-sans']),
  heading_scale: z.enum(['compact', 'default', 'large']),
  body_scale: z.enum(['sm', 'base', 'lg']),
  card_layout: z.enum(['grid', 'list']),
  grid_columns: z.number().int().min(2).max(4),
  image_ratio: z.enum(['1:1', '4:5', '3:4', '16:9']),
})

export const storeLayoutSchema = z.object({
  show_hero: z.boolean(),
  show_featured: z.boolean(),
  show_categories: z.boolean(),
  show_catalog: z.boolean(),
  show_footer: z.boolean(),
})

export type StoreConfigInput = z.infer<typeof storeConfigSchema>
export type StoreContentInput = z.infer<typeof storeContentSchema>
export type StoreThemeInput = z.infer<typeof storeThemeSchema>
export type StoreLayoutInput = z.infer<typeof storeLayoutSchema>
