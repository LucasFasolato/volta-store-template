'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { updateStoreContent, uploadHeroImage } from '@/lib/actions/store'
import type { StoreContent } from '@/types/store'

export function WizardStepHero({
  content,
  onContinue,
}: {
  content: StoreContent
  onContinue: () => void
}) {
  const [heroImageUrl, setHeroImageUrl] = useState(content.hero_image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleUpload(formData: FormData) {
    const result = await uploadHeroImage(formData)
    if (result?.url) {
      setHeroImageUrl(result.url)
      setError(null)
    }
    return result
  }

  function handleContinue() {
    setError(null)
    if (!heroImageUrl) {
      setError('Elegí una portada para continuar.')
      return
    }

    startTransition(async () => {
      const result = await updateStoreContent({
        banner_mode: content.banner_mode === 'animated' ? 'animated' : 'static',
        banner_speed: content.banner_speed === 'slow' || content.banner_speed === 'fast' ? content.banner_speed : 'normal',
        hero_title: content.hero_title || 'Descubrí todo lo que tenemos para vos',
        hero_subtitle: content.hero_subtitle || 'Elegí tus favoritos y hacé tu pedido por WhatsApp.',
        support_text: content.support_text ?? '',
      })

      if (result?.error) {
        const fields = Object.values(result.error.fieldErrors ?? {}).flat()
        setError(result.error.formErrors?.[0] ?? fields[0] ?? 'No pudimos guardar la portada.')
        return
      }

      onContinue()
    })
  }

  return (
    <div className="space-y-4">
      <ImageUpload
        currentUrl={heroImageUrl}
        onUpload={handleUpload}
        fieldName="hero"
        aspectHint="16:9"
        label="Elegir portada"
        variant="activation"
        showQualityHint={false}
      />

      {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleContinue}
        disabled={isPending || !heroImageUrl}
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] shadow-[0_12px_28px_rgba(18,232,154,.18)] transition hover:brightness-105 disabled:shadow-none disabled:opacity-45"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {isPending ? 'Guardando…' : 'Continuar'}
      </button>
    </div>
  )
}
