import { z } from 'zod'
import { CONTENT_LIMITS } from '@/data/defaults'
import { getContrastRatio } from '@/lib/utils/color'

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color invalido')
export const storeSlugSchema = z
  .string()
  .trim()
  .min(3, 'Usa al menos 3 caracteres')
  .max(48, 'Usa hasta 48 caracteres')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa minusculas, numeros y guiones simples')

export const storeConfigSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(CONTENT_LIMITS.store_name, `Maximo ${CONTENT_LIMITS.store_name} caracteres`),
  slug: storeSlugSchema,
  whatsapp: z
    .string()
    .min(8, 'Ingresa un numero de WhatsApp valido')
    .regex(/^\+?[0-9\s\-()]+$/, 'Formato invalido. Ejemplo: +5491112345678'),
  instagram: z.string().max(64).nullable().optional(),
  address: z.string().max(120).nullable().optional(),
  hours: z.string().max(120).nullable().optional(),
})

export const storeContentSchema = z.object({
  hero_title: z
    .string()
    .max(CONTENT_LIMITS.hero_title, `Maximo ${CONTENT_LIMITS.hero_title} caracteres`)
    .min(1, 'El titulo es requerido'),
  hero_subtitle: z
    .string()
    .max(CONTENT_LIMITS.hero_subtitle, `Maximo ${CONTENT_LIMITS.hero_subtitle} caracteres`)
    .min(1, 'El subtitulo es requerido'),
  support_text: z
    .string()
    .max(CONTENT_LIMITS.support_text, `Maximo ${CONTENT_LIMITS.support_text} caracteres`),
})

export const storeThemeSchema = z
  .object({
    primary_color: colorSchema,
    secondary_color: colorSchema,
    accent_color: colorSchema,
    background_color: colorSchema,
    surface_color: colorSchema,
    text_color: colorSchema,
    visual_mode: z.enum(['light', 'dark', 'auto']),
    border_radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    container_width: z.enum(['sm', 'md', 'lg', 'xl', 'full']),
    font_preset: z.enum(['elegant', 'modern', 'minimal', 'bold', 'editorial', 'tech']),
    heading_font: z.enum(['geist', 'inter', 'manrope', 'plus-jakarta', 'playfair', 'poppins', 'space-grotesk']),
    body_font: z.enum(['geist', 'inter', 'manrope', 'plus-jakarta', 'playfair', 'poppins', 'space-grotesk']),
    font_family: z.enum(['geist', 'inter', 'manrope', 'plus-jakarta', 'playfair', 'poppins', 'space-grotesk']),
    heading_scale: z.enum(['compact', 'default', 'large']),
    heading_weight: z.enum(['medium', 'semibold', 'bold']),
    body_scale: z.enum(['sm', 'base', 'lg']),
    ui_density: z.enum(['compact', 'comfortable', 'spacious']),
    spacing_scale: z.enum(['tight', 'balanced', 'airy']),
    card_style: z.enum(['soft', 'sharp', 'glass']),
    card_layout: z.enum(['grid', 'list']),
    button_style: z.enum(['rounded', 'square', 'pill']),
    grid_columns: z.number().int().min(2).max(4),
    image_ratio: z.enum(['1:1', '4:5', '3:4', '16:9']),
  })
  .superRefine((value, ctx) => {
    if (getContrastRatio(value.text_color, value.background_color) < 4.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['text_color'],
        message: 'El texto debe contrastar mejor con el fondo.',
      })
    }

    if (getContrastRatio(value.text_color, value.surface_color) < 4.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['surface_color'],
        message: 'La superficie necesita mas contraste con el texto.',
      })
    }
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
