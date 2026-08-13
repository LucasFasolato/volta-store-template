'use client'

import { Download, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

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
      toast.info('Abrimos el QR para que puedas guardarlo.')
    }
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-[#fbfcfd] p-4 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
        <div className="mx-auto flex size-[150px] items-center justify-center rounded-[18px] border border-black/8 bg-white p-2 shadow-sm dark:border-white/10">
          <img src={qrUrl} alt={`Código QR de ${storeName}`} className="size-full rounded-[12px] object-contain" loading="lazy" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-[#12e89a]/10 text-emerald-600 dark:text-[#12e89a]">
              <QrCode className="size-4" />
            </span>
            <p className="text-sm font-semibold text-foreground">Código QR de tu tienda</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ideal para mostrador, bolsas, vidriera o historias. Al escanearlo se abre directamente tu tienda.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            className="mt-3 h-10 rounded-[10px] border-border bg-white px-4 text-foreground hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Download className="size-4" />
            Descargar QR
          </Button>
        </div>
      </div>
    </div>
  )
}
