import Link from 'next/link'
import { ArrowLeft, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type StateScreenProps = {
  eyebrow?: string
  title: string
  description: string
  primaryAction?: React.ReactNode
  secondaryHref?: string
  secondaryLabel?: string
}

export function StateScreen({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryHref = '/',
  secondaryLabel = 'Volver al inicio',
}: StateScreenProps) {
  return (
    <div className="admin-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-panel premium-ring w-full max-w-xl rounded-[32px] px-6 py-10 text-center sm:px-10">
        {eyebrow ? (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-300 sm:text-base">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {primaryAction}
          <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link href={secondaryHref}>
              <ArrowLeft className="mr-2 size-4" />
              {secondaryLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="bg-emerald-400 text-black hover:bg-emerald-300"
    >
      <RefreshCcw className="mr-2 size-4" />
      Reintentar
    </Button>
  )
}
