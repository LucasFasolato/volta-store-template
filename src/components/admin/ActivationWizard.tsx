import Link from 'next/link'
import { ArrowRight, CheckCircle2, Eye, Globe } from 'lucide-react'
import type { ActivationFlowStep, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { AdminStoreData, Category } from '@/types/store'
import { cn } from '@/lib/utils'
import { WizardStepContact } from './wizard/WizardStepContact'
import { WizardStepHero } from './wizard/WizardStepHero'
import { WizardStepProduct } from './wizard/WizardStepProduct'

export function ActivationWizard({
  steps,
  plan,
  storeData,
  categories,
  activeProductCount,
}: {
  steps: ActivationFlowStep[]
  plan: StoreLaunchPlan
  storeData: AdminStoreData
  categories: Category[]
  activeProductCount: number
}) {
  const currentIndex = steps.findIndex((step) => step.status === 'current')
  const activeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex
  const activeStep = steps[activeIndex] ?? steps[0]

  return (
    <div className="space-y-2.5">
      <WizardHeader steps={steps} activeIndex={activeIndex} activeStep={activeStep} plan={plan} />

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
                plan={plan}
                stepNumber={index + 1}
                totalSteps={steps.length}
                storeData={storeData}
                categories={categories}
                activeProductCount={activeProductCount}
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
  activeStep,
  plan,
}: {
  steps: ActivationFlowStep[]
  activeIndex: number
  activeStep: ActivationFlowStep
  plan: StoreLaunchPlan
}) {
  const headline =
    activeStep.id === 'publish'
      ? 'Solo falta publicar tu tienda'
      : 'Esto es lo que te conviene resolver ahora'

  const summary =
    activeStep.id === 'publish'
      ? 'Negocio, portada y producto ya quedaron listos. Revisa la vista previa y deja la tienda visible cuando quieras.'
      : 'Sigue este orden y evita saltar entre configuraciones. El paso activo es el que mas destraba la publicacion.'

  return (
    <section className="admin-surface rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-500 dark:text-emerald-300/80">
              Activacion guiada
            </p>
            <h1 className="mt-2 font-heading text-[1.7rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2rem]">
              {headline}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {summary}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-black/[0.04] px-4 py-3 text-left dark:border-white/10 dark:bg-white/[0.03] lg:min-w-[250px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Siguiente accion
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{activeStep.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Paso {activeIndex + 1} de {steps.length}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.95fr_0.95fr]">
          <MetricCard
            label="Esenciales completos"
            value={`${plan.completedRequiredCount} de ${plan.totalRequiredCount}`}
            detail={
              plan.canPublish
                ? 'La base minima ya quedo lista para salir al aire.'
                : `${plan.missingRequiredCount} punto${plan.missingRequiredCount === 1 ? '' : 's'} por resolver antes de publicar.`
            }
          />
          <MetricCard
            label="Progreso"
            value={`${plan.requiredCompletionPercent}%`}
            detail="Calculado solo sobre lo imprescindible para vender."
          />
          <MetricCard
            label="Estado"
            value={plan.stateLabel}
            detail={activeStep.id === 'publish' ? 'El siguiente movimiento ya es publicar.' : activeStep.navLabel}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Camino de activacion
            </p>
            <p className="text-xs text-muted-foreground">
              {plan.completedRequiredCount} / {plan.totalRequiredCount}
            </p>
          </div>

          <div className="flex gap-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 flex-col gap-1.5">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full transition-all duration-500',
                    step.status === 'done'
                      ? 'bg-emerald-500'
                      : index === activeIndex
                        ? 'bg-emerald-400/40 dark:bg-emerald-400/30'
                        : 'bg-black/[0.08] dark:bg-white/10',
                  )}
                />
                <span
                  className={cn(
                    'hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:block',
                    step.status === 'done'
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : index === activeIndex
                        ? 'text-foreground'
                        : 'text-muted-foreground/40',
                  )}
                >
                  {step.status === 'done' ? 'OK ' : ''}
                  {step.navLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="admin-surface-muted rounded-2xl p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">{value}</p>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>
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
  plan,
  stepNumber,
  totalSteps,
  storeData,
  categories,
  activeProductCount,
}: {
  step: ActivationFlowStep
  plan: StoreLaunchPlan
  stepNumber: number
  totalSteps: number
  storeData: AdminStoreData
  categories: Category[]
  activeProductCount: number
}) {
  if (step.id === 'publish') {
    return <PublishStepCard step={step} plan={plan} stepNumber={stepNumber} totalSteps={totalSteps} />
  }

  return (
    <section className="admin-surface relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-emerald-300/45" />
      <div
        className="absolute right-[-2rem] top-[-2rem] h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-black/[0.04] px-3 py-1.5 dark:border-white/10 dark:bg-white/6">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black leading-none text-white">
            {stepNumber}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Paso {stepNumber} de {totalSteps}
          </span>
        </div>

        <h2 className="mt-4 font-heading text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[1.95rem]">
          {step.title}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-muted-foreground">{step.hint}</p>

        <div className="mt-7">
          {step.id === 'contact' ? <WizardStepContact store={storeData.store} /> : null}
          {step.id === 'hero' ? <WizardStepHero content={storeData.content} /> : null}
          {step.id === 'products' ? (
            <WizardStepProduct categories={categories} activeProductCount={activeProductCount} />
          ) : null}
        </div>
      </div>
    </section>
  )
}

function PublishStepCard({
  step,
  plan,
  stepNumber,
  totalSteps,
}: {
  step: ActivationFlowStep
  plan: StoreLaunchPlan
  stepNumber: number
  totalSteps: number
}) {
  const missingRecommended = plan.recommendedItems.filter((item) => item.status !== 'done')

  return (
    <section className="admin-surface relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-emerald-300/45" />
      <div
        className="absolute right-[-2rem] top-[-2rem] h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-black/[0.04] px-3 py-1.5 dark:border-white/10 dark:bg-white/6">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black leading-none text-white">
            {stepNumber}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Paso {stepNumber} de {totalSteps}
          </span>
        </div>

        <h2 className="mt-4 font-heading text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[1.95rem]">
          {step.title}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">{step.hint}</p>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-emerald-300/18 bg-emerald-400/8 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Base lista
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Negocio, portada y producto ya estan completos para publicar con criterio.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-black/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Confianza extra
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {missingRecommended.length > 0
                ? `${missingRecommended.length} ajuste${missingRecommended.length === 1 ? '' : 's'} opcional${missingRecommended.length === 1 ? '' : 'es'} para reforzar la tienda.`
                : 'Los detalles recomendados tambien quedaron encaminados.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#publish-gate"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-6 text-sm font-semibold text-slate-950 transition hover:brightness-105"
          >
            {step.ctaLabel}
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href={plan.previewPath}
            target="_blank"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-black/[0.04] px-6 text-sm font-semibold text-foreground transition hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
          >
            <Eye className="size-4" />
            Ver vista previa
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-black/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-500 dark:text-emerald-300">
              <Globe className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">El boton de publicar esta justo debajo.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                El bloque de publicacion queda como soporte para revisar estado, abrir la preview y cambiar a borrador cuando haga falta.
              </p>
            </div>
          </div>
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
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground dark:border-white/10">
        {stepNumber}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{step.navLabel}</p>
    </div>
  )
}
