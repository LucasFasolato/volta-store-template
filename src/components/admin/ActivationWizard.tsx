'use client'

import { useEffect, useRef, useState } from 'react'
import { Building2, ImageIcon, Package, Rocket } from 'lucide-react'
import type { ActivationFlowStep, StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import type { AdminStoreData, ProductWithImages } from '@/types/store'
import { WizardStepBusiness } from './wizard/WizardStepBusiness'
import { WizardStepHero } from './wizard/WizardStepHero'
import { WizardStepProduct } from './wizard/WizardStepProduct'
import { WizardStepStyle } from './wizard/WizardStepStyle'

export function ActivationWizard({
  steps,
  plan,
  storeData,
  initialProduct,
}: {
  steps: ActivationFlowStep[]
  plan: StoreLaunchPlan
  storeData: AdminStoreData
  initialProduct: ProductWithImages | null
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

  const initialPendingIndex = flow.findIndex((item) => !item.done)
  const [activeIndex, setActiveIndex] = useState(
    initialPendingIndex === -1 ? flow.length - 1 : initialPendingIndex,
  )
  const [storeName, setStoreName] = useState(storeData.store.name)
  const [publicUrl, setPublicUrl] = useState(plan.publicUrl)
  const active = flow[activeIndex]
  const ActiveIcon = active.icon
  const titles = ['Datos del negocio', 'Portada', 'Primer producto', 'Publicar']
  const descriptions = [
    'Nombre, enlace y WhatsApp.',
    '',
    'Nombre, precio y foto.',
    'Elegí un estilo y publicá tu tienda.',
  ]

  function goNext() {
    setActiveIndex((current) => {
      for (let index = current + 1; index < flow.length - 1; index += 1) {
        if (!flow[index].done) return index
      }
      return flow.length - 1
    })
  }

  function continueBusiness(identity: { name: string; slug: string }) {
    setStoreName(identity.name)
    const baseUrl = plan.publicUrl.slice(0, Math.max(0, plan.publicUrl.lastIndexOf('/tienda/')))
    setPublicUrl(`${baseUrl}/tienda/${identity.slug}`)
    goNext()
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [activeIndex])

  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_22px_70px_rgba(15,23,42,.07)] dark:border-white/10 dark:bg-[#111820] dark:shadow-none">
      <div className="border-b border-black/7 bg-slate-50/80 px-5 py-4 dark:border-white/8 dark:bg-white/[0.025] sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-600 dark:text-[#12e89a]">Activación VOLTA</p>
            <p className="mt-1 text-[15px] font-semibold text-foreground">Paso {activeIndex + 1} de {flow.length}</p>
          </div>
          <div className="flex items-center gap-1.5" aria-label={`Paso ${activeIndex + 1} de ${flow.length}`}>
            {flow.map((item, index) => {
              const visuallyDone = item.done || index < activeIndex
              return (
                <span key={item.id} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-[#12e89a]' : visuallyDone ? 'w-3 bg-[#12e89a]' : 'w-3 bg-slate-200 dark:bg-white/15'}`} />
              )
            })}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {flow.map((item, index) => <span key={item.id} className={index === activeIndex ? 'text-foreground' : ''}>{item.label}</span>)}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-slate-100 text-slate-700 shadow-[inset_0_0_0_1px_rgba(15,23,42,.02)] dark:bg-white/7 dark:text-white"><ActiveIcon className="size-5" /></span>
          <div className="min-w-0">
            <h1 ref={titleRef} tabIndex={-1} className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-foreground outline-none">{titles[activeIndex]}</h1>
            {descriptions[activeIndex] ? <p className="mt-1 text-sm text-muted-foreground">{descriptions[activeIndex]}</p> : null}
          </div>
        </div>

        {activeIndex === 0 ? <WizardStepBusiness store={storeData.store} onContinue={continueBusiness} /> : null}
        {activeIndex === 1 ? <WizardStepHero content={storeData.content} onContinue={goNext} /> : null}
        {activeIndex === 2 ? <WizardStepProduct initialProduct={initialProduct} onContinue={goNext} /> : null}
        {activeIndex === 3 ? (
          <WizardStepStyle previewPath={plan.previewPath} publicUrl={publicUrl} storeName={storeName} hasExistingStyle={Boolean(styleDone)} />
        ) : null}
      </div>
    </section>
  )
}
