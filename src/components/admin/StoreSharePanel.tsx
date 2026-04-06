'use client'

import Link from 'next/link'
import { Copy, ExternalLink, MessageCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { Button } from '@/components/ui/button'

export function StoreSharePanel({ plan }: { plan: StoreLaunchPlan }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plan.publicUrl)
      toast.success('Enlace copiado.')
    } catch {
      toast.error('No pudimos copiar el enlace.')
    }
  }

  return (
    <section id="share-tools" className="admin-surface rounded-xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="admin-label">Compartir tienda</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {plan.state === 'ready'
            ? 'Tu tienda ya puede salir a circular'
            : plan.state === 'almost_ready'
              ? 'Ya casi la tienes lista para compartir'
              : 'Antes de compartirla, termina esta base'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          {plan.state === 'ready'
            ? 'Copia el enlace, abre la tienda o enviala por WhatsApp en segundos.'
            : plan.state === 'almost_ready'
              ? 'Puedes verla y preparar el enlace, pero conviene cerrar el ultimo tramo para compartirla con mas confianza.'
              : 'Cuando completes estos puntos, compartirla va a ser mucho mas claro y profesional.'}
        </p>
      </div>

      <div className="rounded-lg border border-white/8 bg-black/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Enlace publico</p>
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
              className="h-11 justify-between rounded-md border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
            >
              <Link href={plan.publicPath} target="_blank">
                <span>Abrir tienda</span>
                <ExternalLink className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 justify-between rounded-md border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
            >
              <Link href={plan.whatsappShareUrl} target="_blank" rel="noreferrer">
                <span>Compartir por WhatsApp</span>
                <MessageCircle className="size-4" />
              </Link>
            </Button>
          </div>

          {plan.state === 'almost_ready' ? (
            <div className="rounded-lg border border-amber-300/18 bg-amber-400/8 p-4 text-sm leading-6 text-amber-50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-300/12 text-amber-100">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-amber-100">Ultimo empujon antes de compartirla con total confianza</p>
                  <p className="mt-1 text-amber-100/80">
                    Completa {plan.nextBestAction.title.toLowerCase()} y la tienda va a quedar mucho mas redonda.
                  </p>
                  <Link
                    href={plan.nextBestAction.href}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-100 transition hover:text-white"
                  >
                    {plan.nextBestAction.label}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-white/8 bg-white/4 p-4">
          <p className="text-sm font-medium text-white">Primero cierra estos puntos</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-300">
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
