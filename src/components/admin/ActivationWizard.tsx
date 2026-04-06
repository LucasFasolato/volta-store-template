import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { ActivationFlowStep, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { cn } from '@/lib/utils'

export function ActivationWizard({
  steps,
  plan,
}: {
  steps: ActivationFlowStep[]
  plan: StoreLaunchPlan
}) {
  const currentIndex = steps.findIndex((s) => s.status === 'current')
  // If all done somehow (edge case), focus the last step
  const activeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex

  return (
    <div className="space-y-2.5 p-4 sm:p-5 lg:p-6">
      <WizardHeader steps={steps} activeIndex={activeIndex} percent={plan.requiredCompletionPercent} />

      <div className="space-y-2">
        {steps.map((step, index) => {
          if (step.status === 'done') {
            return <DoneRow key={step.id} step={step} />
          }
          if (index === activeIndex) {
            return (
              <ActiveCard
                key={step.id}
                step={step}
                stepNumber={index + 1}
                totalSteps={steps.length}
              />
            )
          }
          return <UpcomingRow key={step.id} step={step} stepNumber={index + 1} />
        })}
      </div>
    </div>
  )
}

function WizardHeader({
  steps,
  activeIndex,
  percent,
}: {
  steps: ActivationFlowStep[]
  activeIndex: number
  percent: number
}) {
  return (
    <div className="admin-surface rounded-2xl px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-500 dark:text-emerald-300/80">
            Volta Admin
          </p>
          <h1 className="mt-1.5 font-heading text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[1.75rem]">
            Preparando tu tienda
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa cada paso para dejarla lista y compartirla con confianza.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Paso {activeIndex + 1} de {steps.length}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{percent}%</p>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-500',
              step.status === 'done'
                ? 'bg-emerald-500'
                : index === activeIndex
                  ? 'bg-emerald-400/40 dark:bg-emerald-400/30'
                  : 'bg-black/[0.08] dark:bg-white/10',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function DoneRow({ step }: { step: ActivationFlowStep }) {
  return (
    <div className="admin-surface-muted flex items-center gap-3 rounded-xl px-4 py-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
      </div>
      <p className="flex-1 text-sm font-medium text-foreground">{step.navLabel}</p>
      <p className="hidden truncate text-sm text-muted-foreground sm:block sm:max-w-[260px]">
        {step.doneMessage}
      </p>
      <Link
        href={step.href}
        className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground"
      >
        Editar
      </Link>
    </div>
  )
}

function ActiveCard({
  step,
  stepNumber,
  totalSteps,
}: {
  step: ActivationFlowStep
  stepNumber: number
  totalSteps: number
}) {
  return (
    <section className="admin-surface relative overflow-hidden rounded-2xl p-6 sm:p-8">
      {/* Emerald accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-emerald-300/45" />
      {/* Ambient glow */}
      <div
        className="absolute right-[-2rem] top-[-2rem] h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        {/* Step badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border dark:border-white/10 bg-black/[0.04] dark:bg-white/6 px-3 py-1.5">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black leading-none text-white">
            {stepNumber}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Paso {stepNumber} de {totalSteps}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 font-heading text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[1.95rem]">
          {step.title}
        </h2>

        {/* Description — the "why" */}
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
          {step.description}
        </p>

        {/* CTA */}
        <div className="mt-7">
          <Link
            href={step.href}
            className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-7 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(16,185,129,0.22)] transition hover:brightness-105 active:scale-[0.98]"
          >
            {step.ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function UpcomingRow({
  step,
  stepNumber,
}: {
  step: ActivationFlowStep
  stepNumber: number
}) {
  return (
    <div className="admin-surface-muted flex items-center gap-3 rounded-xl px-4 py-3 opacity-40">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border dark:border-white/10 text-xs font-bold text-muted-foreground">
        {stepNumber}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{step.navLabel}</p>
    </div>
  )
}
