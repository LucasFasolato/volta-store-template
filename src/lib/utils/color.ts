type RGB = {
  r: number
  g: number
  b: number
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function normalizeHexColor(input: string) {
  const value = input.trim().replace('#', '')
  if (value.length === 3) {
    return `#${value
      .split('')
      .map((char) => `${char}${char}`)
      .join('')}`.toLowerCase()
  }
  return `#${value}`.toLowerCase()
}

export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHexColor(hex).replace('#', '')
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`
}

export function mixHexColors(base: string, target: string, weight = 0.5) {
  const from = hexToRgb(base)
  const to = hexToRgb(target)
  const ratio = Math.max(0, Math.min(1, weight))

  return rgbToHex({
    r: from.r + (to.r - from.r) * ratio,
    g: from.g + (to.g - from.g) * ratio,
    b: from.b + (to.b - from.b) * ratio,
  })
}

export function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

function getLuminanceChannel(channel: number) {
  const normalized = channel / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

export function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const red = getLuminanceChannel(r)
  const green = getLuminanceChannel(g)
  const blue = getLuminanceChannel(b)

  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

export function getContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getRelativeLuminance(foreground)
  const backgroundLuminance = getRelativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

export function getAccessibleTextColor(background: string) {
  const light = '#f8fafc'
  const dark = '#020617'
  return getContrastRatio(light, background) >= getContrastRatio(dark, background) ? light : dark
}
