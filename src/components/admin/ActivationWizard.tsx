'use client'

import { useEffect, useRef } from 'react'
import { Building2, ImageIcon, Package, Rocket } from 'lucide-react'
import type { ActivationFlowStep, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { AdminStoreData, Category } from '@/types/store'
import { WizardStepBusiness } from './wizard/WizardStepBusiness'
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
  const titleRef = useRef<HTMLHeadingElement>(null)
  const businessDone = steps.find((step) => step.id === 'contact')?.status === 'done'
  const heroDone = steps.find((step) => step.id === 'hero')?.status === 'done'
  const productDone = steps.find((step) => step.id === 'products')?.status === 'done'
  const styleDone = plan.recommendedItems.find((item) => item.id === 'style')?.status === 'done'

  const flow = [
    { id: 'business', label: 'Negocio', icon: Building2, done: businessDone },
    { id: 'hero', label: 'Portada', icon: ImageIcon, done: heroDone },
    { id: 'product', label: 'Producto', icon: Package, done: productDone },
    { id: 'publish', label: 'Publicar', icon: Rocket, done: false },
  ] as const

  const firstPending = flow.findIndex((item) => !item.done)
  const activeIndex = firstPending === -1 ? flow.length - 1 : firstPending
  const active = flow[activeIndex]
  const ActiveIcon = active.icon
  const titles = [
    'Confirmá los datos de tu negocio',
    'Elegí la imagen principal',
    'Agregá tu primer producto',
    'Dale un estilo y publicá tu tienda',
  ]
  const descriptions = [
    'Sólo necesitamos lo esencial para que el pedido llegue a la persona correcta.',
    'Una portada clara hace que el negocio se entienda en segundos.',
    'Con un producto completo ya tenés algo concreto para mostrar y vender.',
    'Elegí una base visual. Después VOLTA publica y te ayuda a compartir el primer link.',
  ]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => titleRef.current?.focus({ preventScroll: true }), 200)
  }, [activeIndex])

  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-[20px] border border-black/8 bg-white shadow-[0_18px_55px_rgba(15,23,42,.05)] dark:border-white/10 dark:bg-[#111820] dark:shadow-none">
      <div className="border-b border-black/7 bg-slate-50/80 px-4 py-4 dark:border-white/8 dark:bg-white/[0.025] sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-[#12e89a]">Activación VOLTA</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Paso {activeIndex + 1} de {flow.length}</p>
          </div>
          <div className="flex items-center gap-1.5" aria-label={`Paso ${activeIndex + 1} de ${flow.length}`}>
            {flow.map((item, index) => (
              <span
                key={item.id}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-[#12e89a]' : item.done ? 'w-3 bg-[#12e89a]' : 'w-3 bg-slate-200 dark:bg-white/15'}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-medium text-muted-foreground">
          {flow.map((item, index) => <span key={item.id} className={index === activeIndex ? 'text-foreground' : ''}>{item.label}</span>)}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-slate-100 text-slate-700 dark:bg-white/7 dark:text-white">
            <ActiveIcon className="size-4.5" />
          </span>
          <div>
            <h1 ref={titleRef} tabIndex={-1} className="text-[1.45rem] font-semibold tracking-[-0.045em] text-foreground outline-none">{titles[activeIndex]}</h1>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{descriptions[activeIndex]}</p>
          </div>
        </div>

        {activeIndex === 0 ? <WizardStepBusiness store={storeData.store} /> : null}
        {activeIndex === 1 ? <WizardStepHero content={storeData.content} /> : null}
        {activeIndex === 2 ? <WizardStepProduct categories={categories} activeProductCount={activeProductCount} /> : null}
        {activeIndex === 3 ? (
          <WizardStepStyle
            previewPath={plan.previewPath}
            publicUrl={plan.publicUrl}
            storeName={storeData.store.name}
            hasExistingStyle={Boolean(styleDone)}
          />
        ) : null}
      </div>
    </section>
  )
}
