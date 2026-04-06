'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
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
      if (!file.type.startsWith('image/')) {
        setError('Solo se aceptan imagenes JPG, PNG o WebP.')
        resolve(false)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no puede superar los 10 MB.')
        resolve(false)
        return
      }

      const image = document.createElement('img')
      image.onload = () => {
        URL.revokeObjectURL(image.src)
        if (image.naturalWidth < MIN_WIDTH) {
          setError(`La imagen debe tener al menos ${MIN_WIDTH}px de ancho.`)
          resolve(false)
          return
        }
        resolve(true)
      }
      image.src = URL.createObjectURL(file)
    })
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    const valid = await validateImage(file)
    if (!valid) return

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append(fieldName, file)
      const result = await onUpload(formData)

      if (result && 'error' in result && result.error) {
        setError(result.error)
        setPreview(currentUrl ?? null)
      } else if (result && 'url' in result && result.url) {
        setPreview(result.url)
      }
    } catch {
      setError('Error al subir la imagen. Intenta nuevamente.')
      setPreview(currentUrl ?? null)
    } finally {
      setIsUploading(false)
      event.target.value = ''
      URL.revokeObjectURL(localPreview)
    }
  }

  function handleClear() {
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {displayUrl ? (
        <div className="surface-panel-soft premium-ring group relative overflow-hidden rounded-xl">
          <div className={cn('relative w-full', aspectHint === '16:9' ? 'aspect-video' : 'aspect-[4/5] max-w-[220px]')}>
            <Image src={displayUrl} alt="Vista previa" fill className="object-cover" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 text-black hover:bg-white"
            >
              <Upload className="mr-1.5 size-3" />
              Cambiar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleClear}
              className="bg-white/15 text-white hover:bg-white/20"
            >
              <X className="size-3" />
            </Button>
          </div>

          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <Loader2 className="size-6 animate-spin text-neutral-50" />
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="surface-panel-soft premium-ring group w-full rounded-xl border border-dashed border-white/10 px-6 py-9 text-center transition hover:border-emerald-400/30 hover:bg-white/6"
        >
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <Loader2 className="size-8 animate-spin text-neutral-300" />
            ) : (
              <ImageIcon className="size-8 text-neutral-400 transition group-hover:text-emerald-300" />
            )}
            <div>
              <p className="text-sm font-medium text-white">{isUploading ? 'Subiendo...' : label}</p>
              <p className="mt-1 text-xs text-neutral-400">
                JPG, PNG o WebP · Minimo {MIN_WIDTH}px
                {aspectHint ? ` · Ratio sugerido ${aspectHint}` : ''}
              </p>
            </div>
          </div>
        </button>
      )}

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  )
}
