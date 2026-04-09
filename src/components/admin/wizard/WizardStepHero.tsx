'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStoreContent, uploadHeroImage } from '@/lib/actions/store'
import { cn } from '@/lib/utils'
import type { StoreContent } from '@/types/store'

export function WizardStepHero({ content }: { content: StoreContent }) {
  const [title, setTitle] = useState(content.hero_title ?? '')
  const [subtitle, setSubtitle] = useState(content.hero_subtitle ?? '')
  const [heroImageUrl, setHeroImageUrl] = useState(content.hero_image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canSave = title.trim().length > 0 && subtitle.trim().length > 0

  async function handleUpload(formData: FormData) {
    const result = await uploadHeroImage(formData)

    if (result?.url) {
      setHeroImageUrl(result.url)
      setImageError(null)
    }

    if (result?.error) {
      setImageError(result.error)
    }

    return result
  }

  function handleSave() {
    setError(null)

    if (!heroImageUrl) {
      setImageError('Para completar este paso, subi una imagen de portada.')
      return
    }

    startTransition(async () => {
      const result = await updateStoreContent({
        banner_mode: content.banner_mode === 'animated' ? 'animated' : 'static',
        banner_speed:
          content.banner_speed === 'slow' || content.banner_speed === 'fast'
            ? content.banner_speed
            : 'normal',
        hero_title: title.trim(),
        hero_subtitle: subtitle.trim(),
        support_text: content.support_text ?? '',
      })

      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const message = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(message)
        return
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Titulo principal
            </Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej: Ropa de diseño independiente"
              maxLength={45}
              disabled={isPending}
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Subtitulo
            </Label>
            <Input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Ej: Hacemos pedidos a medida y enviamos a todo el pais"
              maxLength={110}
              disabled={isPending}
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            onClick={handleSave}
            disabled={isPending || !canSave}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-6 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(16,185,129,0.2)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {isPending ? 'Guardando...' : 'Guardar portada'}
          </button>
        </div>

        <div className="w-full lg:w-[240px]">
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Imagen de portada
          </Label>
          <p className="mb-3 text-xs text-neutral-500">Min. 800px · Obligatoria · Ratio sugerido 16:9</p>
          <div
            className={cn(
              'rounded-2xl border p-3 transition',
              imageError
                ? 'border-red-400/60 bg-red-400/5'
                : 'border-border bg-black/[0.03] dark:border-white/8 dark:bg-white/[0.02]',
            )}
          >
            <ImageUpload
              currentUrl={heroImageUrl}
              onUpload={handleUpload}
              fieldName="hero"
              aspectHint="16:9"
              label="Subir imagen"
            />
          </div>
          {imageError ? <p className="mt-2 text-xs text-red-400">{imageError}</p> : null}
        </div>
      </div>
    </div>
  )
}
