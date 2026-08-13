'use client'

import { useEffect, useRef } from 'react'
import { ImageIcon, Package, Sparkles } from 'lucide-react'
import type { ActivationFlowStep, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { AdminStoreData, Category } from '@/types/store'
import { WizardStepHero } from './wizard/WizardStepHero'
import { WizardStepProduct } from './wizard/WizardStepProduct'
import { WizardStepStyle } from './wizard/WizardStepStyle'

export function ActivationWizard({ steps, plan, storeData, categories, activeProductCount }: { steps: ActivationFlowStep[]; plan: StoreLaunchPlan; storeData: AdminStoreData; categories: Category[]; activeProductCount: number }) {
  void steps
  const titleRef = useRef<HTMLHeadingElement>(null)
  const heroDone = ['hero-copy', 'hero-image'].every((id) => plan.requiredItems.find((item) => item.id === id)?.status === 'done')
  const productDone = ['active-product', 'product-price'].every((id) => plan.requiredItems.find((item) => item.id === id)?.status === 'done')
  const styleDone = plan.recommendedItems.find((item) => item.id === 'style')?.status === 'done'
  const flow = [
    { id: 'hero', label: 'Portada', icon: ImageIcon, done: heroDone },
    { id: 'product', label: 'Producto', icon: Package, done: productDone },
    { id: 'style', label: 'Estilo', icon: Sparkles, done: Boolean(styleDone) },
  ] as const
  const firstPending = flow.findIndex((item) => !item.done)
  const activeIndex = firstPending === -1 ? 2 : firstPending
  const active = flow[activeIndex]
  const ActiveIcon = active.icon

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => titleRef.current?.focus({ preventScroll: true }), 200)
  }, [activeIndex])

  return (
    <section className="mx-auto max-w-2xl rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">Paso {activeIndex + 1} de 3</p>
        <div className="flex items-center gap-2">{flow.map((item, index) => <span key={item.id} className={`h-2 rounded-full ${index === activeIndex ? 'w-8 bg-[#12e89a]' : item.done ? 'w-2 bg-[#12e89a]' : 'w-2 bg-slate-200 dark:bg-white/15'}`} />)}</div>
      </div>
      <div className="mt-4 border-t border-black/7 pt-4 dark:border-white/8">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700 dark:bg-white/7 dark:text-white"><ActiveIcon className="size-4" /></span>
          <div><h1 ref={titleRef} tabIndex={-1} className="text-[1.4rem] font-semibold tracking-[-0.04em] text-foreground outline-none">{activeIndex === 0 ? 'Elegí la imagen principal' : activeIndex === 1 ? 'Agregá tu primer producto' : 'Elegí el estilo de tu tienda'}</h1><p className="mt-1 text-sm text-muted-foreground">{active.label}</p></div>
        </div>
        {activeIndex === 0 ? <WizardStepHero content={storeData.content} /> : null}
        {activeIndex === 1 ? <WizardStepProduct categories={categories} activeProductCount={activeProductCount} /> : null}
        {activeIndex === 2 ? <WizardStepStyle publicPath={plan.publicPath} /> : null}
      </div>
    </section>
  )
}
