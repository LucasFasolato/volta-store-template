'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { trackSaasEvent } from '@/lib/analytics/saas-events'
import { buildWhatsAppShareUrl } from '@/lib/sharing/links'

type ShareActionsProps = {
  url: string
  text: string
  title: string
  compact?: boolean
}

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) throw new Error('clipboard-copy-failed')
}

function recordFirstShare(location: string) {
  trackSaasEvent('first_share', {
    dedupeKey: 'first-share',
    ctaLocation: location,
  })
}

export function ShareActions({ url, text, title, compact = false }: ShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const whatsappUrl = buildWhatsAppShareUrl(text)

  async function copyLink() {
    try {
      await writeToClipboard(url)
      recordFirstShare('share_link_copy')
      setCopied(true)
      toast.success('Enlace copiado.')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink()
      return
    }

    try {
      await navigator.share({ title, text, url })
      recordFirstShare('share_native')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error('No pudimos abrir el menú para compartir.')
    }
  }

  const buttonClass = compact
    ? 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[9px] border border-black/8 bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8'
    : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-black/8 bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8'

  return (
    <div className="grid grid-cols-3 gap-2">
      <button type="button" onClick={copyLink} className={buttonClass} aria-label="Copiar enlace" aria-live="polite">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => recordFirstShare('share_whatsapp')}
        className={buttonClass}
        aria-label="Compartir por WhatsApp"
      >
        <MessageCircle className="size-4" />
        WhatsApp
      </a>
      <button type="button" onClick={nativeShare} className={buttonClass} aria-label="Abrir opciones para compartir">
        <Share2 className="size-4" />
        Compartir
      </button>
    </div>
  )
}
