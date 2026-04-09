import type { Database } from '@/types/database'

type ThemeInsert = Database['public']['Tables']['store_theme']['Insert']
type LayoutInsert = Database['public']['Tables']['store_layout']['Insert']
type ContentInsert = Database['public']['Tables']['store_content']['Insert']

export const DEFAULT_THEME: Omit<ThemeInsert, 'store_id'> = {
  primary_color: '#0f172a',
  secondary_color: '#0f766e',
  accent_color: '#2563eb',
  background_color: '#f6f8fb',
  surface_color: '#ffffff',
  text_color: '#0b1220',
  visual_mode: 'light',
  border_radius: 'lg',
  container_width: 'xl',
  font_preset: 'modern',
  heading_font: 'plus-jakarta',
  body_font: 'geist',
  font_family: 'geist',
  heading_scale: 'default',
  heading_weight: 'semibold',
  body_scale: 'base',
  ui_density: 'comfortable',
  spacing_scale: 'balanced',
  card_style: 'soft',
  card_layout: 'classic',
  button_style: 'rounded',
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
  banner_mode: 'static',
  banner_speed: 'normal',
  hero_title: 'Catálogo premium listo para vender por WhatsApp',
  hero_subtitle:
    'Una experiencia visual refinada para convertir visitas en pedidos reales con claridad, velocidad y confianza.',
  support_text: 'Atencion personal / Envios o retiro coordinado',
}

export const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter', style: 'Moderna' },
  { value: 'plus-jakarta', label: 'Plus Jakarta Sans', style: 'Premium' },
  { value: 'manrope', label: 'Manrope', style: 'Minimal' },
  { value: 'playfair', label: 'Playfair Display', style: 'Editorial' },
  { value: 'poppins', label: 'Poppins', style: 'Bold' },
  { value: 'space-grotesk', label: 'Space Grotesk', style: 'Tech' },
  { value: 'geist', label: 'Geist', style: 'Precisa' },
] as const

export const FONT_PRESETS = [
  {
    value: 'modern',
    label: 'Moderna',
    heading_font: 'plus-jakarta',
    body_font: 'inter',
    heading_weight: 'semibold',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    heading_font: 'inter',
    body_font: 'inter',
    heading_weight: 'medium',
  },
  {
    value: 'elegant',
    label: 'Elegante',
    heading_font: 'manrope',
    body_font: 'inter',
    heading_weight: 'semibold',
  },
  {
    value: 'bold',
    label: 'Bold',
    heading_font: 'poppins',
    body_font: 'geist',
    heading_weight: 'bold',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    heading_font: 'playfair',
    body_font: 'inter',
    heading_weight: 'semibold',
  },
  {
    value: 'tech',
    label: 'Tech',
    heading_font: 'space-grotesk',
    body_font: 'geist',
    heading_weight: 'semibold',
  },
] as const

export const HEADING_WEIGHT_OPTIONS = [
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
] as const

export const VISUAL_MODE_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Claro, nítido y editorial' },
  { value: 'dark', label: 'Dark', description: 'Más profundo y tecnológico' },
  { value: 'auto', label: 'Auto', description: 'Sigue el sistema del usuario' },
] as const

export const UI_DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact', description: 'Más información por pantalla' },
  { value: 'comfortable', label: 'Comfortable', description: 'Equilibrio entre aire y densidad' },
  { value: 'spacious', label: 'Spacious', description: 'Más aire y presencia' },
] as const

export const SPACING_SCALE_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'airy', label: 'Airy' },
] as const

export const CARD_STYLE_OPTIONS = [
  { value: 'soft', label: 'Soft', description: 'Capas suaves con profundidad sutil' },
  { value: 'sharp', label: 'Sharp', description: 'Más precisión y borde limpio' },
  { value: 'glass', label: 'Glass', description: 'Blur, transparencia y brillo controlado' },
] as const

export const BUTTON_STYLE_OPTIONS = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
] as const

export const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Sin redondeo' },
  { value: 'sm', label: 'Suave' },
  { value: 'md', label: 'Moderado' },
  { value: 'lg', label: 'Redondeado' },
  { value: 'full', label: 'Circular' },
] as const

export const CONTAINER_WIDTH_OPTIONS = [
  { value: 'sm', label: 'Narrow' },
  { value: 'lg', label: 'Default' },
  { value: 'xl', label: 'Wide' },
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

export const FONT_FAMILY_MAP: Record<string, string> = {
  geist: 'var(--font-geist-sans), sans-serif',
  inter: 'var(--font-inter), sans-serif',
  manrope: 'var(--font-manrope), sans-serif',
  'plus-jakarta': 'var(--font-plus-jakarta), sans-serif',
  playfair: 'var(--font-playfair), serif',
  poppins: 'var(--font-poppins), sans-serif',
  'space-grotesk': 'var(--font-space-grotesk), sans-serif',
}

export const CONTAINER_WIDTH_MAP: Record<string, string> = {
  sm: 'max-w-5xl',
  md: 'max-w-6xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  full: 'max-w-full',
}

export const BORDER_RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '8px',
  md: '14px',
  lg: '22px',
  full: '9999px',
}

export const IMAGE_RATIO_MAP: Record<string, string> = {
  '1:1': '1 / 1',
  '4:5': '4 / 5',
  '3:4': '3 / 4',
  '16:9': '16 / 9',
}

export const HEADING_SCALE_MAP: Record<string, string> = {
  compact: '0.92',
  default: '1',
  large: '1.12',
}

export const BODY_SCALE_MAP: Record<string, string> = {
  sm: '0.95',
  base: '1',
  lg: '1.08',
}

export const HEADING_WEIGHT_MAP: Record<string, string> = {
  medium: '560',
  semibold: '640',
  bold: '720',
}

export const DENSITY_MAP: Record<string, { control: string; cardPadding: string; sectionGap: string }> = {
  compact: { control: '42px', cardPadding: '18px', sectionGap: '72px' },
  comfortable: { control: '48px', cardPadding: '22px', sectionGap: '88px' },
  spacious: { control: '54px', cardPadding: '28px', sectionGap: '108px' },
}

export const SPACING_SCALE_MAP: Record<string, { base: string; section: string; cluster: string }> = {
  tight: { base: '0.92', section: '4.5rem', cluster: '1.15rem' },
  balanced: { base: '1', section: '5.5rem', cluster: '1.4rem' },
  airy: { base: '1.12', section: '6.75rem', cluster: '1.75rem' },
}

export const BUTTON_RADIUS_MAP: Record<string, string> = {
  rounded: '18px',
  square: '12px',
  pill: '9999px',
}

export const CARD_STYLE_TOKENS: Record<
  string,
  { borderOpacity: number; backgroundOpacity: number; shadow: string; blur: string }
> = {
  soft: {
    borderOpacity: 0.1,
    backgroundOpacity: 0.88,
    shadow: '0 20px 50px rgba(2, 8, 23, 0.12)',
    blur: '0px',
  },
  sharp: {
    borderOpacity: 0.16,
    backgroundOpacity: 0.96,
    shadow: '0 16px 36px rgba(2, 8, 23, 0.1)',
    blur: '0px',
  },
  glass: {
    borderOpacity: 0.14,
    backgroundOpacity: 0.72,
    shadow: '0 26px 60px rgba(2, 8, 23, 0.18)',
    blur: '18px',
  },
}
