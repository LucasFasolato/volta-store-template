import { Check, ImageIcon, Package, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
  // `steps` is still accepted while store-launch also serves publish/readiness copy.
  // The first-run experience deliberately exposes only the three decisions that
  // unlock visible value: portada, producto y estilo.
  void steps

  const heroDone = ['hero-copy', 'hero-image'].every(
    (id) => plan.requiredItems.find((item) => item.id === id)?.status === 'done',
  )
  const productDone = ['active-product', 'product-price'].every(
    (id) => plan.requiredItems.find((item) => item.id === id)?.status === 'done',
  )
  const styleDone = plan.recommendedItems.find((item) => item.id === 'style')?.status === 'done'

  const flow = [
    { id: 'hero', label: 'Portada', icon: ImageIcon, done: heroDone },
    { id: 'product', label: 'Primer producto', icon: Package, done: productDone },
    { id: 'style', label: 'Estilo', icon: Sparkles, done: Boolean(styleDone) },
  ] as const

  const currentIndex = Math.max(0, flow.findIndex((item) => !item.done))
  const allDone = flow.every((item) => item.done)
  const activeIndex = allDone ? flow.length - 1 : currentIndex

  return (
    <div className="volta-admin-page space-y-4">
      <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="admin-label">Prepará tu tienda</p>
            <h1 className="mt-1 text-[1.8rem] font-semibold leading-[1.03] tracking-[-0.055em] text-foreground sm:text-[2.25rem]">
              {allDone ? 'La base ya está lista' : 'Tres pasos y ya podés verla funcionando'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {allDone
                ? 'Revisá la vista previa y publicala cuando quieras. Después podés seguir personalizando sin bloquear el lanzamiento.'
                : 'Primero una portada clara, después algo para vender y al final un estilo. Nada más para arrancar.'}
            </p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {flow.filter((item) => item.done).length} de 3 completos
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {flow.map((item, index) => (
            <ProgressItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              number={index + 1}
              done={item.done}
              active={!allDone && index === activeIndex}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-6 lg:p-7">
        {allDone ? (
          <div className="max-w-2xl py-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#12e89a] text-[#062117]"><Check className="size-4" /></span>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-foreground">Tu tienda ya tiene una base profesional</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">La portada, el primer producto y el estilo están resueltos. El bloque de publicación de abajo te muestra exactamente si queda algún requisito técnico antes de compartir el enlace.</p>
          </div>
        ) : activeIndex === 0 ? (
          <StepFrame eyebrow="Paso 1 de 3" title="Portada" description="Mostrá qué vendés con un mensaje claro y una imagen principal.">
            <WizardStepHero content={storeData.content} />
          </StepFrame>
        ) : activeIndex === 1 ? (
          <StepFrame eyebrow="Paso 2 de 3" title="Primer producto" description="Nombre y precio alcanzan para activarlo. La imagen del producto es recomendable, pero no bloquea este paso.">
            <WizardStepProduct categories={categories} activeProductCount={activeProductCount} />
          </StepFrame>
        ) : (
          <StepFrame eyebrow="Paso 3 de 3" title="Elegí un estilo" description="Elegí una base visual. Después vas a poder modificar cada detalle desde Apariencia.">
            <WizardStepStyle publicPath={plan.previewPath} />
          </StepFrame>
        )}
      </section>
    </div>
  )
}

function ProgressItem({
  icon: Icon,
  label,
  number,
  done,
  active,
}: {
  icon: LucideIcon
  label: string
  number: number
  done: boolean
  active: boolean
}) {
  return (
    <div className={`flex items-center gap-3 rounded-[11px] border px-3.5 py-3 ${done ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-400/15 dark:bg-emerald-400/5' : active ? 'border-black/12 bg-[#fbfcfd] dark:border-white/15 dark:bg-white/5' : 'border-black/6 bg-white opacity-50 dark:border-white/8 dark:bg-transparent'}`}>
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] ${done ? 'bg-[#12e89a] text-[#062117]' : active ? 'bg-[#10161d] text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-400 dark:bg-white/5'}`}>
        {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Paso {number}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-foreground">{label}</span>
      </span>
    </div>
  )
}

function StepFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <p className="admin-label">{eyebrow}</p>
        <h2 className="mt-1 text-[1.45rem] font-semibold tracking-[-0.045em] text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
