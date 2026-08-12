'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
}

const MIN_WIDTH = 800
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function ImageUpload({
  currentUrl,
  onUpload,
  fieldName,
  aspectHint,
  label = 'Subir imagen',
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = preview ?? currentUrl

  function validateImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        setError('Elegí una imagen JPG, PNG o WebP.')
        resolve(false)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('La imagen puede pesar hasta 10 MB.')
        resolve(false)
        return
      }

      const objectUrl = URL.createObjectURL(file)
      const image = document.createElement('img')

      image.onload = () => {
        URL.revokeObjectURL(objectUrl)
        if (image.naturalWidth < MIN_WIDTH) {
          setError(`Elegí una imagen de al menos ${MIN_WIDTH}px de ancho.`)
          resolve(false)
          return
        }
        resolve(true)
      }

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        setError('No pudimos leer esa imagen. Probá con otro archivo.')
        resolve(false)
      }

      image.src = objectUrl
    })
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    const valid = await validateImage(file)
    if (!valid) {
      event.target.value = ''
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append(fieldName, file)
      const result = await onUpload(formData)

      if (result && 'error' in result && result.error) {
        setError(result.error)
        setPreview(null)
      } else if (result && 'url' in result && result.url) {
        setPreview(result.url)
      }
    } catch {
      setError('No pudimos subir la imagen. Intentá nuevamente.')
      setPreview(null)
    } finally {
      setIsUploading(false)
      event.target.value = ''
      URL.revokeObjectURL(localPreview)
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
      />

      {displayUrl ? (
        <div className="surface-panel-soft premium-ring group relative overflow-hidden rounded-xl">
          <div className={cn('relative w-full', aspectHint === '16:9' ? 'aspect-video' : 'aspect-[4/5] max-w-[220px]')}>
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
              <span className="text-xs font-medium">Subiendo imagen…</span>
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
              <p className="text-sm font-medium text-white">{isUploading ? 'Subiendo…' : label}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                JPG, PNG o WebP · mínimo {MIN_WIDTH}px · máximo 10 MB
                {aspectHint ? ` · sugerido ${aspectHint}` : ''}
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
