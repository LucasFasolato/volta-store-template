import type { StoreTheme } from '@/types/store'
import { BORDER_RADIUS_MAP, IMAGE_RATIO_MAP } from '@/data/defaults'

/**
 * Generate CSS custom properties from a store theme.
 * These are injected as inline styles on the store wrapper.
 */
export function buildThemeVars(theme: StoreTheme): React.CSSProperties {
  return {
    '--store-primary': theme.primary_color,
    '--store-secondary': theme.secondary_color,
    '--store-bg': theme.background_color,
    '--store-text': theme.text_color,
    '--store-surface': 'color-mix(in srgb, var(--store-bg) 88%, white 12%)',
    '--store-surface-strong': 'color-mix(in srgb, var(--store-bg) 92%, var(--store-text) 8%)',
    '--store-surface-soft': 'color-mix(in srgb, var(--store-text) 4%, var(--store-bg) 96%)',
    '--store-border': 'color-mix(in srgb, var(--store-text) 10%, transparent)',
    '--store-border-strong': 'color-mix(in srgb, var(--store-text) 18%, transparent)',
    '--store-shadow': '0 18px 48px color-mix(in srgb, var(--store-text) 10%, transparent)',
    '--store-radius': BORDER_RADIUS_MAP[theme.border_radius] ?? '8px',
    '--store-image-ratio': IMAGE_RATIO_MAP[theme.image_ratio] ?? '4 / 5',
  } as React.CSSProperties
}

/**
 * Map font_family to Google Fonts URL.
 */
export const FONT_URLS: Record<string, string> = {
  inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap',
  manrope: 'https://fonts.googleapis.com/css2?family=Manrope:wght@300..800&display=swap',
  geist: 'https://fonts.googleapis.com/css2?family=Geist:wght@300..800&display=swap',
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300..700&display=swap',
}

export const FONT_FAMILY_CSS: Record<string, string> = {
  inter: "'Inter', sans-serif",
  manrope: "'Manrope', sans-serif",
  geist: "'Geist', sans-serif",
  'dm-sans': "'DM Sans', sans-serif",
}

export const CONTAINER_CLASS: Record<string, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export const GRID_COLS_CLASS: Record<number, string> = {
  2: 'grid-cols-2 md:grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
}
