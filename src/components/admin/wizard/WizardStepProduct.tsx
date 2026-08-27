'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Plus } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct } from '@/lib/actions/products'
import { uploadProductImage } from '@/lib/actions/products-entry'
import { formatPriceTypingValue, parsePriceTypingValue } from '@/lib/utils/price-input'
import type { ProductWithImages } from '@/types/store'

export function WizardStepProduct({
  initialProduct,
  onContinue,
}: {
  initialProduct: ProductWithImages | null
  onContinue: () => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(initialProduct?.id ?? null)
  const [productImageUrl, setProductImageUrl] = useState<string | null>(initialProduct?.images?.[0]?.url ?? null)
  const [isPending, startTransition] = useTransition()
  const canCreate = name.trim().length > 0 && price.trim().length > 0
  const productReady = Boolean(productId && productImageUrl)

  function handleCreate() {
    setError(null)
    const priceNum = parsePriceTypingValue(price)
    if (priceNum <= 0) {
      setError('Ingresá un precio mayor a 0.')
      return
    }

    startTransition(async () => {
      const result = await createProduct({
        name: name.trim(),
        price: priceNum,
        is_active: true,
        is_featured: false,
        sort_order: 0,
      })

      if (result?.error) {
        const fields = Object.values(result.error.fieldErrors ?? {}).flat()
        setError(result.error.formErrors?.[0] ?? fields[0] ?? 'No pudimos guardar el producto.')
        return
      }

      setProductId(result.productId)
      setName('')
      setPrice('')
    })
  }

  async function handleImageUpload(formData: FormData) {
    if (!productId) return { error: 'Primero creá el producto.' }

    const result = await uploadProductImage(productId, formData) as {
      error?: string
      success?: boolean
      image?: { url?: string | null }
    }

    if (result.error) return { error: result.error }

    const url = result.image?.url ?? null
    if (!url) return { error: 'No pudimos guardar la foto. Intentá nuevamente.' }

    setProductImageUrl(url)
    setError(null)
    return { success: true, url }
  }

  function handleContinue() {
    if (!productReady) {
      setError('Agregá una foto para continuar.')
      return
    }
    setError(null)
    onContinue()
  }

  return (
    <div className="space-y-4">
      {!productId ? (
        <>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block text-xs font-medium text-foreground">Nombre</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Remera básica" disabled={isPending} className="h-12 rounded-[12px] bg-white dark:bg-white/5" />
            </div>
            <div>
              <Label className="mb-2 block text-xs font-medium text-foreground">Precio</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input inputMode="decimal" value={price} onChange={(event) => setPrice(formatPriceTypingValue(event.target.value))} placeholder="25.000" disabled={isPending} className="h-12 rounded-[12px] bg-white pl-8 dark:bg-white/5" />
              </div>
            </div>
          </div>

          <button type="button" onClick={handleCreate} disabled={isPending || !canCreate} className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] shadow-[0_12px_28px_rgba(18,232,154,.18)] transition hover:brightness-105 disabled:shadow-none disabled:opacity-45">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isPending ? 'Creando…' : 'Crear producto'}
          </button>
        </>
      ) : (
        <>
          <ImageUpload
            currentUrl={productImageUrl}
            onUpload={handleImageUpload}
            fieldName="image"
            aspectHint="4:5"
            label="Elegir foto del producto"
            optimizationProfile="product"
            variant="activation"
            showQualityHint={false}
          />

          <button type="button" onClick={handleContinue} disabled={!productReady} className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] shadow-[0_12px_28px_rgba(18,232,154,.18)] transition hover:brightness-105 disabled:shadow-none disabled:opacity-45">
            <CheckCircle2 className="size-4" />
            Continuar
          </button>
        </>
      )}

      {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
