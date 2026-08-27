'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { optimizeImageForUpload, type ImageUploadProfile } from '@/lib/images/client-optimizer'
import { buildImageQualityHint, IMAGE_WIDTH_GUIDANCE } from '@/lib/images/upload-guidance'
import { cn } from '@/lib/utils'

type UploadResult = {
  success?: boolean
  error?: string
  url?: string
}

type ImageUploadProps = {
  currentUrl?: string | null
  onUpload: (formData: FormData) => Promise<UploadResult | void>
  fieldName: string
  aspectHint?: string
  label?: string
  className?: string
  optimizationProfile?: ImageUploadProfile
  minWidth?: number
  recommendedWidth?: number
  variant?: 'default' | 'compact' | 'activation'
  showQualityHint?: boolean
}

export function ImageUpload({
  currentUrl,
  onUpload,
  fieldName,
  aspectHint,
  label = 'Subir imagen',
  className,
  optimizationProfile,
  minWidth,
  recommendedWidth,
  variant = 'default',
  showQualityHint,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qualityHint, setQualityHint] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = preview ?? currentUrl
  const profile: ImageUploadProfile =
    optimizationProfile ?? (fieldName === 'logo' ? 'logo' : fieldName === 'hero' ? 'hero' : 'product')
  const guidance = IMAGE_WIDTH_GUIDANCE[profile]
  const requiredMinWidth = minWidth ?? guidance.minimum
  const suggestedWidth = recommendedWidth ?? guidance.recommended
  const shouldShowQualityHint = showQualityHint ?? variant === 'default'

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const sourceFile = event.target.files?.[0]
    if (!sourceFile) return

    setError(null)
    setQualityHint(null)
    setIsUploading(true)

    let localPreview: string | null = null

    try {
      const optimized = await optimizeImageForUpload(sourceFile, profile)

      if (requiredMinWidth !== null && optimized.width < requiredMinWidth) {
        throw new Error(`Elegí una imagen de al menos ${requiredMinWidth}px de ancho.`)
      }

      const profileHint = buildImageQualityHint(profile, optimized.width)
      if (profileHint && optimized.width < suggestedWidth) {
        setQualityHint(
          recommendedWidth
            ? `La subimos igual. Para una imagen más nítida, recomendamos ${suggestedWidth}px o más de ancho.`
            : profileHint,
        )
      }

      localPreview = URL.createObjectURL(optimized.file)
      setPreview(localPreview)

      const formData = new FormData()
      formData.append(fieldName, optimized.file)
      const result = await onUpload(formData)

      if (result && 'error' in result && result.error) {
        setError(result.error)
        setQualityHint(null)
        setPreview(null)
      } else if (result && 'url' in result && result.url) {
        setPreview(result.url)
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'No pudimos subir la imagen. Intentá nuevamente.',
      )
      setQualityHint(null)
      setPreview(null)
    } finally {
      setIsUploading(false)
      event.target.value = ''
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }

  return (
    <div className={cn('space-y-2', className)} data-appearance-no-dirty="true">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
        data-volta-image-managed="true"
        data-volta-image-profile={profile}
      />

      {variant === 'activation' ? (
        displayUrl ? (
          <div className="group relative overflow-hidden rounded-[18px] border border-black/8 bg-slate-100 shadow-[0_12px_34px_rgba(15,23,42,.06)] dark:border-white/10 dark:bg-white/[0.04]">
            <div className={cn('relative w-full', aspectHint === '16:9' ? 'h-[190px]' : 'h-[210px]')}>
              <Image
                src={displayUrl}
                alt="Vista previa de la imagen"
                fill
                className={aspectHint === '16:9' ? 'object-cover' : 'object-contain p-2'}
              />
            </div>

            <div className="absolute bottom-3 right-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="min-h-10 rounded-[10px] bg-white/94 px-3.5 text-slate-900 shadow-lg backdrop-blur hover:bg-white"
              >
                <Upload className="mr-1.5 size-3.5" />
                Cambiar
              </Button>
            </div>

            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/60 text-white backdrop-blur-sm">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs font-medium">Optimizando y subiendo…</span>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="group flex min-h-[172px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,#fbfdfc,#f5faf8)] px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.9)] transition hover:border-emerald-400 hover:bg-emerald-50/70 disabled:cursor-wait disabled:opacity-70 dark:border-white/14 dark:bg-[linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.025))] dark:hover:bg-emerald-400/[0.07]"
          >
            <span className="flex size-13 items-center justify-center rounded-[15px] bg-white text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,.08)] transition group-hover:-translate-y-0.5 group-hover:text-emerald-600 dark:bg-white/8 dark:text-white/75 dark:group-hover:text-[#12e89a]">
              {isUploading ? <Loader2 className="size-6 animate-spin" /> : <ImageIcon className="size-6" />}
            </span>
            <span className="mt-4 block text-base font-semibold tracking-[-0.02em] text-foreground">
              {isUploading ? 'Subiendo…' : label}
            </span>
            <span className="mt-1.5 block text-xs text-muted-foreground">JPG, PNG, WebP o HEIC · hasta 20 MB</span>
          </button>
        )
      ) : variant === 'compact' ? (
        displayUrl ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-black/8 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.035]">
            <div
              className={cn(
                'relative shrink-0 overflow-hidden rounded-[9px] bg-slate-200 dark:bg-white/8',
                aspectHint === '16:9' ? 'h-[68px] w-[108px]' : 'h-[76px] w-[64px]',
              )}
            >
              <Image src={displayUrl} alt="Vista previa de la imagen" fill className="object-cover" />
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">Imagen lista</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Podés cambiarla si querés.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="shrink-0"
            >
              <Upload className="mr-1.5 size-3.5" />
              Cambiar
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex min-h-[92px] w-full items-center gap-3 rounded-[12px] border border-dashed border-black/12 bg-slate-50 px-4 text-left transition hover:border-emerald-400/50 hover:bg-emerald-50/45 disabled:cursor-wait disabled:opacity-70 dark:border-white/12 dark:bg-white/[0.035] dark:hover:bg-emerald-400/[0.06]"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-500 shadow-sm dark:bg-white/8 dark:text-white/70">
              {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImageIcon className="size-5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {isUploading ? 'Subiendo…' : label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">JPG, PNG, WebP o HEIC · hasta 20 MB</span>
            </span>
          </button>
        )
      ) : displayUrl ? (
        <div className="surface-panel-soft premium-ring group relative overflow-hidden rounded-xl">
          <div
            className={cn(
              'relative w-full',
              aspectHint === '16:9' ? 'aspect-video' : 'aspect-[4/5] max-w-[220px]',
            )}
          >
            <Image src={displayUrl} alt="Vista previa de la imagen" fill className="object-cover" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="bg-white/90 text-black hover:bg-white"
            >
              <Upload className="mr-1.5 size-3" />
              Cambiar imagen
            </Button>
          </div>

          {isUploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs font-medium">Optimizando y subiendo…</span>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="surface-panel-soft premium-ring group w-full rounded-xl border border-dashed border-white/10 px-5 py-8 text-center transition hover:border-emerald-400/30 hover:bg-white/6 disabled:cursor-wait disabled:opacity-70 sm:px-6 sm:py-9"
        >
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <Loader2 className="size-8 animate-spin text-neutral-300" />
            ) : (
              <ImageIcon className="size-8 text-neutral-400 transition group-hover:text-emerald-300" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {isUploading ? 'Preparando imagen…' : label}
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                JPG, PNG, WebP o HEIC · original hasta 20 MB
                {requiredMinWidth !== null ? ` · mínimo ${requiredMinWidth}px` : ''}
                {suggestedWidth ? ` · recomendado ${suggestedWidth}px o más` : ''}
                {aspectHint ? ` · sugerido ${aspectHint}` : ''}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                VOLTA reduce el peso y la guarda optimizada automáticamente.
              </p>
            </div>
          </div>
        </button>
      )}

      {error ? (
        <p role="alert" aria-live="polite" className="text-xs leading-5 text-red-500 dark:text-red-300">
          {error}
        </p>
      ) : shouldShowQualityHint && qualityHint ? (
        <p role="status" aria-live="polite" className="text-xs leading-5 text-amber-600 dark:text-amber-300">
          {qualityHint}
        </p>
      ) : null}
    </div>
  )
}
