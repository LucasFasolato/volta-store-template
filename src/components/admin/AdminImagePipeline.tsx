'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { optimizeImageForUpload, type ImageUploadProfile } from '@/lib/images/client-optimizer'

const OPTIMIZED_EVENT_MARKER = 'voltaOptimizedUpload'
const MANAGED_INPUT_MARKER = 'voltaImageManaged'

function resolveProfile(input: HTMLInputElement): ImageUploadProfile {
  const explicit = input.dataset.voltaImageProfile
  if (explicit === 'hero' || explicit === 'logo' || explicit === 'product') return explicit
  return 'product'
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'No pudimos preparar esa imagen. Intentá nuevamente.'
}

/**
 * Safety net for legacy/admin file inputs that still receive a File directly.
 * New reusable uploads use <ImageUpload />, which optimizes explicitly and marks
 * its input as managed. This guard keeps product cover/gallery uploads optimized
 * without duplicating image logic throughout the admin.
 */
export function AdminImagePipeline() {
  useEffect(() => {
    function handleImageChange(event: Event) {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || input.type !== 'file') return
      if (input.dataset[MANAGED_INPUT_MARKER] === 'true') return

      if (input.dataset[OPTIMIZED_EVENT_MARKER] === 'true') {
        delete input.dataset[OPTIMIZED_EVENT_MARKER]
        return
      }

      const sourceFile = input.files?.[0]
      if (!sourceFile || !sourceFile.type.startsWith('image/')) return

      // Stop the raw file from reaching React handlers. Once the optimized WebP
      // is ready we replace the FileList and emit one clean change event.
      event.preventDefault()
      event.stopImmediatePropagation()

      const wasDisabled = input.disabled
      input.disabled = true
      input.setAttribute('aria-busy', 'true')

      void (async () => {
        try {
          const optimized = await optimizeImageForUpload(sourceFile, resolveProfile(input))
          const transfer = new DataTransfer()
          transfer.items.add(optimized.file)
          input.files = transfer.files
          input.dataset[OPTIMIZED_EVENT_MARKER] = 'true'
          input.disabled = wasDisabled
          input.removeAttribute('aria-busy')
          input.dispatchEvent(new Event('change', { bubbles: true }))
        } catch (error) {
          input.value = ''
          input.disabled = wasDisabled
          input.removeAttribute('aria-busy')
          toast.error(errorMessage(error))
        }
      })()
    }

    document.addEventListener('change', handleImageChange, true)
    return () => document.removeEventListener('change', handleImageChange, true)
  }, [])

  return null
}
