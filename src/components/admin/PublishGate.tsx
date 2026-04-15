import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Globe, LockKeyhole, ShieldAlert } from 'lucide-react'
import type { StoreLaunchPlan } from '@/lib/dashboard/store-launch'
import { PublishGateControls } from '@/components/admin/PublishGateControls'

export function PublishGate({ plan }: { plan: StoreLaunchPlan }) {
  const missingBlockingChecks = plan.publication.readiness.blockingChecks.filter((check) => !check.passed)
  const progressValue = `${plan.publication.readiness.passedBlockingChecks}/${plan.publication.readiness.totalBlockingChecks}`
  const isPublished = plan.isPublished
  const isReadyToPublish = plan.publication.isReadyToPublish
  const publishedNeedsAttention = isPublished && !plan.canPublish
  const storefrontPath = isPublished ? plan.publicPath : plan.previewPath

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
    <section id="publish-gate" className="admin-surface rounded-[24px] p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <BadgeIcon className="size-3.5 text-emerald-500 dark:text-emerald-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
              {badge.label}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-foreground sm:text-xl">
            {isPublished
              ? 'Estado de publicacion'
              : isReadyToPublish
                ? 'La tienda ya puede salir al aire'
                : 'Publicacion bloqueada hasta completar lo esencial'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isPublished
              ? publishedNeedsAttention
                ? 'La tienda sigue visible para no cortar ventas, pero conviene reforzar algunos puntos.'
                : 'La tienda ya esta visible. Desde aqui puedes verla o volverla a borrador si hace falta.'
              : isReadyToPublish
                ? 'La base minima ya esta lista. Revisa la vista previa y publica cuando quieras.'
                : 'Resuelve el paso activo del wizard y este bloque se destraba solo.'}
          </p>
        </div>

        <PublishGateControls
          isPublished={isPublished}
          canPublish={plan.canPublish}
          storefrontPath={storefrontPath}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        <StatusMetric
          label="Esenciales"
          value={progressValue}
          detail={
            isReadyToPublish || isPublished
              ? 'Todo lo bloqueante ya esta resuelto.'
              : `${missingBlockingChecks.length} bloqueo${missingBlockingChecks.length === 1 ? '' : 's'} pendiente${missingBlockingChecks.length === 1 ? '' : 's'}.`
          }
        />
        <StatusMetric
          label="Readiness"
          value={`${plan.publication.readiness.score}%`}
          detail="Medido sobre la base minima para publicar."
        />
        <StatusMetric
          label="Siguiente paso"
          value={isPublished ? 'Compartir' : plan.nextBestAction.title}
          detail={isPublished ? 'La tienda ya esta lista para moverse.' : 'Definido por el primer punto faltante.'}
        />
      </div>

      {missingBlockingChecks.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-300/18 bg-amber-400/8 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Lo que hoy sigue bloqueando la publicacion</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {missingBlockingChecks.slice(0, 2).map((check) => check.label).join(' | ')}
                {missingBlockingChecks.length > 2 ? ' | ...' : ''}
              </p>
            </div>
            <Link
              href={plan.nextBestAction.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-emerald-300"
            >
              {plan.nextBestAction.label}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-400/6 p-4">
          <p className="text-sm font-semibold text-foreground">
            {isPublished ? 'La tienda ya esta al aire' : 'Todo lo esencial ya esta resuelto'}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isPublished
              ? 'Ahora el foco pasa a compartirla, cargar mas producto y reforzar confianza.'
              : 'Si quieres, puedes abrir la vista previa y publicar en cuanto te sientas conforme.'}
          </p>
        </div>
      )}
    </section>
  )
}

function StatusMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-black/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">{value}</p>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  )
}
