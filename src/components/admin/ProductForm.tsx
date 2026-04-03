'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CharCounter } from '@/components/common/CharCounter'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { CONTENT_LIMITS } from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import {
  createProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from '@/lib/actions/products'
import { formatCurrency } from '@/lib/utils/format'
import { productSchema, type ProductInput } from '@/lib/validations/product'
import type { Category, ProductWithImages } from '@/types/store'

type ProductFormProps = {
  product?: ProductWithImages
  categories: Category[]
  productId?: string
}

export function ProductForm({ product, categories, productId }: ProductFormProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [images, setImages] = useState(product?.images ?? [])
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      short_description: product?.short_description ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      compare_price: product?.compare_price ?? undefined,
      badge: product?.badge ?? '',
      category_id: product?.category_id ?? null,
      is_featured: product?.is_featured ?? false,
      is_active: product?.is_active ?? true,
      sort_order: product?.sort_order ?? 0,
    },
  })

  async function onSubmit(data: ProductInput) {
    setSubmitError(null)

    if (productId) {
      const result = await updateProduct(productId, data)

      if (result?.error) {
        const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
        setSubmitError(message)
        toast.error(message)
        return
      }

      setSaved(true)
      toast.success('Producto actualizado.')
      setTimeout(() => setSaved(false), 2500)
      return
    }

    const result = await createProduct(data)
    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
      setSubmitError(message)
      toast.error(message)
      return
    }

    if (result?.success && result.productId) {
      toast.success('Producto creado. Ahora puedes subir imagenes y ajustar detalles.')
      router.push(`/admin/productos/${result.productId}`)
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!productId) return

    const file = event.target.files?.[0]
    if (!file) return

    setImageError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('image', file)
    const result = await uploadProductImage(productId, formData)

    if (result?.error) {
      setImageError(result.error as string)
      toast.error(String(result.error))
    } else if (result?.image) {
      const image = result.image as { id: string; url: string }
      setImages((prev) => [
        ...prev,
        {
          id: image.id,
          product_id: productId,
          url: image.url,
          alt: null,
          sort_order: prev.length,
          created_at: new Date().toISOString(),
        },
      ])
      toast.success('Imagen subida.')
    }

    setIsUploading(false)
    event.target.value = ''
  }

  async function handleDeleteImage(imageId: string) {
    if (!productId) return

    const result = await deleteProductImage(imageId, productId)
    if (result?.error) {
      setImageError(result.error)
      toast.error(result.error)
      return
    }

    setImages((prev) => prev.filter((image) => image.id !== imageId))
    toast.success('Imagen eliminada.')
  }

  const name = useWatch({ control, name: 'name' }) ?? ''
  const shortDesc = useWatch({ control, name: 'short_description' }) ?? ''
  const description = useWatch({ control, name: 'description' }) ?? ''
  const badge = useWatch({ control, name: 'badge' }) ?? ''
  const price = useWatch({ control, name: 'price' }) ?? 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {productId ? (
        <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Imagenes</h3>
              <p className="mt-1 text-sm text-neutral-400">
                La primera imagen funciona como portada en la tienda y en el carrito.
              </p>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              <span className="inline-flex h-10 items-center rounded-full bg-emerald-400 px-4 text-sm font-medium text-black transition hover:bg-emerald-300">
                <Upload className="mr-2 size-4" />
                {isUploading ? 'Subiendo...' : 'Agregar imagen'}
              </span>
            </label>
          </div>

          {imageError ? <FormFeedback kind="error" message={imageError} className="mb-4" /> : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-[22px] border border-white/8 bg-white/5"
              >
                <Image src={image.url} alt={`Imagen ${index + 1}`} fill className="object-cover" />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3">
                  {index === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-amber-200">
                      <Star className="mr-1 size-3" />
                      Portada
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="rounded-full bg-black/60 p-2 text-white transition hover:bg-red-500/80"
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            {images.length === 0 ? (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/3 p-4 text-center text-sm text-neutral-500">
                Sin imagenes todavia
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
        <FieldRow label="Nombre del producto" current={name.length} max={CONTENT_LIMITS.product_name}>
          <Input
            {...register('name')}
            placeholder="Ej: Remera oversized negra"
            aria-invalid={!!errors.name}
            maxLength={CONTENT_LIMITS.product_name}
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
          {errors.name ? <p className="mt-1.5 text-xs text-red-300">{errors.name.message}</p> : null}
        </FieldRow>

        <Separator className="my-6 bg-white/8" />

        <FieldRow
          label="Descripcion corta"
          hint="Aparece en la card del catalogo."
          current={shortDesc.length}
          max={CONTENT_LIMITS.product_short_description}
        >
          <Input
            {...register('short_description')}
            placeholder="Ej: Tela premium, corte amplio y stock limitado"
            aria-invalid={!!errors.short_description}
            maxLength={CONTENT_LIMITS.product_short_description}
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
          {errors.short_description ? (
            <p className="mt-1.5 text-xs text-red-300">{errors.short_description.message}</p>
          ) : null}
        </FieldRow>

        <Separator className="my-6 bg-white/8" />

        <FieldRow
          label="Descripcion completa"
          hint="Se muestra en el detalle del producto."
          current={description.length}
          max={CONTENT_LIMITS.product_description}
        >
          <Textarea
            {...register('description')}
            placeholder="Cuenta materiales, variantes, medidas o cualquier detalle relevante."
            aria-invalid={!!errors.description}
            maxLength={CONTENT_LIMITS.product_description}
            className="min-h-32 rounded-[24px] border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
          />
          {errors.description ? (
            <p className="mt-1.5 text-xs text-red-300">{errors.description.message}</p>
          ) : null}
        </FieldRow>
      </section>

      <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Precio *</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">$</span>
              <Input
                {...register('price', { valueAsNumber: true })}
                type="number"
                min={0}
                step={0.01}
                aria-invalid={!!errors.price}
                className="h-11 rounded-2xl border-white/10 bg-white/5 pl-8 text-white"
              />
            </div>
            {errors.price ? (
              <p className="mt-1.5 text-xs text-red-300">{errors.price.message}</p>
            ) : price > 0 ? (
              <p className="mt-1.5 text-xs text-neutral-500">{formatCurrency(price)}</p>
            ) : null}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Precio tachado</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">$</span>
              <Input
                {...register('compare_price', {
                  valueAsNumber: true,
                  setValueAs: (value) => (value === '' || Number.isNaN(value) ? null : Number(value)),
                })}
                type="number"
                min={0}
                step={0.01}
                className="h-11 rounded-2xl border-white/10 bg-white/5 pl-8 text-white"
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">Opcional. Sirve para mostrar descuento o referencia.</p>
          </div>
        </div>

        <Separator className="my-6 bg-white/8" />

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label className="text-sm font-medium text-neutral-200">Badge</Label>
              <CharCounter current={badge.length} max={CONTENT_LIMITS.badge} />
            </div>
            <Input
              {...register('badge')}
              placeholder="Nuevo, -20%, Agotado"
              maxLength={CONTENT_LIMITS.badge}
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
            />
            {badge ? (
              <div className="mt-3">
                <Badge className="border-0 bg-white/10 px-3 py-1 text-xs text-neutral-100">{badge}</Badge>
              </div>
            ) : null}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Categoria</Label>
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                >
                  <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Sin categoria" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-neutral-900 text-white">
                    <SelectItem value="none">Sin categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-neutral-200">Orden</Label>
            <Input
              {...register('sort_order', { valueAsNumber: true })}
              type="number"
              min={0}
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white"
            />
            <p className="mt-1.5 text-xs text-neutral-500">Menor numero = aparece primero.</p>
          </div>
        </div>
      </section>

      <section className="surface-panel premium-ring rounded-[28px] px-5 py-6 sm:px-6">
        <div className="space-y-3">
          {[
            {
              name: 'is_active' as const,
              label: 'Activo',
              description: 'Visible en la tienda publica.',
            },
            {
              name: 'is_featured' as const,
              label: 'Destacado',
              description: 'Se muestra en la seccion destacada.',
            },
          ].map((toggle) => (
            <div
              key={toggle.name}
              className="rounded-[22px] border border-white/8 bg-white/4 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{toggle.label}</p>
                  <p className="mt-1 text-xs text-neutral-400">{toggle.description}</p>
                </div>
                <Controller
                  control={control}
                  name={toggle.name}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-400"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {submitError ? <FormFeedback kind="error" message={submitError} /> : null}

      <div className="flex justify-end">
        <SaveButton
          isLoading={isSubmitting}
          isSaved={saved}
          label={productId ? 'Guardar cambios' : 'Crear producto'}
        />
      </div>
    </form>
  )
}

function FieldRow({
  label,
  hint,
  current,
  max,
  children,
}: {
  label: string
  hint?: string
  current: number
  max: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label className="text-sm font-medium text-neutral-200">{label}</Label>
        <CharCounter current={current} max={max} />
      </div>
      {hint ? <p className="mb-3 text-xs text-neutral-500">{hint}</p> : null}
      {children}
    </div>
  )
}
