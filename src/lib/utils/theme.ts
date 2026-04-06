import {
  BODY_SCALE_MAP,
  BORDER_RADIUS_MAP,
  BUTTON_RADIUS_MAP,
  CARD_STYLE_TOKENS,
  CONTAINER_WIDTH_MAP,
  DENSITY_MAP,
  FONT_FAMILY_MAP,
  HEADING_SCALE_MAP,
  HEADING_WEIGHT_MAP,
  IMAGE_RATIO_MAP,
  SPACING_SCALE_MAP,
} from '@/data/defaults'
import { getAccessibleTextColor, mixHexColors, withAlpha } from '@/lib/utils/color'
import type { StoreTheme } from '@/types/store'

export function buildThemeVars(
  theme: StoreTheme,
  resolvedMode: 'light' | 'dark',
): React.CSSProperties {
  const isDark = resolvedMode === 'dark'
  const background = isDark ? mixHexColors(theme.background_color, '#020617', 0.78) : theme.background_color
  const surface = isDark ? mixHexColors(theme.surface_color, '#08111f', 0.68) : theme.surface_color
  const text = isDark ? mixHexColors(theme.text_color, '#f8fafc', 0.84) : theme.text_color
  const primary = isDark ? mixHexColors(theme.primary_color, '#f8fafc', 0.14) : theme.primary_color
  const secondary = isDark ? mixHexColors(theme.secondary_color, '#d1fae5', 0.16) : theme.secondary_color
  const accent = isDark ? mixHexColors(theme.accent_color, '#dbeafe', 0.18) : theme.accent_color
  const density = DENSITY_MAP[theme.ui_density] ?? DENSITY_MAP.comfortable
  const spacing = SPACING_SCALE_MAP[theme.spacing_scale] ?? SPACING_SCALE_MAP.balanced
  const cardStyle = CARD_STYLE_TOKENS[theme.card_style] ?? CARD_STYLE_TOKENS.soft
  const borderRadius = BORDER_RADIUS_MAP[theme.border_radius] ?? BORDER_RADIUS_MAP.lg
  const cardRadius =
    theme.card_style === 'sharp'
      ? `calc(${borderRadius} * 0.72)`
      : theme.card_style === 'glass'
        ? `calc(${borderRadius} * 1.08)`
        : borderRadius

  const bgColor2 = theme.background_color_2
    ? (isDark ? mixHexColors(theme.background_color_2, '#020617', 0.78) : theme.background_color_2)
    : null
  const gradientAngle = (theme.background_direction ?? 'diagonal') === 'vertical' ? '180deg' : '135deg'
  const bgGradient = bgColor2
    ? `linear-gradient(${gradientAngle}, ${background}, ${bgColor2})`
    : background

  return {
    '--store-bg-gradient': bgGradient,
    '--store-primary': primary,
    '--store-primary-contrast': getAccessibleTextColor(primary),
    '--store-secondary': secondary,
    '--store-secondary-contrast': getAccessibleTextColor(secondary),
    '--store-accent': accent,
    '--store-accent-contrast': getAccessibleTextColor(accent),
    '--store-bg': background,
    '--store-surface': surface,
    '--store-text': text,
    '--store-soft-text': withAlpha(text, isDark ? 0.76 : 0.72),
    '--store-muted-text': withAlpha(text, isDark ? 0.54 : 0.5),
    '--store-border': withAlpha(text, isDark ? 0.12 : 0.1),
    '--store-border-strong': withAlpha(text, isDark ? 0.18 : 0.16),
    '--store-shadow': isDark
      ? '0 32px 80px rgba(2, 6, 23, 0.36)'
      : '0 24px 60px rgba(15, 23, 42, 0.12)',
    '--store-glow': withAlpha(accent, isDark ? 0.2 : 0.14),
    '--store-card-radius': cardRadius,
    '--store-button-radius': BUTTON_RADIUS_MAP[theme.button_style] ?? BUTTON_RADIUS_MAP.rounded,
    '--store-radius': borderRadius,
    '--store-image-ratio': IMAGE_RATIO_MAP[theme.image_ratio] ?? IMAGE_RATIO_MAP['4:5'],
    '--store-font-heading': FONT_FAMILY_MAP[theme.heading_font] ?? FONT_FAMILY_MAP['plus-jakarta'],
    '--store-font-body': FONT_FAMILY_MAP[theme.body_font] ?? FONT_FAMILY_MAP.geist,
    '--store-heading-scale': HEADING_SCALE_MAP[theme.heading_scale] ?? HEADING_SCALE_MAP.default,
    '--store-body-scale': BODY_SCALE_MAP[theme.body_scale] ?? BODY_SCALE_MAP.base,
    '--store-heading-weight': HEADING_WEIGHT_MAP[theme.heading_weight] ?? HEADING_WEIGHT_MAP.semibold,
    '--store-control-height': density.control,
    '--store-card-padding': density.cardPadding,
    '--store-section-gap': density.sectionGap,
    '--store-space-base': spacing.base,
    '--store-space-section': spacing.section,
    '--store-space-cluster': spacing.cluster,
    '--store-card-background':
      theme.card_style === 'glass'
        ? `linear-gradient(180deg, ${withAlpha(getAccessibleTextColor(surface), 0.06)}, ${withAlpha(
            getAccessibleTextColor(surface),
            0.01,
          )}), ${withAlpha(surface, cardStyle.backgroundOpacity)}`
        : theme.card_style === 'sharp'
          ? `linear-gradient(180deg, ${withAlpha(surface, 0.96)}, ${withAlpha(
              mixHexColors(surface, background, 0.24),
              0.98,
            )})`
          : `linear-gradient(180deg, ${withAlpha(surface, 0.98)}, ${withAlpha(
              mixHexColors(surface, background, 0.22),
              1,
            )})`,
    '--store-card-border': withAlpha(text, cardStyle.borderOpacity),
    '--store-card-shadow': cardStyle.shadow,
    '--store-card-blur': cardStyle.blur,

    // Navigation — semi-transparent for backdrop-blur effect
    '--store-nav-bg': withAlpha(background, isDark ? 0.88 : 0.84),

    // Footer — gradient from bg to surface
    '--store-footer-bg-gradient': `linear-gradient(180deg, ${withAlpha(background, isDark ? 0.97 : 1)}, ${withAlpha(mixHexColors(surface, background, isDark ? 0.35 : 0.5), 1)})`,

    // Hero height derived from spacing_scale (compact → short, airy → tall)
    '--store-hero-height': ({
      tight: 'clamp(360px, 60vh, 640px)',
      balanced: 'clamp(520px, 78vh, 880px)',
      airy: 'clamp(660px, 92vh, 1060px)',
    }[theme.spacing_scale] ?? 'clamp(520px, 78vh, 880px)'),

    colorScheme: resolvedMode,
  } as React.CSSProperties
}

export const CONTAINER_CLASS: Record<string, string> = CONTAINER_WIDTH_MAP

export const GRID_COLS_CLASS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}
