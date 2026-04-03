import type { Database } from '@/types/database'

type ThemeInsert = Database['public']['Tables']['store_theme']['Insert']
type LayoutInsert = Database['public']['Tables']['store_layout']['Insert']
type ContentInsert = Database['public']['Tables']['store_content']['Insert']

export const DEFAULT_THEME: Omit<ThemeInsert, 'store_id'> = {
  primary_color: '#101828',
  secondary_color: '#2f855a',
  background_color: '#f7f4ee',
  text_color: '#17212b',
  border_radius: 'lg',
  container_width: 'lg',
  font_family: 'manrope',
  heading_scale: 'default',
  body_scale: 'base',
  card_layout: 'grid',
  grid_columns: 2,
  image_ratio: '4:5',
}

export const DEFAULT_LAYOUT: Omit<LayoutInsert, 'store_id'> = {
  show_hero: true,
  show_featured: true,
  show_categories: true,
  show_catalog: true,
  show_footer: true,
  sections_order: ['hero', 'featured', 'categories', 'catalog'],
}

export const DEFAULT_CONTENT: Omit<ContentInsert, 'store_id'> = {
  hero_title: 'Coleccion curada para comprar facil por WhatsApp',
  hero_subtitle:
    'Una tienda simple, rapida y lista para convertir visitas en pedidos reales sin friccion.',
  support_text: 'Atencion personal · Envio o retiro coordinado',
}

export const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter', preview: 'The quick brown fox' },
  { value: 'manrope', label: 'Manrope', preview: 'The quick brown fox' },
  { value: 'geist', label: 'Geist', preview: 'The quick brown fox' },
  { value: 'dm-sans', label: 'DM Sans', preview: 'The quick brown fox' },
] as const

export const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Sin redondeo' },
  { value: 'sm', label: 'Suave' },
  { value: 'md', label: 'Moderado' },
  { value: 'lg', label: 'Redondeado' },
  { value: 'full', label: 'Circular' },
] as const

export const CONTAINER_WIDTH_OPTIONS = [
  { value: 'sm', label: 'Angosto (720px)' },
  { value: 'md', label: 'Mediano (960px)' },
  { value: 'lg', label: 'Normal (1152px)' },
  { value: 'xl', label: 'Amplio (1280px)' },
  { value: 'full', label: 'Completo' },
] as const

export const IMAGE_RATIO_OPTIONS = [
  { value: '1:1', label: 'Cuadrado (1:1)', css: 'aspect-square' },
  { value: '4:5', label: 'Retrato (4:5)', css: 'aspect-[4/5]' },
  { value: '3:4', label: 'Retrato alto (3:4)', css: 'aspect-[3/4]' },
  { value: '16:9', label: 'Paisaje (16:9)', css: 'aspect-video' },
] as const

export const GRID_COLUMNS_OPTIONS = [
  { value: 2, label: '2 columnas' },
  { value: 3, label: '3 columnas' },
  { value: 4, label: '4 columnas' },
] as const

export const CONTENT_LIMITS = {
  hero_title: 45,
  hero_subtitle: 110,
  support_text: 60,
  product_name: 55,
  product_short_description: 90,
  product_description: 280,
  badge: 18,
  category_name: 24,
  store_name: 48,
} as const

export const CONTAINER_WIDTH_MAP: Record<string, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export const BORDER_RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px',
}

export const IMAGE_RATIO_MAP: Record<string, string> = {
  '1:1': '1 / 1',
  '4:5': '4 / 5',
  '3:4': '3 / 4',
  '16:9': '16 / 9',
}
