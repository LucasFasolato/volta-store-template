export function formatPriceTypingValue(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return ''

  const source = String(raw).replace(/\./g, '').replace(/[^0-9,]/g, '')
  if (!source) return ''

  const [integerRaw, decimalRaw] = source.split(',', 2)
  const integer = integerRaw.replace(/^0+(?=\d)/, '') || '0'
  const formattedInteger = Number(integer).toLocaleString('es-AR')

  if (decimalRaw === undefined) return formattedInteger
  return `${formattedInteger},${decimalRaw.slice(0, 2)}`
}

export function parsePriceTypingValue(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (!raw) return 0

  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}
