'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { updateStoreContent, uploadHeroImage } from '@/lib/actions/store'
import type { StoreContent } from '@/types/store'

export function WizardStepHero({ content }: { content: StoreContent }) {
  const [title, setTitle] = useState(content.hero_title ?? '')
  const [subtitle, setSubtitle] = useState(content.hero_subtitle ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasImage = Boolean(content.hero_image_url)
  const canSave = title.trim().length > 0 && subtitle.trim().length > 0

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateStoreContent({
        hero_title: title.trim(),
        hero_subtitle: subtitle.trim(),
        support_text: content.support_text ?? '',
      })
      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const msg = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(msg)
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Título principal
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Ropa de diseño independiente"
              maxLength={45}
              disabled={isPending}
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Subtítulo
            </Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej: Hacemos pedidos a medida y enviamos a todo el país"
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
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {isPending ? 'Guardando...' : 'Guardar y continuar'}
          </button>

          {!hasImage && canSave ? (
            <p className="text-xs text-neutral-500">
              También subí una imagen de portada para completar este paso.
            </p>
          ) : null}
        </div>

        <div className="w-full lg:w-[220px]">
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Imagen de portada
          </Label>
          <p className="mb-3 text-xs text-neutral-500">Mín. 800px · Ratio 16:9</p>
          <ImageUpload
            currentUrl={content.hero_image_url}
            onUpload={uploadHeroImage}
            fieldName="hero"
            aspectHint="16:9"
            label="Subir imagen"
          />
        </div>
      </div>
    </div>
  )
}
