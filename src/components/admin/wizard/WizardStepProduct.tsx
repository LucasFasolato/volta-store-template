'use client'

import { useRef, useState, useTransition } from 'react'
import { CheckCircle2, ImageIcon, Loader2, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct, uploadProductImage } from '@/lib/actions/products'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/store'

const TARGET = 1

export function WizardStepProduct({
  categories,
  activeProductCount,
}: {
  categories: Category[]
  activeProductCount: number
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const remaining = Math.max(0, TARGET - activeProductCount)
  const canSave = name.trim().length > 0 && price.trim().length > 0

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleAdd() {
    setError(null)
    setLastAdded(null)

    const priceNum = parseFloat(price.replace(',', '.'))
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Ingresa un precio valido mayor a 0.')
      return
    }

    const savedName = name.trim()
    const pendingImage = imageFile

    startTransition(async () => {
      const result = await createProduct({
        name: savedName,
        price: priceNum,
        category_id: categoryId || undefined,
        is_active: true,
        is_featured: false,
        sort_order: 0,
      })

      if (result?.error) {
        const fieldMsgs = Object.values(result.error.fieldErrors ?? {}).flat()
        const msg = result.error.formErrors?.[0] ?? fieldMsgs[0] ?? 'Error al guardar.'
        setError(msg)
        return
      }

      if (pendingImage && result.productId) {
        const fd = new FormData()
        fd.append('image', pendingImage)
        await uploadProductImage(result.productId, fd)
      }

      setLastAdded(savedName)
      setName('')
      setPrice('')
      setCategoryId('')
      clearImage()
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-black/[0.04] px-4 py-3 dark:border-white/8 dark:bg-white/[0.03]">
        <div className="flex gap-1.5">
          {Array.from({ length: TARGET }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'size-2.5 rounded-full transition-all',
                i < activeProductCount ? 'bg-emerald-500' : 'bg-black/10 dark:bg-white/15',
              )}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">
          {Math.min(activeProductCount, TARGET)} de {TARGET} productos activos
        </p>
      </div>

      {lastAdded ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>&ldquo;{lastAdded}&rdquo; agregado.</span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Nombre del producto
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Remera basica blanca"
              disabled={isPending}
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Precio
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2500"
              disabled={isPending}
              className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>
          {categories.length > 0 ? (
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
                Categoria <span className="text-neutral-500">(opcional)</span>
              </Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isPending}
                className="h-12 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">Sin categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="sm:w-28">
          <Label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Foto <span className="text-neutral-500">(opcional)</span>
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-white/10">
              <Image src={imagePreview} alt="Vista previa" fill className="object-cover" />
              <button
                type="button"
                onClick={clearImage}
                disabled={isPending}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 text-center transition hover:border-emerald-400/30 hover:bg-white/4"
            >
              <ImageIcon className="size-5 text-neutral-500" />
              <span className="text-[10px] text-neutral-500">Subir</span>
            </button>
          )}
          {!imagePreview ? (
            <p className="mt-2 text-[10px] leading-4 text-neutral-600">
              Los productos con imagen venden mucho mas
            </p>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        onClick={handleAdd}
        disabled={isPending || !canSave}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2ee6a6,#6ff3df)] px-6 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(16,185,129,0.2)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {isPending
          ? 'Guardando...'
          : activeProductCount >= TARGET
            ? 'Agregar otro producto'
            : 'Agregar primer producto'}
      </button>

      {remaining === 0 ? (
        <p className="text-xs text-muted-foreground">
          Ya cumpliste este paso. Si quieres, puedes sumar otro producto ahora mismo.
        </p>
      ) : null}
    </div>
  )
}
