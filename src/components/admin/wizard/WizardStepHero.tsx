'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStoreContent, uploadHeroImage } from '@/lib/actions/store'
import type { StoreContent } from '@/types/store'

export function WizardStepHero({ content }: { content: StoreContent }) {
  const [title, setTitle] = useState(content.hero_title ?? '')
  const [subtitle, setSubtitle] = useState(content.hero_subtitle ?? '')
  const [heroImageUrl, setHeroImageUrl] = useState(content.hero_image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canSave = title.trim().length > 0 && subtitle.trim().length > 0 && !!heroImageUrl

  async function handleUpload(formData: FormData) {
    const result = await uploadHeroImage(formData)
    if (result?.url) setHeroImageUrl(result.url)
    if (result?.error) setError(result.error)
    return result
  }

  function handleSave() {
    setError(null)
    if (!heroImageUrl) return setError('Elegí una imagen para continuar.')
    startTransition(async () => {
      const result = await updateStoreContent({
        banner_mode: content.banner_mode === 'animated' ? 'animated' : 'static',
        banner_speed: content.banner_speed === 'slow' || content.banner_speed === 'fast' ? content.banner_speed : 'normal',
        hero_title: title.trim(),
        hero_subtitle: subtitle.trim(),
        support_text: content.support_text ?? '',
      })
      if (result?.error) {
        const fields = Object.values(result.error.fieldErrors ?? {}).flat()
        setError(result.error.formErrors?.[0] ?? fields[0] ?? 'No pudimos guardar.')
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[14px] border border-black/8 bg-slate-50 dark:border-white/8 dark:bg-white/[0.03]" aria-label="Ejemplo de portada">
        <div className="aspect-[16/7] bg-slate-200 dark:bg-white/8" />
        <div className="p-3"><div className="h-2.5 w-2/3 rounded-full bg-slate-400/35 dark:bg-white/25" /><div className="mt-2 h-2 w-1/2 rounded-full bg-slate-300 dark:bg-white/10" /></div>
      </div>
      <div>
        <Label className="mb-1.5 block text-sm font-medium text-foreground">Qué vendés</Label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ropa de diseño independiente" maxLength={45} disabled={isPending} className="h-12 rounded-[10px] bg-white dark:bg-white/5" />
      </div>
      <div>
        <Label className="mb-1.5 block text-sm font-medium text-foreground">Una frase corta</Label>
        <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Envíos a todo el país" maxLength={110} disabled={isPending} className="h-12 rounded-[10px] bg-white dark:bg-white/5" />
      </div>
      <div>
        <Label className="mb-2 block text-sm font-medium text-foreground">Imagen principal</Label>
        <ImageUpload currentUrl={heroImageUrl} onUpload={handleUpload} fieldName="hero" aspectHint="16:9" label="Elegir imagen" />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button type="button" onClick={handleSave} disabled={isPending || !canSave} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] disabled:opacity-45 sm:w-auto">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{isPending ? 'Guardando…' : 'Continuar'}
      </button>
    </div>
  )
}
