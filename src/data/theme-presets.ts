/**
 * VOLTA STORE — Theme Presets
 *
 * Each preset is a named group of store_theme field values that together
 * create a cohesive visual style.
 *
 * ## How to use
 * - Apply a preset → call updateStoreTheme(preset.theme) (the existing action)
 * - Presets don't lock anything: the user can customize any field afterwards
 * - Adding UI: render these as visual cards in AppearanceEditor under a new
 *   "Estilos iniciales" tab
 *
 * ## Architecture note for future templates
 * A "template" = preset + optional section defaults + optional copy defaults.
 * When that system is ready, extend this file to include those layers.
 * The store_theme table already supports all the fields needed; no schema
 * changes required to roll out presets.
 */

import type { StoreTheme } from '@/types/store'

// Subset of StoreTheme fields that presets can override
export type ThemePresetValues = Partial<
  Pick<
    StoreTheme,
    | 'primary_color'
    | 'secondary_color'
    | 'accent_color'
    | 'background_color'
    | 'background_color_2'
    | 'background_direction'
    | 'surface_color'
    | 'text_color'
    | 'visual_mode'
    | 'border_radius'
    | 'card_style'
    | 'card_layout'
    | 'button_style'
    | 'font_preset'
    | 'heading_font'
    | 'body_font'
    | 'heading_scale'
    | 'heading_weight'
    | 'body_scale'
    | 'ui_density'
    | 'spacing_scale'
    | 'image_ratio'
    | 'grid_columns'
    | 'container_width'
  >
>

export type ThemePreset = {
  id: string
  name: string
  description: string
  // Representative industry / rubro
  tags: string[]
  // Preview color swatch (for UI cards)
  previewColors: [string, string, string]
  theme: ThemePresetValues
}

export const THEME_PRESETS: ThemePreset[] = [
  // ── Minimal ────────────────────────────────────────────────────────────────
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Limpio, espacioso y sin distracciones. Ideal para marcas que confían en sus productos.',
    tags: ['general', 'arte', 'diseño', 'libros'],
    previewColors: ['#f8f8f6', '#0a0a0a', '#2563eb'],
    theme: {
      primary_color: '#0a0a0a',
      secondary_color: '#525252',
      accent_color: '#2563eb',
      background_color: '#f8f8f6',
      surface_color: '#ffffff',
      text_color: '#0a0a0a',
      visual_mode: 'light',
      border_radius: 'sm',
      card_style: 'sharp',
      card_layout: 'classic',
      button_style: 'square',
      font_preset: 'minimal',
      heading_font: 'geist',
      body_font: 'geist',
      heading_scale: 'large',
      heading_weight: 'medium',
      body_scale: 'base',
      ui_density: 'spacious',
      spacing_scale: 'airy',
      image_ratio: '1:1',
      grid_columns: 3,
      container_width: 'xl',
    },
  },

  // ── Indumentaria ───────────────────────────────────────────────────────────
  {
    id: 'fashion',
    name: 'Moda',
    description: 'Elegante y orientado a la imagen. Perfecto para ropa, calzado y accesorios.',
    tags: ['indumentaria', 'moda', 'calzado', 'accesorios'],
    previewColors: ['#0c0c0c', '#fafafa', '#c084fc'],
    theme: {
      primary_color: '#c084fc',
      secondary_color: '#a855f7',
      accent_color: '#f0abfc',
      background_color: '#0c0c0c',
      surface_color: '#161616',
      text_color: '#fafafa',
      visual_mode: 'dark',
      border_radius: 'none',
      card_style: 'sharp',
      card_layout: 'visual',
      button_style: 'square',
      font_preset: 'editorial',
      heading_font: 'plus-jakarta',
      body_font: 'geist',
      heading_scale: 'large',
      heading_weight: 'bold',
      body_scale: 'base',
      ui_density: 'comfortable',
      spacing_scale: 'airy',
      image_ratio: '3:4',
      grid_columns: 3,
      container_width: 'xl',
    },
  },

  // ── Pastelería ─────────────────────────────────────────────────────────────
  {
    id: 'bakery',
    name: 'Pastelería',
    description: 'Cálido, redondeado y apetitoso. Para tortas, postres y productos artesanales.',
    tags: ['pastelería', 'tortas', 'comida', 'artesanal'],
    previewColors: ['#fdf6ee', '#3d2310', '#e8845a'],
    theme: {
      primary_color: '#e8845a',
      secondary_color: '#c05c2a',
      accent_color: '#f4c59a',
      background_color: '#fdf6ee',
      surface_color: '#fff9f2',
      text_color: '#3d2310',
      visual_mode: 'light',
      border_radius: 'full',
      card_style: 'soft',
      card_layout: 'classic',
      button_style: 'pill',
      font_preset: 'elegant',
      heading_font: 'plus-jakarta',
      body_font: 'geist',
      heading_scale: 'default',
      heading_weight: 'semibold',
      body_scale: 'base',
      ui_density: 'comfortable',
      spacing_scale: 'balanced',
      image_ratio: '1:1',
      grid_columns: 2,
      container_width: 'lg',
    },
  },

  // ── Deco / Muebles ─────────────────────────────────────────────────────────
  {
    id: 'deco',
    name: 'Deco & Muebles',
    description: 'Sofisticado y neutro. Para muebles, decoración del hogar y objetos de diseño.',
    tags: ['muebles', 'deco', 'hogar', 'diseño interior'],
    previewColors: ['#f5f2ed', '#2c2416', '#8b7355'],
    theme: {
      primary_color: '#8b7355',
      secondary_color: '#6b5a40',
      accent_color: '#c4a882',
      background_color: '#f5f2ed',
      background_color_2: '#ede9e1',
      background_direction: 'diagonal',
      surface_color: '#faf8f4',
      text_color: '#2c2416',
      visual_mode: 'light',
      border_radius: 'md',
      card_style: 'soft',
      card_layout: 'visual',
      button_style: 'rounded',
      font_preset: 'elegant',
      heading_font: 'playfair',
      body_font: 'geist',
      heading_scale: 'large',
      heading_weight: 'medium',
      body_scale: 'base',
      ui_density: 'spacious',
      spacing_scale: 'airy',
      image_ratio: '4:5',
      grid_columns: 2,
      container_width: 'xl',
    },
  },

  // ── Dark Premium ───────────────────────────────────────────────────────────
  {
    id: 'dark-premium',
    name: 'Dark Premium',
    description: 'Oscuro, brillante y exclusivo. Para productos de alta gama o marcas aspiracionales.',
    tags: ['lujo', 'tecnología', 'perfumes', 'joyería'],
    previewColors: ['#08080f', '#e2e8f0', '#6366f1'],
    theme: {
      primary_color: '#6366f1',
      secondary_color: '#818cf8',
      accent_color: '#a5b4fc',
      background_color: '#08080f',
      background_color_2: '#0f0f1a',
      background_direction: 'vertical',
      surface_color: '#0f0f1a',
      text_color: '#e2e8f0',
      visual_mode: 'dark',
      border_radius: 'lg',
      card_style: 'glass',
      card_layout: 'visual',
      button_style: 'rounded',
      font_preset: 'tech',
      heading_font: 'plus-jakarta',
      body_font: 'geist',
      heading_scale: 'default',
      heading_weight: 'semibold',
      body_scale: 'base',
      ui_density: 'comfortable',
      spacing_scale: 'balanced',
      image_ratio: '4:5',
      grid_columns: 3,
      container_width: 'lg',
    },
  },

  // ── Fresco / Orgánico ──────────────────────────────────────────────────────
  {
    id: 'organic',
    name: 'Natural & Orgánico',
    description: 'Verde, fresco y honesto. Para productos naturales, cosmética o alimentación saludable.',
    tags: ['cosmética', 'natural', 'alimentos', 'bienestar'],
    previewColors: ['#f0f7f0', '#1a2e1a', '#4caf7a'],
    theme: {
      primary_color: '#4caf7a',
      secondary_color: '#2e7d52',
      accent_color: '#a8d5b5',
      background_color: '#f0f7f0',
      surface_color: '#f8fbf8',
      text_color: '#1a2e1a',
      visual_mode: 'light',
      border_radius: 'lg',
      card_style: 'soft',
      card_layout: 'compact',
      button_style: 'pill',
      font_preset: 'modern',
      heading_font: 'plus-jakarta',
      body_font: 'geist',
      heading_scale: 'default',
      heading_weight: 'semibold',
      body_scale: 'base',
      ui_density: 'comfortable',
      spacing_scale: 'balanced',
      image_ratio: '1:1',
      grid_columns: 3,
      container_width: 'lg',
    },
  },
]

/**
 * Get a preset by ID. Returns undefined if not found.
 */
export function getPresetById(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id)
}
