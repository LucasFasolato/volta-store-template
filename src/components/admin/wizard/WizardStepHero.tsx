'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, ImageIcon, Loader2, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [heroImageUrl, setHeroImageUrl] = useState(content.hero_image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleUpload(formData: FormData) {
    const result = await uploadHeroImage(formData)
    if (result?.url) {
      setHeroImageUrl(result.url)
      setError(null)
    }
    // <ImageUpload /> renders upload/validation failures next to the picker.
    // Keep wizard-level errors for the explicit Continue action only.
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
      router.refresh()
    })
  }

  return (
    <div className="activation-simple space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-[13px] border border-emerald-200 bg-emerald-50/80 p-3.5 dark:border-emerald-400/15 dark:bg-emerald-400/7">
          <div className="flex items-start gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-emerald-600 shadow-sm dark:bg-white/8 dark:text-[#12e89a]">
              <ImageIcon className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Portada de la tienda</p>
              <p className="mt-1 text-[11px] leading-5 text-emerald-800/80 dark:text-emerald-100/70">Es la imagen grande que presenta tu negocio apenas alguien entra.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[13px] border border-black/7 bg-slate-50 p-3.5 dark:border-white/8 dark:bg-white/[0.025]">
          <div className="flex items-start gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-slate-600 shadow-sm dark:bg-white/8 dark:text-white">
              <Package className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Foto de producto</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">No es esto. La foto de lo que vendés se carga en el próximo paso.</p>
            </div>
          </div>
        </div>
      </div>

      <ImageUpload
        currentUrl={heroImageUrl}
        onUpload={handleUpload}
        fieldName="hero"
        aspectHint="16:9"
        label="Subir portada de mi tienda"
      />

      {heroImageUrl ? (
        <div className="flex items-start gap-2.5 rounded-[11px] border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/7 dark:text-emerald-100">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Portada cargada</p>
            <p className="mt-0.5 text-xs leading-5 opacity-80">Revisala arriba. Si te gusta, tocá Continuar; si no, podés cambiarla ahora.</p>
          </div>
        </div>
      ) : null}

      {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleContinue}
        disabled={isPending || !heroImageUrl}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] disabled:opacity-45 sm:w-auto"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {isPending ? 'Guardando…' : 'Continuar'}
      </button>
    </div>
  )
}
