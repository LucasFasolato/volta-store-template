import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Eye, Globe, LockKeyhole, ShieldAlert } from 'lucide-react'
import { publishStore, unpublishStore } from '@/lib/store/publication'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { Button } from '@/components/ui/button'
import { PublishGateActionButton } from '@/components/admin/PublishGateActionButton'
import { StoreSetupChecklist } from '@/components/admin/StoreSetupChecklist'

export function PublishGate({ plan }: { plan: StoreLaunchPlan }) {
  const blockingChecks = plan.publication.readiness.blockingChecks
  const missingBlockingChecks = blockingChecks.filter((check) => !check.passed)
  const progressValue = `${plan.publication.readiness.passedBlockingChecks}/${plan.publication.readiness.totalBlockingChecks}`
  const isPublished = plan.isPublished
  const isReadyToPublish = plan.publication.isReadyToPublish
  const publishedNeedsAttention = isPublished && !plan.canPublish

  const badge = isPublished
    ? {
        label: publishedNeedsAttention ? 'Publicada con alertas' : 'Publicada',
        icon: publishedNeedsAttention ? ShieldAlert : Globe,
      }
    : isReadyToPublish
      ? {
          label: 'Lista para publicar',
          icon: CheckCircle2,
        }
      : {
          label: 'En borrador',
          icon: LockKeyhole,
        }

  const BadgeIcon = badge.icon

  return (
    <section id="publish-gate" className="admin-surface rounded-[24px] p-4 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <BadgeIcon className="size-3.5 text-emerald-500 dark:text-emerald-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
              {badge.label}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
            {isPublished
              ? 'Control de publicacion'
              : isReadyToPublish
                ? 'Tu tienda ya puede salir al aire'
                : 'Todavia no conviene publicarla'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isPublished
              ? publishedNeedsAttention
                ? 'La tienda sigue visible para no cortar ventas, pero conviene completar lo que falta para sostener confianza.'
                : 'La tienda ya esta visible para otras personas. Si necesitas frenarla, puedes volverla a borrador.'
              : isReadyToPublish
                ? 'La base comercial ya esta resuelta. Publicala cuando quieras para que cualquiera pueda verla.'
                : 'Solo vos ves esta version. Completa los puntos bloqueantes para habilitar la publicacion real.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 rounded-xl border-border bg-black/[0.04] px-4 text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:h-12"
          >
            <Link href={plan.publicPath} target="_blank" rel="noreferrer">
              <Eye className="size-4" />
              {isPublished ? 'Ver tienda' : 'Ver vista previa'}
            </Link>
          </Button>

          {isPublished ? (
            <form
              action={async () => {
                'use server'
                await unpublishStore()
              }}
            >
              <PublishGateActionButton
                idleLabel="Pasar a borrador"
                pendingLabel="Pasando a borrador..."
                variant="outline"
                className="h-11 rounded-xl border-border bg-black/[0.04] px-4 text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:h-12"
              />
            </form>
          ) : (
            <form
              action={async () => {
                'use server'
                await publishStore()
              }}
            >
              <PublishGateActionButton
                idleLabel="Publicar tienda"
                pendingLabel="Publicando..."
                disabled={!plan.canPublish}
                className="h-11 rounded-xl bg-[linear-gradient(135deg,#2ee6a6,#72f6df)] px-4 text-slate-950 hover:brightness-105 sm:h-12"
              />
            </form>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-border bg-black/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Readiness de publicacion
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {progressValue} puntos esenciales completos
              </p>
            </div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
              {plan.publication.readiness.score}%
            </p>
          </div>

          <div className="mt-4 h-2 rounded-full bg-black/[0.08] dark:bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#2ee6a6,#72f6df)] transition-all"
              style={{ width: `${plan.publication.readiness.score}%` }}
            />
          </div>

          {missingBlockingChecks.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-300/18 bg-amber-400/8 p-4">
              <p className="text-sm font-semibold text-foreground">Lo que hoy bloquea la publicacion</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {missingBlockingChecks.slice(0, 3).map((check) => (
                  <li key={check.key}>- {check.label}</li>
                ))}
              </ul>
              <Link
                href={plan.nextBestAction.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-emerald-300"
              >
                {plan.nextBestAction.label}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-400/6 p-4">
              <p className="text-sm font-semibold text-foreground">
                {isPublished ? 'La tienda ya esta al aire' : 'Todo lo esencial ya esta resuelto'}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isPublished
                  ? 'Ahora puedes enfocarte en compartirla, seguir cargando productos y reforzar confianza comercial.'
                  : 'En cuanto la publiques, la URL va a quedar disponible para cualquier persona que la reciba.'}
              </p>
            </div>
          )}
        </div>

        <StoreSetupChecklist checks={plan.publication.readiness.checks} />
      </div>
    </section>
  )
}
