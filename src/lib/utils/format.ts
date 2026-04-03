/**
 * Format a number as Argentine peso currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Slugify a string: lowercase, hyphens, no special chars.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Truncate text to a max length, adding ellipsis.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 3)}...`
}

/**
 * Count remaining characters.
 */
export function charsLeft(text: string, max: number): number {
  return max - text.length
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function sanitizeInstagramHandle(handle: string): string {
  return handle.replace(/^@+/, '').trim()
}
