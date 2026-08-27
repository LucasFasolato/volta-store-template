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
  const active = flow[activeIndex]
  const ActiveIcon = active.icon
  const titles = [
    'Confirmá lo básico de tu negocio',
    'Elegí la portada de tu tienda',
    'Creá tu primer producto',
    'Elegí el estilo y publicá',
  ]
  const descriptions = [
    'Nombre, enlace y WhatsApp. Sólo lo necesario para que la tienda funcione bien desde el inicio.',
    'La portada es la imagen grande que presenta tu negocio cuando alguien entra. No es la foto de un producto.',
    'Ahora sí: cargá un producto real con nombre, precio y su propia foto.',
    'Elegí una base visual, revisá la tienda y dejá el link listo para compartir.',
  ]

  function goNext() {
    setActiveIndex((current) => Math.min(current + 1, flow.length - 1))
  }

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
            {flow.map((item, index) => {
              const visuallyDone = item.done || index < activeIndex
              return (
                <span
                  key={item.id}
                  className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-[#12e89a]' : visuallyDone ? 'w-3 bg-[#12e89a]' : 'w-3 bg-slate-200 dark:bg-white/15'}`}
                />
              )
            })}
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

        <div className="mb-5 rounded-[11px] border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-3 text-xs leading-5 text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/7 dark:text-emerald-100">
          Nada avanza solo: completás, revisás y tocás <strong>Continuar</strong> cuando estés listo.
        </div>

        {activeIndex === 0 ? <WizardStepBusiness store={storeData.store} onContinue={goNext} /> : null}
        {activeIndex === 1 ? <WizardStepHero content={storeData.content} onContinue={goNext} /> : null}
        {activeIndex === 2 ? <WizardStepProduct initialProduct={initialProduct} onContinue={goNext} /> : null}
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
