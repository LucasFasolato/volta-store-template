'use client'

import { useState } from 'react'
import { Check, Circle } from 'lucide-react'
import type { ActivationFlowStep } from '@/lib/dashboard/store-launch'
import { cn } from '@/lib/utils'
import { ActivationStepCard } from '@/components/admin/ActivationStepCard'

function findInitialStepIndex(steps: ActivationFlowStep[]) {
  const currentIndex = steps.findIndex((step) => step.status === 'current')
  if (currentIndex >= 0) return currentIndex

  const upcomingIndex = steps.findIndex((step) => step.status === 'upcoming')
  if (upcomingIndex >= 0) return upcomingIndex

  return steps.length - 1
}

export function ActivationFlow({ steps }: { steps: ActivationFlowStep[] }) {
  const [activeIndex, setActiveIndex] = useState(() => findInitialStepIndex(steps))
  const activeStep = steps[activeIndex]

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((step, index) => {
          const isActive = index === activeIndex

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'group inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-left text-[11px] font-medium transition sm:px-3',
                isActive
                  ? 'border-emerald-300/24 bg-emerald-400/10 text-foreground dark:text-white'
                  : step.status === 'done'
                    ? 'border-border dark:border-white/10 bg-black/[0.04] dark:bg-white/6 text-muted-foreground dark:text-neutral-200 hover:text-foreground dark:hover:text-white'
                    : 'border-border dark:border-white/8 bg-black/[0.03] dark:bg-white/4 text-muted-foreground dark:text-neutral-400 hover:text-foreground dark:hover:text-white',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full',
                  isActive
                    ? 'bg-emerald-300/16 text-emerald-700 dark:text-emerald-100'
                    : step.status === 'done'
                      ? 'bg-emerald-400/12 text-emerald-700 dark:text-emerald-100'
                      : 'bg-black/[0.06] dark:bg-white/8 text-muted-foreground dark:text-neutral-500',
                )}
              >
                {step.status === 'done' ? <Check className="size-3.5" /> : <Circle className="size-2.5 fill-current stroke-0" />}
              </span>
              <span className="whitespace-nowrap">{step.navLabel}</span>
            </button>
          )
        })}
      </div>

      <ActivationStepCard
        step={activeStep}
        stepNumber={activeIndex + 1}
        totalSteps={steps.length}
      />
    </div>
  )
}
