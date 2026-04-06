'use client'

import type { ElementType } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MessageCircle,
  Package,
  Sparkles,
  Tag,
} from 'lucide-react'
import type { ActivationFlowStep } from '@/lib/dashboard/store-launch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const stepVisuals = {
  contact: {
    icon: MessageCircle,
    badge: 'Contacto listo',
    preview: 'Tus clientes sabran donde escribirte desde el primer segundo.',
  },
  hero: {
    icon: ImageIcon,
    badge: 'Portada clara',
    preview: 'Una portada bien resuelta hace que la tienda se entienda mas rapido.',
  },
  products: {
    icon: Package,
    badge: 'Catalogo en marcha',
    preview: 'Con tus primeros productos la tienda ya empieza a sentirse real.',
  },
  categories: {
    icon: Tag,
    badge: 'Orden visual',
    preview: 'Las categorias ayudan a recorrer mejor el catalogo.',
  },
  trust: {
    icon: Sparkles,
    badge: 'Mas confianza',
    preview: 'Los detalles del negocio reducen dudas y suman seguridad.',
  },
} satisfies Record<
  ActivationFlowStep['id'],
  {
    icon: ElementType
    badge: string
    preview: string
  }
>

export function ActivationStepCard({
  step,
  stepNumber,
  totalSteps,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: {
  step: ActivationFlowStep
  stepNumber: number
  totalSteps: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  const visual = stepVisuals[step.id]
  const Icon = visual.icon

  return (
    <section className="admin-surface relative overflow-hidden rounded-[32px] p-5 sm:p-6">
      <div className="absolute right-[-2rem] top-[-2rem] h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-200">
              Paso {stepNumber} de {totalSteps}
            </div>
            <h2 className="mt-4 text-[1.85rem] font-semibold tracking-[-0.05em] text-white sm:text-[2.2rem]">
              {step.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-neutral-300 sm:text-[15px]">
              {step.description}
            </p>
          </div>

          <div className="admin-surface-muted max-w-sm rounded-[26px] p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-100">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  {visual.badge}
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-300">{visual.preview}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[26px] border border-white/8 bg-black/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', step.status === 'done' ? 'border-emerald-300/18 bg-emerald-400/8 text-emerald-100' : step.status === 'current' ? 'border-white/10 bg-white/6 text-neutral-200' : 'border-white/8 bg-white/4 text-neutral-400')}>
                {step.status === 'done' ? 'Listo' : step.status === 'current' ? 'Ahora' : 'Sigue despues'}
              </span>
              <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {step.completionText}
              </span>
            </div>

            <p className="mt-4 text-base font-medium text-white">
              {step.status === 'done'
                ? 'Este paso ya esta resuelto.'
                : 'Por que importa'}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-neutral-400">{step.hint}</p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-11 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-5 text-black hover:brightness-105"
              >
                <Link href={step.href}>
                  {step.ctaLabel}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              {step.skipLabel ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="text-sm font-medium text-neutral-400 transition hover:text-white"
                >
                  {step.skipLabel}
                </button>
              ) : null}
            </div>
          </div>

          <div className="admin-surface-muted rounded-[26px] p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Navegacion
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ChevronLeft className="mr-2 size-4" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onNext}
                disabled={!canGoNext}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Siguiente
                <ChevronRight className="ml-2 size-4" />
              </Button>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/8 bg-black/10 p-4">
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl', step.status === 'done' ? 'bg-emerald-400/12 text-emerald-100' : 'bg-white/8 text-neutral-200')}>
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {step.status === 'done'
                      ? 'Puedes dejarlo asi'
                      : 'Lo que viene despues'}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    {step.status === 'done'
                      ? 'Si quieres, pasa al siguiente paso para seguir preparando la tienda.'
                      : 'Completa este punto y el siguiente paso quedara mas facil de resolver.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
