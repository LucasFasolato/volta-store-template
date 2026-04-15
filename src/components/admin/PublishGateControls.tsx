'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { publishStore, unpublishStore } from '@/lib/store/publication-actions'
import { FormFeedback } from '@/components/common/FormFeedback'
import { Button } from '@/components/ui/button'

type PublishGateControlsProps = {
  isPublished: boolean
  canPublish: boolean
  storefrontPath: string
}

export function PublishGateControls({
  isPublished,
  canPublish,
  storefrontPath,
}: PublishGateControlsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)

  function handlePublicationToggle() {
    setSubmitError(null)

    startTransition(async () => {
      const result = isPublished
        ? await unpublishStore()
        : await publishStore()

      if (result.error) {
        setSubmitError(result.error)
        toast.error(result.error)
        return
      }

      toast.success(
        isPublished
          ? 'La tienda volvio a borrador y dejo de ser publica.'
          : 'La tienda ya quedo publicada y visible para otras personas.',
      )
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-11 rounded-xl border-border bg-black/[0.04] px-4 text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:h-12"
        >
          <Link href={storefrontPath} target="_blank" rel="noreferrer">
            <Eye className="size-4" />
            {isPublished ? 'Ver tienda' : 'Ver vista previa'}
          </Link>
        </Button>

        <Button
          type="button"
          variant={isPublished ? 'outline' : 'default'}
          disabled={pending || (!isPublished && !canPublish)}
          onClick={handlePublicationToggle}
          className={
            isPublished
              ? 'h-11 rounded-xl border-border bg-black/[0.04] px-4 text-foreground hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:h-12'
              : 'h-11 rounded-xl bg-[linear-gradient(135deg,#2ee6a6,#72f6df)] px-4 text-slate-950 hover:brightness-105 sm:h-12'
          }
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending
            ? isPublished
              ? 'Pasando a borrador...'
              : 'Publicando...'
            : isPublished
              ? 'Pasar a borrador'
              : 'Publicar tienda'}
        </Button>
      </div>

      {submitError ? (
        <FormFeedback
          kind="error"
          message={submitError}
          className="w-full max-w-xl lg:ml-auto"
        />
      ) : null}
    </div>
  )
}
