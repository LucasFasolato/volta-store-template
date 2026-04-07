'use client'

import Link from 'next/link'
import { Copy, ExternalLink, MessageCircle, Play, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { ProductWithImages } from '@/types/store'
import { buildCartItemKey } from '@/lib/stores/cart'
import { buildWhatsAppUrl, type CartItem } from '@/lib/whatsapp/builder'
import { Button } from '@/components/ui/button'

type StoreSharePanelProps = {
  plan: StoreLaunchPlan
  firstProduct: ProductWithImages | null
  whatsapp: string
}

export function StoreSharePanel({ plan, firstProduct, whatsapp }: StoreSharePanelProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plan.publicUrl)
      toast.success('Enlace copiado.')
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  function handleSimulate() {
    if (!firstProduct || !whatsapp) return

    // Build selected options using first value of each option group
    const selectedOptions: Record<string, string> = {}
    for (const opt of firstProduct.options ?? []) {
      if (opt.values.length > 0) {
        selectedOptions[opt.name] = opt.values[0]
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

  const canSimulate = !!(firstProduct && whatsapp)

  return (
    <section id="share-tools" className="admin-surface rounded-xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="admin-label">Compartir tienda</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          {plan.state === 'ready'
            ? 'Tu tienda ya puede salir a circular'
            : plan.state === 'almost_ready'
              ? 'Ya casi la tienes lista para compartir'
              : 'Antes de compartirla, termina esta base'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {plan.state === 'ready'
            ? 'Copia el enlace, abre la tienda o enviala por WhatsApp en segundos.'
            : plan.state === 'almost_ready'
              ? 'Puedes verla y preparar el enlace, pero conviene cerrar el último tramo para compartirla con más confianza.'
              : 'Cuando completes estos puntos, compartirla va a ser mucho más claro y profesional.'}
        </p>
      </div>

      <div className="rounded-lg border border-border dark:border-white/8 bg-black/[0.04] dark:bg-black/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Enlace publico</p>
        <p className="mt-3 break-all text-sm font-medium text-emerald-300">{plan.publicUrl}</p>
      </div>

      {plan.shareEnabled ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2">
            <Button
              type="button"
              onClick={handleCopy}
              className="h-11 justify-between rounded-md bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-4 text-black hover:brightness-105"
            >
              <span>Copiar enlace</span>
              <Copy className="size-4" />
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 justify-between rounded-md border-border dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-4 text-foreground dark:text-white hover:bg-black/[0.07] dark:hover:bg-white/10"
            >
              <Link href={plan.publicPath} target="_blank">
                <span>Abrir tienda</span>
                <ExternalLink className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 justify-between rounded-md border-border dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-4 text-foreground dark:text-white hover:bg-black/[0.07] dark:hover:bg-white/10"
            >
              <Link href={plan.whatsappShareUrl} target="_blank" rel="noreferrer">
                <span>Compartir por WhatsApp</span>
                <MessageCircle className="size-4" />
              </Link>
            </Button>
          </div>

          {/* ── Simulate purchase ─────────────────────────────────────────── */}
          <div className="rounded-xl border border-emerald-300/14 bg-emerald-400/6 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-400/10">
                <Play className="size-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Simular una compra real</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {canSimulate
                    ? `Vas a ver cómo llega un pedido de "${firstProduct?.name}" a tu WhatsApp. Así de simple.`
                    : 'Agrega al menos un producto activo y configurá tu WhatsApp para probar.'}
                </p>
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={!canSimulate}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MessageCircle className="size-3.5" />
                  Probar checkout ahora
                </button>
              </div>
            </div>
          </div>

          {plan.state === 'almost_ready' ? (
            <div className="rounded-lg border border-amber-300/18 bg-amber-400/8 p-4 text-sm leading-6 text-amber-700 dark:text-amber-50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-300/12 text-amber-600 dark:text-amber-100">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-100">Ultimo empujon antes de compartirla con total confianza</p>
                  <p className="mt-1 text-amber-700/80 dark:text-amber-100/80">
                    Completa {plan.nextBestAction.title.toLowerCase()} y la tienda va a quedar mucho mas redonda.
                  </p>
                  <Link
                    href={plan.nextBestAction.href}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-100 transition hover:text-amber-900 dark:hover:text-white"
                  >
                    {plan.nextBestAction.label}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-border dark:border-white/8 bg-black/[0.04] dark:bg-white/4 p-4">
          <p className="text-sm font-medium text-foreground">Primero cierra estos puntos</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {plan.blockers.slice(0, 3).map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
          <Button
            asChild
            variant="outline"
            className="mt-4 h-11 w-full justify-between rounded-md border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
          >
            <Link href={plan.nextBestAction.href}>
              <span>{plan.nextBestAction.label}</span>
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
