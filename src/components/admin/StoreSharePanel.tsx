'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, QrCode } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { ShareActions } from '@/components/admin/ShareActions'
import { StoreQrCard } from '@/components/admin/StoreQrCard'

export function StoreSharePanel({ plan, storeName }: { plan: StoreLaunchPlan; storeName: string }) {
  const [showQr, setShowQr] = useState(false)
  const publicUrl = plan.publicUrl.trim()

  return (
    <section id="share-tools" className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-label">Compartir</p>
          <h2 className="mt-1 text-base font-semibold text-foreground sm:text-lg">Llevá clientes a tu tienda</h2>
        </div>
        <Link href="/admin/compartir" className="inline-flex min-h-9 shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
          Más opciones <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">Copiá el link, mandalo por WhatsApp o usá el menú para compartir del teléfono.</p>
      <div className="mt-3"><ShareActions url={publicUrl} text={plan.shareMessage} title={storeName} /></div>
      <button type="button" onClick={() => setShowQr((value) => !value)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[9px] border border-black/8 bg-slate-50 px-3 text-xs font-semibold text-foreground dark:border-white/10 dark:bg-white/5">
        <QrCode className="size-4" /> {showQr ? 'Ocultar QR' : 'Mostrar QR'}
      </button>
      {showQr ? <div className="mt-3"><StoreQrCard publicUrl={publicUrl} storeName={storeName} /></div> : null}
    </section>
  )
}
