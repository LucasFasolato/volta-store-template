'use client'

import { useEffect, useRef } from 'react'
import { Check, ImageIcon, Package, Sparkles } from 'lucide-react'
import type { ActivationFlowStep, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { AdminStoreData, Category } from '@/types/store'
import { WizardStepHero } from './wizard/WizardStepHero'
import { WizardStepProduct } from './wizard/WizardStepProduct'
import { WizardStepStyle } from './wizard/WizardStepStyle'

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
  const currentIndex = Math.max(0, flow.findIndex((item) => !item.done))
  const allDone = flow.every((item) => item.done)
  const activeIndex = allDone ? flow.length - 1 : currentIndex
  const active = flow[activeIndex]
  const ActiveIcon = active.icon

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => titleRef.current?.focus({ preventScroll: true }), 250)
  }, [activeIndex, allDone])

  if (allDone) {
    return (
      <section className="mx-auto max-w-3xl rounded-[18px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#111820] sm:p-6">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#12e89a] text-[#062117]"><Check className="size-4" /></span>
        <h1 ref={titleRef} tabIndex={-1} className="mt-4 text-2xl font-semibold tracking-[-0.045em] text-foreground outline-none">Tu tienda está lista para revisar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ya tiene portada, un producto y un estilo.</p>
        <a href="/admin/vista-previa" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#12e89a] px-5 text-sm font-semibold text-[#062117]">Ver mi tienda</a>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">Paso {activeIndex + 1} de 3</p>
        <div className="flex items-center gap-2" aria-label={`Paso ${activeIndex + 1} de 3`}>
          {flow.map((item, index) => <span key={item.id} className={`h-2 rounded-full ${index === activeIndex ? 'w-8 bg-[#12e89a]' : item.done ? 'w-2 bg-[#12e89a]' : 'w-2 bg-slate-200 dark:bg-white/15'}`} />)}
        </div>
      </div>

      <div className="mt-6 border-t border-black/7 pt-6 dark:border-white/8">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-slate-100 text-slate-700 dark:bg-white/7 dark:text-white"><ActiveIcon className="size-4" /></span>
          <div>
            <h1 ref={titleRef} tabIndex={-1} className="text-[1.55rem] font-semibold tracking-[-0.045em] text-foreground outline-none">
              {activeIndex === 0 ? 'Primera pantalla de tu tienda' : activeIndex === 1 ? 'Agregá tu primer producto' : 'Elegí cómo querés que se vea'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{active.label}</p>
          </div>
        </div>

        {activeIndex === 0 ? <WizardStepHero content={storeData.content} /> : null}
        {activeIndex === 1 ? <WizardStepProduct categories={categories} activeProductCount={activeProductCount} /> : null}
        {activeIndex === 2 ? <WizardStepStyle publicPath={plan.previewPath} /> : null}
      </div>
    </section>
  )
}
