'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink, MessageCircle, Play, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { ProductWithImages } from '@/types/store'
import { buildCartItemKey } from '@/lib/stores/cart'
import { buildWhatsAppUrl, type CartItem } from '@/lib/whatsapp/builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type StoreSharePanelProps = {
  plan: StoreLaunchPlan
  firstProduct: ProductWithImages | null
  whatsapp: string
}

export function StoreSharePanel({ plan, firstProduct, whatsapp }: StoreSharePanelProps) {
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<number | null>(null)
  const publicUrl = plan.publicUrl.trim() || 'https://tu-tienda.com/tienda'
  const publicPath = plan.publicPath.trim() || '#'
  const canSimulate = !!(firstProduct && whatsapp)
  const isPublished = plan.isPublished
  const isReadyToPublish = plan.publication.isReadyToPublish
  const storefrontPath = isPublished ? publicPath : plan.previewPath

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Enlace copiado.')

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  function handleSimulate() {
    if (!firstProduct || !whatsapp) return

    const selectedOptions: Record<string, string> = {}
    for (const option of firstProduct.options ?? []) {
      if (option.values.length > 0) {
        selectedOptions[option.name] = option.values[0]
      }
    }

    const hasOptions = Object.keys(selectedOptions).length > 0
    const cartItemKey = buildCartItemKey(
      firstProduct.id,
      hasOptions ? selectedOptions : undefined,
    )
    const productName = hasOptions
      ? `${firstProduct.name} (${Object.values(selectedOptions).join(' / ')})`
      : firstProduct.name

    const items: CartItem[] = [
      {
        cartItemKey,
        productId: firstProduct.id,
        name: productName,
        price: firstProduct.price,
        quantity: 1,
        selectedOptions: hasOptions ? selectedOptions : undefined,
      },
    ]

    const url = buildWhatsAppUrl(whatsapp, items)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="share-tools" className="admin-surface rounded-[24px] p-4 sm:p-6">
      <div>
        <p className="admin-label">Compartir tienda</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
          La forma mas simple de verla y compartirla
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isPublished
            ? 'Copia el enlace, abrela o compartela por WhatsApp.'
            : isReadyToPublish
              ? 'La tienda ya esta lista, pero todavia no esta publicada. Puedes revisar la vista previa y publicarla cuando quieras.'
              : 'Cuando completes estos puntos, compartirla va a ser mucho mas claro y profesional.'}
        </p>
      </div>

      {isPublished ? (
        <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Enlace publico
            </p>
            <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_168px] sm:gap-3">
              <Input
                value={publicUrl}
                readOnly
                aria-label="URL publica de la tienda"
                className="h-11 rounded-xl border-border bg-black/[0.04] px-3.5 font-mono text-sm text-foreground dark:border-white/10 dark:bg-white/[0.04] sm:h-12 sm:px-4"
              />
              <Button
                type="button"
                onClick={handleCopy}
                size="lg"
                className="h-11 rounded-xl bg-[linear-gradient(135deg,#2ee6a6,#72f6df)] px-4 text-slate-950 hover:brightness-105 sm:h-12"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <Button asChild size="lg" className="h-11 rounded-xl px-4 sm:h-12">
              <Link href={storefrontPath} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Abrir tienda
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-xl border-border bg-black/[0.04] px-4 text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:h-12"
            >
              <Link href={plan.whatsappShareUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Compartir por WhatsApp
              </Link>
            </Button>
          </div>

          <SimulationCard
            canSimulate={canSimulate}
            firstProduct={firstProduct}
            onSimulate={handleSimulate}
          />
        </div>
      ) : isReadyToPublish ? (
        <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
          <div className="rounded-2xl border border-emerald-300/16 bg-emerald-400/6 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-600 dark:text-emerald-300">
                <Sparkles className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Lista para publicar</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Solo vos puedes ver esta URL mientras la tienda siga en borrador. Publicala para empezar a compartirla de verdad.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <Button asChild size="lg" className="h-11 rounded-xl px-4 sm:h-12">
              <Link href={storefrontPath} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Ver vista previa
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-xl border-border bg-black/[0.04] px-4 text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:h-12"
            >
              <Link href="#publish-gate">
                <Sparkles className="size-4" />
                Publicar ahora
              </Link>
            </Button>
          </div>

          <SimulationCard
            canSimulate={canSimulate}
            firstProduct={firstProduct}
            onSimulate={handleSimulate}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-black/[0.04] p-4 dark:border-white/8 dark:bg-white/4 sm:mt-5">
          <p className="text-sm font-medium text-foreground">Primero cierra estos puntos</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {plan.blockers.slice(0, 3).map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
          <Button
            asChild
            variant="outline"
            className="mt-4 h-11 rounded-xl border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
          >
            <Link href={plan.nextBestAction.href}>
              <ExternalLink className="size-4" />
              {plan.nextBestAction.label}
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}

function SimulationCard({
  canSimulate,
  firstProduct,
  onSimulate,
}: {
  canSimulate: boolean
  firstProduct: ProductWithImages | null
  onSimulate: () => void
}) {
  return (
    <div className="rounded-2xl border border-emerald-300/14 bg-emerald-400/6 p-3.5 sm:p-5">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-400/10 sm:size-9">
          <Play className="size-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Simular una compra real</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {canSimulate
              ? `Vas a ver como llega un pedido de "${firstProduct?.name}" a tu WhatsApp.`
              : 'Agrega al menos un producto activo y configura tu WhatsApp para probar.'}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSimulate}
            disabled={!canSimulate}
            className="mt-2.5 h-8.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-400/15 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-white sm:mt-3 sm:h-9 sm:px-4"
          >
            <MessageCircle className="size-3.5" />
            Probar checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
