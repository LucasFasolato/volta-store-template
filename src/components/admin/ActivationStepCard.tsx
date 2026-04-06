'use client'

import Link from 'next/link'
import {
  AtSign,
  ArrowRight,
  CheckCircle2,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Package,
  Clock3,
} from 'lucide-react'
import type { ActivationFlowStep } from '@/lib/dashboard/store-launch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ActivationStepCard({
  step,
  stepNumber,
  totalSteps,
}: {
  step: ActivationFlowStep
  stepNumber: number
  totalSteps: number
}) {
  const isDone = step.status === 'done'
  const isCurrent = step.status === 'current'

  return (
    <section className="admin-surface relative overflow-hidden rounded-xl p-4 sm:p-5">
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          isDone ? 'bg-emerald-300/40' : isCurrent ? 'bg-emerald-300/24' : 'bg-white/10',
        )}
      />
      <div
        className={cn(
          'absolute right-[-1.5rem] top-[-1.5rem] h-36 w-36 rounded-full blur-3xl',
          isDone ? 'bg-emerald-300/16' : 'bg-emerald-300/10',
        )}
        aria-hidden="true"
      />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-200">
                Paso {stepNumber} de {totalSteps}
              </span>
              <span
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]',
                  isDone
                    ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                    : isCurrent
                      ? 'border-white/10 bg-white/6 text-neutral-200'
                      : 'border-white/8 bg-white/4 text-neutral-400',
                )}
              >
                {isDone ? 'Listo' : isCurrent ? 'Ahora' : 'Despues'}
              </span>
            </div>

            <h2 className="mt-3 max-w-3xl text-[1.45rem] font-semibold tracking-[-0.05em] text-white sm:text-[1.75rem]">
              {step.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-300">
              {step.description}
            </p>
          </div>

          <div className="shrink-0 rounded-md border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-medium text-neutral-300">
            {step.completionText}
          </div>
        </div>

        <div className="rounded-lg border border-white/8 bg-black/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Vista previa
              </p>
              <p className="mt-1.5 text-sm leading-6 text-neutral-400">
                {isDone ? step.doneMessage : step.hint}
              </p>
            </div>
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                isDone ? 'bg-emerald-400/12 text-emerald-100' : 'bg-white/8 text-neutral-200',
              )}
            >
              <CheckCircle2 className="size-4" />
            </div>
          </div>

          <div className="mt-3">
            <StepPreview stepId={step.id} isDone={isDone} />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-md bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-5 text-black shadow-[0_18px_36px_rgba(16,185,129,0.18)] hover:brightness-105"
            >
              <Link href={step.href}>
                {step.ctaLabel}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <p className="text-sm leading-6 text-neutral-400 sm:max-w-sm sm:text-right">
              {isDone
                ? step.doneMessage
                : 'Completa este paso y tu tienda va a sentirse mucho mas lista enseguida.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StepPreview({
  stepId,
  isDone,
}: {
  stepId: ActivationFlowStep['id']
  isDone: boolean
}) {
  if (stepId === 'contact') {
    return (
      <div className="rounded-lg border border-white/8 bg-white/4 p-3.5">
        <div className="flex items-center justify-between rounded-lg border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(46,230,166,0.18),rgba(111,243,223,0.08))] px-4 py-3">
          <div>
            <p className="text-[11px] text-black/70">Boton principal</p>
            <p className="text-sm font-semibold text-black">Hablar por WhatsApp</p>
          </div>
          <MessageCircle className="size-5 text-black" />
        </div>
      </div>
    )
  }

  if (stepId === 'hero') {
    return (
      <div className="rounded-lg border border-white/8 bg-white/4 p-3.5">
        <div className="rounded-lg border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
          <div className="mb-3 h-20 rounded-md bg-[linear-gradient(135deg,rgba(46,230,166,0.18),rgba(255,255,255,0.06))]" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-white/18" />
            <div className="h-3 w-44 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  if (stepId === 'products') {
    return (
      <div className="rounded-lg border border-white/8 bg-white/4 p-3.5">
        <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/10 p-3">
          <div className="size-14 rounded-md bg-[linear-gradient(135deg,rgba(46,230,166,0.16),rgba(255,255,255,0.04))]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 rounded-full bg-white/18" />
            <div className="h-3 w-20 rounded-full bg-emerald-300/30" />
            <div className="h-2.5 w-16 rounded-full bg-white/10" />
          </div>
          <Package className="size-4 text-neutral-400" />
        </div>
      </div>
    )
  }

  if (stepId === 'categories') {
    return (
      <div className="rounded-lg border border-white/8 bg-white/4 p-3.5">
        <div className="flex flex-wrap gap-2">
          {['Destacados', 'Nuevos', 'Regalos'].map((label) => (
            <span
              key={label}
              className={cn(
                'rounded-full border px-3 py-2 text-xs font-medium',
                isDone
                  ? 'border-emerald-300/18 bg-emerald-400/8 text-emerald-100'
                  : 'border-white/8 bg-white/6 text-neutral-300',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-white/8 bg-white/4 p-3.5">
      <div className="grid grid-cols-3 gap-2.5">
        <TrustPill icon={AtSign} label="Instagram" active={isDone} />
        <TrustPill icon={MapPin} label="Direccion" active={isDone} />
        <TrustPill icon={Clock3} label="Horarios" active={isDone} />
      </div>
    </div>
  )
}

function TrustPill({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon
  label: string
  active: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-3 text-center',
        active
          ? 'border-emerald-300/18 bg-emerald-400/8 text-emerald-100'
          : 'border-white/8 bg-black/10 text-neutral-300',
      )}
    >
      <Icon className="mx-auto size-4" />
      <p className="mt-2 text-[11px] font-medium">{label}</p>
    </div>
  )
}
