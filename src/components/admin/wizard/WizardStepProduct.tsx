'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, ImageIcon, Loader2, Package, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(initialProduct?.id ?? null)
  const [createdName, setCreatedName] = useState<string | null>(initialProduct?.name ?? null)
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

    const savedName = name.trim()
    startTransition(async () => {
      const result = await createProduct({
        name: savedName,
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
      setCreatedName(savedName)
      setName('')
      setPrice('')
      router.refresh()
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
    if (!url) return { error: 'La foto se guardó sin una URL válida. Intentá nuevamente.' }

    setProductImageUrl(url)
    setError(null)
    router.refresh()
    return { success: true, url }
  }

  function handleContinue() {
    if (!productReady) {
      setError('Agregá una foto del producto para continuar.')
      return
    }
    setError(null)
    onContinue()
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[13px] border border-black/7 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.025]">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-700 shadow-sm dark:bg-white/8 dark:text-white">
            <Package className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Acá cargás lo que vendés</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Primero nombre y precio. Después la foto del producto. Son sólo dos cosas.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" aria-label="Progreso del producto">
        <div className={`rounded-[10px] border px-3 py-2.5 ${productId ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/15 dark:bg-emerald-400/7' : 'border-[#12e89a] bg-white dark:bg-white/5'}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">1 · Datos</p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">{productId ? 'Listos' : 'Nombre + precio'}</p>
        </div>
        <div className={`rounded-[10px] border px-3 py-2.5 ${productImageUrl ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/15 dark:bg-emerald-400/7' : productId ? 'border-[#12e89a] bg-white dark:bg-white/5' : 'border-black/7 bg-slate-50 opacity-60 dark:border-white/8 dark:bg-white/[0.025]'}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">2 · Foto</p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">{productImageUrl ? 'Lista' : 'Foto del producto'}</p>
        </div>
      </div>

      {!productId ? (
        <>
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-foreground">Nombre del producto</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Remera básica" disabled={isPending} className="h-12 rounded-[10px] bg-white dark:bg-white/5" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-foreground">Precio</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input inputMode="decimal" value={price} onChange={(event) => setPrice(formatPriceTypingValue(event.target.value))} placeholder="25.000" disabled={isPending} className="h-12 rounded-[10px] bg-white pl-8 dark:bg-white/5" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Los miles se separan automáticamente para que el valor sea fácil de leer.</p>
          </div>

          <button type="button" onClick={handleCreate} disabled={isPending || !canCreate} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] disabled:opacity-45 sm:w-auto">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isPending ? 'Creando…' : 'Crear producto'}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2.5 rounded-[11px] border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/7 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{createdName ?? 'Producto'} creado</p>
              <p className="mt-0.5 text-xs leading-5 opacity-80">Ahora sumale una foto para que se vea bien en tu tienda.</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <ImageIcon className="size-4 text-emerald-600 dark:text-[#12e89a]" />
              <p className="text-sm font-semibold text-foreground">Foto del producto</p>
            </div>
            <ImageUpload
              currentUrl={productImageUrl}
              onUpload={handleImageUpload}
              fieldName="image"
              aspectHint="4:5"
              label="Elegir foto del producto"
              optimizationProfile="product"
            />
          </div>

          {productImageUrl ? (
            <div className="rounded-[11px] border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/7 dark:text-emerald-100">
              Producto listo. Revisá la foto y tocá <strong>Continuar</strong> cuando quieras seguir.
            </div>
          ) : null}

          <button type="button" onClick={handleContinue} disabled={!productReady} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#12e89a] px-6 text-sm font-semibold text-[#062117] disabled:opacity-45 sm:w-auto">
            <CheckCircle2 className="size-4" />
            Continuar
          </button>
        </>
      )}

      {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
