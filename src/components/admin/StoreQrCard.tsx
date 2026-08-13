'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'

export function StoreQrCard({ publicUrl, storeName }: { publicUrl: string; storeName: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=640x640&margin=24&format=png&data=${encodeURIComponent(publicUrl)}`

  async function handleDownload() {
    try {
      const response = await fetch(qrUrl)
      if (!response.ok) throw new Error('qr-download-failed')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = `${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'volta-store'}-qr.png`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
      toast.success('QR descargado.')
    } catch {
      window.open(qrUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-black/8 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex size-28 shrink-0 items-center justify-center rounded-[12px] bg-white p-1.5 shadow-sm"><img src={qrUrl} alt={`Código QR de ${storeName}`} className="size-full object-contain" loading="lazy" /></div>
      <div className="min-w-0"><p className="text-sm font-semibold text-foreground">Código QR</p><button type="button" onClick={handleDownload} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-[9px] border border-black/8 bg-white px-3 text-xs font-semibold text-foreground dark:border-white/10 dark:bg-white/5"><Download className="size-4" />Descargar</button></div>
    </div>
  )
}
