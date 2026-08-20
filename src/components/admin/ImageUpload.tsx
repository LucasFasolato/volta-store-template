'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { optimizeImageForUpload, type ImageUploadProfile } from '@/lib/images/client-optimizer'
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
}

const DEFAULT_MIN_WIDTH = 800

export function ImageUpload({
  currentUrl,
  onUpload,
  fieldName,
  aspectHint,
  label = 'Subir imagen',
  className,
  optimizationProfile,
  minWidth,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = preview ?? currentUrl
  const profile: ImageUploadProfile =
    optimizationProfile ?? (fieldName === 'logo' ? 'logo' : fieldName === 'hero' ? 'hero' : 'product')
  const requiredMinWidth = minWidth ?? (profile === 'logo' ? 240 : DEFAULT_MIN_WIDTH)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const sourceFile = event.target.files?.[0]
    if (!sourceFile) return

    setError(null)
    setIsUploading(true)

    let localPreview: string | null = null

    try {
      const optimized = await optimizeImageForUpload(sourceFile, profile)

      if (optimized.width < requiredMinWidth) {
        throw new Error(`Elegí una imagen de al menos ${requiredMinWidth}px de ancho.`)
      }

      localPreview = URL.createObjectURL(optimized.file)
      setPreview(localPreview)

      const formData = new FormData()
      formData.append(fieldName, optimized.file)
      const result = await onUpload(formData)

      if (result && 'error' in result && result.error) {
        setError(result.error)
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
      setPreview(null)
    } finally {
      setIsUploading(false)
      event.target.value = ''
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }

  return (
    <div className={cn('space-y-3', className)} data-appearance-no-dirty="true">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
        data-volta-image-managed="true"
        data-volta-image-profile={profile}
      />

      {displayUrl ? (
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
                JPG, PNG o WebP · mínimo {requiredMinWidth}px · original hasta 20 MB
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
        <p role="alert" aria-live="polite" className="text-xs leading-5 text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  )
}
