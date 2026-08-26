'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Camera, Check, Copy, ExternalLink, Link2, Megaphone, MessageCircle, Package, QrCode, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { PlanUpgradePrompt } from '@/components/admin/PlanUpgradePrompt'
import { ShareActions } from '@/components/admin/ShareActions'
import { StoreQrCard } from '@/components/admin/StoreQrCard'
import { trackSaasEvent } from '@/lib/analytics/saas-events'
import {
  buildProductShareMessage,
  buildStoreShareMessage,
  buildSuggestedStoreMessages,
  buildTrackedPublicUrl,
  normalizeTrackingToken,
} from '@/lib/sharing/links'
import type { CommercialPlanCode } from '@/lib/billing/plan'

type ShareProduct = {
  id: string
  name: string
  slug: string
  url: string
  imageUrl: string | null
  priceLabel: string
}

type GrowthSharePageProps = {
  storeName: string
  storeUrl: string
  storeMessage: string
  products: ShareProduct[]
  planCode: CommercialPlanCode
}

async function copyValue(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('copy-failed')
}

function recordFirstShare(location: string) {
  trackSaasEvent('first_share', {
    dedupeKey: 'first-share',
    ctaLocation: location,
  })
}

function trackedShareLocation(label: string) {
  const normalized = label.trim().toLowerCase()
  if (normalized === 'campaña' || normalized === 'campana') return 'share_campaign_copy'
  if (normalized === 'instagram') return 'share_instagram_copy'
  if (normalized === 'whatsapp') return 'share_whatsapp_link_copy'
  if (normalized === 'qr') return 'share_qr_copy'
  return 'share_tracked_link_copy'
}

export function GrowthSharePage({ storeName, storeUrl, storeMessage, products, planCode }: GrowthSharePageProps) {
  const suggestions = useMemo(() => buildSuggestedStoreMessages(storeName, storeUrl), [storeName, storeUrl])
  const instagramUrl = useMemo(() => buildTrackedPublicUrl(storeUrl, 'instagram'), [storeUrl])
  const whatsappUrl = useMemo(() => buildTrackedPublicUrl(storeUrl, 'whatsapp'), [storeUrl])
  const qrUrl = useMemo(() => buildTrackedPublicUrl(storeUrl, 'qr'), [storeUrl])
  const whatsappMessage = useMemo(() => buildStoreShareMessage(storeName, whatsappUrl), [storeName, whatsappUrl])
  const [selectedMessage, setSelectedMessage] = useState<string>(suggestions[0].text)
  const [messageCopied, setMessageCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const normalizedCampaign = normalizeTrackingToken(campaignName, 80)
  const campaignUrl = normalizedCampaign ? buildTrackedPublicUrl(storeUrl, 'campaign', normalizedCampaign) : ''
  const hasMeasuredLinks = planCode === 'volta' || planCode === 'pro'
  const hasCampaigns = planCode === 'pro'

  async function copyMessage() {
    try {
      await copyValue(selectedMessage)
      recordFirstShare('share_message_copy')
      setMessageCopied(true)
      toast.success('Texto copiado.')
      window.setTimeout(() => setMessageCopied(false), 1600)
    } catch {
      toast.error('No pudimos copiar el texto.')
    }
  }

  async function copyTracked(url: string, label: string) {
    try {
      await copyValue(url)
      recordFirstShare(trackedShareLocation(label))
      toast.success(`${label}: enlace copiado.`)
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  return (
    <div className="space-y-5 p-3.5 sm:p-5 lg:p-6">
      <section className="overflow-hidden rounded-[20px] border border-black/8 bg-[#0d151b] p-5 text-white shadow-sm sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#12e89a]/20 bg-[#12e89a]/10 px-3 py-1.5 text-[11px] font-semibold text-[#75f5c5]"><Sparkles className="size-3.5" />Compartir y crecer</div>
            <h1 className="mt-4 max-w-2xl text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">Llevá gente a tu tienda sin volver a mandar el catálogo a mano.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Compartí el mismo catálogo donde ya vendés. Cuando tu plan lo incluye, VOLTA también te ayuda a medir qué canal funciona mejor.</p>
          </div>
          <Link href={storeUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#12e89a] px-4 text-sm font-semibold text-[#062117]">Ver mi tienda <ExternalLink className="size-4" /></Link>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
          <p className="admin-label">Tu enlace principal</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Compartí toda la tienda</h2>
          <p className="mt-1 text-sm text-muted-foreground">Este enlace funciona en todos los planes.</p>
          <div className="mt-4 rounded-[12px] border border-black/7 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"><span className="block truncate">{storeUrl}</span></div>
          <div className="mt-3"><ShareActions url={storeUrl} text={storeMessage} title={storeName} /></div>
          {hasMeasuredLinks ? (
            <>
              <button type="button" onClick={() => setShowQr((value) => !value)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[9px] border border-black/8 bg-white px-3 text-xs font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><QrCode className="size-4" />{showQr ? 'Ocultar QR' : 'Mostrar QR medible'}</button>
              {showQr ? <div className="mt-3"><StoreQrCard publicUrl={qrUrl} storeName={storeName} /></div> : null}
            </>
          ) : null}
        </section>

        <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
          <p className="admin-label">Textos listos</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">No pienses qué escribir cada vez</h2>
          <p className="mt-1 text-sm text-muted-foreground">Elegí una idea, copiala y publicala donde ya vendés.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion.id} type="button" onClick={() => setSelectedMessage(suggestion.text)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selectedMessage === suggestion.text ? 'bg-[#12e89a] text-[#062117]' : 'border border-black/8 bg-slate-50 text-foreground dark:border-white/10 dark:bg-white/5'}`}>{suggestion.label}</button>
            ))}
          </div>
          <div className="mt-3 min-h-28 whitespace-pre-wrap rounded-[12px] border border-black/7 bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">{selectedMessage}</div>
          <button type="button" onClick={copyMessage} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[9px] bg-[#0d151b] px-3 text-xs font-semibold text-white dark:bg-white dark:text-[#0d151b]">{messageCopied ? <Check className="size-4" /> : <Copy className="size-4" />}{messageCopied ? 'Copiado' : 'Copiar texto'}</button>
        </section>
      </div>

      {hasMeasuredLinks ? (
        <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="admin-label">Links medibles</p><h2 className="mt-1 text-lg font-semibold text-foreground">Sabé de dónde llega la gente</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Cada link abre la misma tienda y guarda el canal para construir historial.</p></div>
            <Link href="/admin/rendimiento" className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-[#75f5c5]">Ver rendimiento <ExternalLink className="size-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ChannelLink icon={Camera} label="Instagram" description="Bio, historias y publicaciones" url={instagramUrl} onCopy={copyTracked} />
            <ChannelLink icon={MessageCircle} label="WhatsApp" description="Estados, chats y grupos" url={whatsappUrl} onCopy={copyTracked} />
            <ChannelLink icon={QrCode} label="QR" description="Mostrador, packaging o feria" url={qrUrl} onCopy={copyTracked} />
          </div>

          {hasCampaigns ? (
            <div className="mt-4 rounded-[14px] border border-black/7 bg-slate-50 p-4 dark:border-white/9 dark:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-emerald-600 shadow-sm dark:bg-white/7 dark:text-[#12e89a]"><Megaphone className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Campaña puntual</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Poné un nombre fácil de reconocer y compará después cómo rindió.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} maxLength={80} placeholder="promo-agosto" className="h-10 min-w-0 rounded-[9px] border border-black/9 bg-white px-3 text-sm outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5" />
                    <button type="button" onClick={() => campaignUrl && copyTracked(campaignUrl, 'Campaña')} disabled={!campaignUrl} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-[#0d151b] px-4 text-xs font-semibold text-white disabled:opacity-40 dark:bg-[#12e89a] dark:text-[#062117]"><Link2 className="size-4" />Copiar link de campaña</button>
                  </div>
                  {campaignUrl ? <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{campaignUrl}</p> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4"><PlanUpgradePrompt compact eyebrow="Convertí links en decisiones" title="Creá campañas y compará qué canal convierte mejor." description="VOLTA PRO agrega campañas identificables y abre la capa de atribución e inteligencia sobre el historial que ya estás construyendo." target="VOLTA PRO" /></div>
          )}
        </section>
      ) : (
        <PlanUpgradePrompt eyebrow="Medí sin complicarte" title="Tu link ya funciona. VOLTA te ayuda a saber de dónde llegan los clientes." description="Desbloqueá QR, links separados para Instagram y WhatsApp y el rendimiento comercial completo. No necesitás aprender UTMs ni configurar analítica externa." />
      )}

      <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="admin-label">Productos</p><h2 className="mt-1 text-lg font-semibold text-foreground">Compartí un producto puntual</h2><p className="mt-1 text-sm text-muted-foreground">El enlace abre directamente el detalle del producto.</p></div><span className="text-xs font-medium text-muted-foreground">{products.length} productos activos</span></div>
        {products.length === 0 ? (
          <div className="mt-4 rounded-[14px] border border-dashed border-black/10 p-5 text-center dark:border-white/12"><Package className="mx-auto size-5 text-muted-foreground" /><p className="mt-2 text-sm font-semibold text-foreground">Todavía no hay productos activos para compartir.</p><Link href="/admin/catalogo/nuevo" className="mt-3 inline-flex min-h-10 items-center rounded-[9px] bg-[#12e89a] px-4 text-xs font-semibold text-[#062117]">Agregar producto</Link></div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {products.map((product) => {
              const message = buildProductShareMessage(storeName, product.name, product.url)
              return (
                <article key={product.id} className="rounded-[14px] border border-black/7 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.035]">
                  <div className="flex min-w-0 items-center gap-3"><div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white shadow-sm dark:bg-white/8">{product.imageUrl ? <img src={product.imageUrl} alt="" className="size-full object-cover" loading="lazy" /> : <Package className="size-5 text-muted-foreground" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{product.name}</p><p className="mt-0.5 text-xs font-medium text-muted-foreground">{product.priceLabel}</p></div><Link href={product.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${product.name}`} className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-black/8 bg-white text-muted-foreground dark:border-white/10 dark:bg-white/5"><ExternalLink className="size-3.5" /></Link></div>
                  <div className="mt-3"><ShareActions url={product.url} text={message} title={product.name} compact /></div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function ChannelLink({ icon: Icon, label, description, url, onCopy }: { icon: typeof Camera; label: string; description: string; url: string; onCopy: (url: string, label: string) => Promise<void> }) {
  return (
    <article className="rounded-[13px] border border-black/7 bg-slate-50 p-3.5 dark:border-white/9 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-[10px] bg-white text-emerald-600 shadow-sm dark:bg-white/7 dark:text-[#12e89a]"><Icon className="size-4" /></span><button type="button" onClick={() => onCopy(url, label)} className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] border border-black/8 bg-white px-2.5 text-[11px] font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><Copy className="size-3.5" />Copiar</button></div>
      <p className="mt-3 text-sm font-semibold text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </article>
  )
}
