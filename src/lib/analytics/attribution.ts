export type StoreAttribution = {
  source: string
  campaign: string | null
}

function normalize(value: string | null, maxLength: number) {
  if (!value) return ''
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, maxLength)
}

export function parseStoreAttribution(search: string): StoreAttribution | null {
  const params = new URLSearchParams(search)
  const source = normalize(params.get('src') || params.get('utm_source'), 64)
  if (!source) return null

  const campaign = normalize(params.get('campaign') || params.get('utm_campaign'), 80)
  return { source, campaign: campaign || null }
}

export function trafficSourceLabel(source: string | null, campaign: string | null = null) {
  const normalizedSource = normalize(source, 64) || 'direct'
  const base = SOURCE_LABELS[normalizedSource] ?? normalizedSource
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  if (!campaign) return base
  const campaignLabel = campaign
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return campaignLabel ? `${base} · ${campaignLabel}` : base
}

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Directo',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  qr: 'QR',
  google: 'Google',
  campaign: 'Campaña',
}
