'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
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
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition',
              index === activeIndex
                ? 'border-emerald-300/24 bg-emerald-400/10 text-white'
                : 'border-white/8 bg-white/4 text-neutral-400 hover:text-white',
            )}
          >
            {step.status === 'done' ? <CheckCircle2 className="size-3.5 text-emerald-200" /> : null}
            <span>{index + 1}. {step.title}</span>
          </button>
        ))}
      </div>

      <ActivationStepCard
        step={activeStep}
        stepNumber={activeIndex + 1}
        totalSteps={steps.length}
        canGoPrevious={activeIndex > 0}
        canGoNext={activeIndex < steps.length - 1}
        onPrevious={() => setActiveIndex((current) => Math.max(0, current - 1))}
        onNext={() => setActiveIndex((current) => Math.min(steps.length - 1, current + 1))}
      />
    </div>
  )
}
