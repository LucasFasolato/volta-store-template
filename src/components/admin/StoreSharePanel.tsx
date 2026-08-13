'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, MessageCircle, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { StoreQrCard } from '@/components/admin/StoreQrCard'

export function StoreSharePanel({ plan, storeName }: { plan: StoreLaunchPlan; storeName: string }) {
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const publicUrl = plan.publicUrl.trim()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Enlace copiado.')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  return (
    <section id="share-tools" className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <p className="admin-label">Compartir</p>
      <h2 className="mt-1 text-base font-semibold text-foreground sm:text-lg">Llevá clientes a tu tienda</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" onClick={handleCopy} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] bg-[#12e89a] px-2 text-xs font-semibold text-[#062117]">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Copiado' : 'Enlace'}</button>
        <Link href={plan.whatsappShareUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] border border-black/8 bg-slate-50 px-2 text-xs font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><MessageCircle className="size-4" />WhatsApp</Link>
        <button type="button" onClick={() => setShowQr((value) => !value)} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] border border-black/8 bg-slate-50 px-2 text-xs font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><QrCode className="size-4" />QR</button>
      </div>
      {showQr ? <div className="mt-3"><StoreQrCard publicUrl={publicUrl} storeName={storeName} /></div> : null}
    </section>
  )
}
