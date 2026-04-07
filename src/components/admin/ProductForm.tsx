'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { FormFeedback } from '@/components/common/FormFeedback'
import { SaveButton } from '@/components/common/SaveButton'
import { ProductOptionsEditor } from '@/components/admin/ProductOptionsEditor'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CONTENT_LIMITS } from '@/data/defaults'
import { COPY } from '@/data/system-copy'
import {
  createProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from '@/lib/actions/products'
import { replaceProductOptions } from '@/lib/actions/product-options'
import {
  productOptionsToDraft,
  validateDraftProductOptions,
  type DraftProductOption,
} from '@/lib/products/options'
import { formatCurrency } from '@/lib/utils/format'
import { productSchema, type ProductInput } from '@/lib/validations/product'
import type { Category, ProductImage, ProductWithImages } from '@/types/store'

type ProductFormProps = {
  product?: ProductWithImages
  categories: Category[]
  productId?: string
}

const MIN_PRODUCT_IMAGE_WIDTH = 800

export function ProductForm({ product, categories, productId }: ProductFormProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [images, setImages] = useState(product?.images ?? [])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [localCoverUrl, setLocalCoverUrl] = useState<string | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(
    product?.images?.[0]?.url ?? null,
  )
  const [hasOptions, setHasOptions] = useState((product?.options.length ?? 0) > 0)
  const [draftOptions, setDraftOptions] = useState<DraftProductOption[]>(
    productOptionsToDraft(product?.options ?? []),
  )
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    Boolean(
      product?.short_description ||
        product?.description ||
        product?.compare_price ||
        product?.badge ||
        (product?.sort_order ?? 0) > 0 ||
        product?.is_featured ||
        product?.is_active === false,
    ),
  )

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

  useEffect(() => {
    return () => {
      if (localCoverUrl) {
        URL.revokeObjectURL(localCoverUrl)
      }
    }
  }, [localCoverUrl])

  const name = useWatch({ control, name: 'name' }) ?? ''
  const price = useWatch({ control, name: 'price' }) ?? 0
  const shortDescription = useWatch({ control, name: 'short_description' }) ?? ''
  const description = useWatch({ control, name: 'description' }) ?? ''
  const badge = useWatch({ control, name: 'badge' }) ?? ''
  const comparePrice = useWatch({ control, name: 'compare_price' }) ?? null
  const sortOrder = useWatch({ control, name: 'sort_order' }) ?? 0
  const isActive = useWatch({ control, name: 'is_active' }) ?? true
  const isFeatured = useWatch({ control, name: 'is_featured' }) ?? false
  const categoryId = useWatch({ control, name: 'category_id' }) ?? null

  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null
  const coverUrl = coverPreviewUrl ?? images[0]?.url ?? null
  const advancedCount = [
    shortDescription.trim().length > 0,
    description.trim().length > 0,
    typeof comparePrice === 'number' && comparePrice > 0,
    badge.trim().length > 0,
    sortOrder > 0,
    isFeatured,
    !isActive,
  ].filter(Boolean).length

  function setLocalCoverPreview(nextFile: File | null) {
    if (localCoverUrl) {
      URL.revokeObjectURL(localCoverUrl)
      setLocalCoverUrl(null)
    }

    if (!nextFile) {
      setCoverFile(null)
      setCoverPreviewUrl(product?.images?.[0]?.url ?? images[0]?.url ?? null)
      return
    }

    const nextUrl = URL.createObjectURL(nextFile)
    setLocalCoverUrl(nextUrl)
    setCoverFile(nextFile)
    setCoverPreviewUrl(nextUrl)
  }

  async function validateImage(file: File) {
    if (!file.type.startsWith('image/')) return 'Solo se aceptan imagenes JPG, PNG o WebP.'
    if (file.size > 10 * 1024 * 1024) return 'La imagen no puede superar los 10 MB.'

    return new Promise<string | null>((resolve) => {
      const image = document.createElement('img')
      image.onload = () => {
        URL.revokeObjectURL(image.src)
        if (image.naturalWidth < MIN_PRODUCT_IMAGE_WIDTH) {
          resolve(`La imagen debe tener al menos ${MIN_PRODUCT_IMAGE_WIDTH}px de ancho.`)
          return
        }
        resolve(null)
      }
      image.src = URL.createObjectURL(file)
    })
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = await validateImage(file)
    if (validationError) {
      setImageError(validationError)
      toast.error(validationError)
      event.target.value = ''
      return
    }

    setImageError(null)
    setLocalCoverPreview(file)
    event.target.value = ''
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!productId) return

    const file = event.target.files?.[0]
    if (!file) return

    const validationError = await validateImage(file)
    if (validationError) {
      setImageError(validationError)
      toast.error(validationError)
      event.target.value = ''
      return
    }

    setImageError(null)
    setIsUploadingGallery(true)

    const formData = new FormData()
    formData.append('image', file)
    const result = await uploadProductImage(productId, formData)

    if (result?.error) {
      setImageError(String(result.error))
      toast.error(String(result.error))
    } else if (result?.image) {
      const image = result.image as { id: string; url: string; sort_order?: number }
      setImages((current) => [
        ...current,
        createLocalImageRecord(productId, image.id, image.url, image.sort_order ?? current.length),
      ])
      toast.success('Imagen agregada.')
    }

    setIsUploadingGallery(false)
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

    setImages((current) => current.filter((image) => image.id !== imageId))
    toast.success('Imagen eliminada.')
  }

  async function saveCoverImage(targetProductId: string) {
    if (!coverFile) return { success: true as const }

    const formData = new FormData()
    formData.append('image', coverFile)
    formData.append('makePrimary', 'true')

    const result = await uploadProductImage(targetProductId, formData)

    if (result?.error) {
      return { success: false as const, message: String(result.error) }
    }

    if (result?.image) {
      const image = result.image as { id: string; url: string; sort_order?: number }

      if (localCoverUrl) {
        URL.revokeObjectURL(localCoverUrl)
        setLocalCoverUrl(null)
      }

      setImages((current) => [
        createLocalImageRecord(targetProductId, image.id, image.url, image.sort_order ?? 0),
        ...current.map((currentImage, index) => ({
          ...currentImage,
          sort_order: index + 1,
        })),
      ])
      setCoverFile(null)
      setCoverPreviewUrl(image.url)
    }

    return { success: true as const }
  }

  async function saveProductOptions(targetProductId: string, shouldSaveOptions: boolean) {
    if (!shouldSaveOptions) {
      if (!productId || (product?.options.length ?? 0) === 0) {
        return { success: true as const }
      }

      const clearResult = await replaceProductOptions(targetProductId, [])
      if (clearResult?.error) {
        return { success: false as const, message: getActionError(clearResult.error) }
      }

      return { success: true as const }
    }

    const validation = validateDraftProductOptions(draftOptions)
    if (!validation.valid) {
      return { success: false as const, message: validation.message }
    }

    const optionsPayload = draftOptions.map((option, index) => ({
      name: option.name.trim(),
      values: option.values,
      sort_order: index,
    }))

    const optionsResult = await replaceProductOptions(targetProductId, optionsPayload)
    if (optionsResult?.error) {
      return { success: false as const, message: getActionError(optionsResult.error) }
    }

    return { success: true as const }
  }

  async function onSubmit(data: ProductInput) {
    setSubmitError(null)
    setImageError(null)

    if (hasOptions) {
      const optionsValidation = validateDraftProductOptions(draftOptions)
      if (!optionsValidation.valid) {
        setSubmitError(optionsValidation.message)
        toast.error(optionsValidation.message)
        return
      }
    }

    if (productId) {
      const result = await updateProduct(productId, data)

      if (result?.error) {
        const message = result.error.formErrors?.[0] ?? COPY.admin.loadError
        setSubmitError(message)
        toast.error(message)
        return
      }

      const followUpErrors: string[] = []
      const coverResult = await saveCoverImage(productId)
      if (!coverResult.success) followUpErrors.push(coverResult.message)

      const optionsResult = await saveProductOptions(productId, hasOptions)
      if (!optionsResult.success) followUpErrors.push(optionsResult.message)

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)

      if (followUpErrors.length > 0) {
        const message = `Producto guardado, pero hay detalles por revisar: ${followUpErrors.join(' ')}`
        setSubmitError(message)
        toast.warning(message)
        return
      }

      toast.success('Producto guardado.')
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
      const followUpErrors: string[] = []

      const coverResult = await saveCoverImage(result.productId)
      if (!coverResult.success) followUpErrors.push(coverResult.message)

      const optionsResult = await saveProductOptions(result.productId, hasOptions)
      if (!optionsResult.success) followUpErrors.push(optionsResult.message)

      if (followUpErrors.length > 0) {
        toast.warning(
          `Producto creado, pero hay detalles por revisar: ${followUpErrors.join(' ')}`,
        )
      } else {
        toast.success('Producto creado y listo para seguir editando.')
      }

      router.push(`/admin/productos/${result.productId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="admin-surface rounded-xl p-5 sm:p-6">
        <div className="mb-6">
          <p className="admin-label">Modo basico</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            {productId ? 'Lo esencial del producto' : 'Carga rapida del producto'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Nombre, precio, portada y categoria. Lo demas queda guardado para cuando haga falta.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="admin-surface-muted rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Imagen principal</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    La portada se usa en el catalogo, el modal y el carrito.
                  </p>
                </div>
                {coverUrl ? (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                    Portada
                  </span>
                ) : null}
              </div>

              {coverUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/10">
                  <div className="relative aspect-[4/5] w-full">
                    <Image src={coverUrl} alt="Portada del producto" fill className="object-cover" />
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center transition hover:border-emerald-400/30 hover:bg-white/[0.05]">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <ImagePlus className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Subir portada</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      JPG, PNG o WebP. Minimo {MIN_PRODUCT_IMAGE_WIDTH}px de ancho.
                    </p>
                  </div>
                </label>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10">
                    <Upload className="size-4" />
                    {coverUrl ? 'Cambiar portada' : 'Elegir imagen'}
                  </span>
                </label>

                {coverUrl ? (
                  <button
                    type="button"
                    onClick={() => setLocalCoverPreview(null)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                  >
                    Quitar seleccion
                  </button>
                ) : null}
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {productId
                  ? coverFile
                    ? 'Se guardara como nueva portada cuando confirmes los cambios.'
                    : 'Puedes dejarla asi o cambiar la portada desde aqui.'
                  : 'Puedes crear el producto con la portada lista en un solo guardado.'}
              </p>
            </div>

            <div className="admin-surface-muted rounded-xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Vista rapida
              </p>
              <p className="mt-3 text-base font-semibold text-foreground">
                {name.trim() || 'Nombre del producto'}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-400">
                {price > 0 ? formatCurrency(price) : 'Define un precio'}
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {selectedCategory
                  ? `Categoria: ${selectedCategory.name}`
                  : categories.length > 0
                    ? 'Categoria opcional. Puedes usarla para ordenar mejor el catalogo.'
                    : 'Puedes publicar sin categoria y organizarlo despues si quieres.'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <FieldBlock label="Nombre del producto" hint="Lo primero que va a leer el cliente.">
              <Input
                {...register('name')}
                placeholder="Ej: Remera oversized negra"
                aria-invalid={!!errors.name}
                maxLength={CONTENT_LIMITS.product_name}
                className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
              />
              <FieldMeta current={name.length} max={CONTENT_LIMITS.product_name} />
              {errors.name ? <FieldError message={errors.name.message} /> : null}
            </FieldBlock>

            <div className="grid gap-5 md:grid-cols-2">
              <FieldBlock label="Precio" hint="Es el valor principal que se muestra en la tienda.">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">$</span>
                  <Input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step={0.01}
                    aria-invalid={!!errors.price}
                    className="h-12 rounded-md border-white/10 bg-white/5 pl-8 text-white"
                  />
                </div>
                {errors.price ? (
                  <FieldError message={errors.price.message} />
                ) : price > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">{formatCurrency(price)}</p>
                ) : null}
              </FieldBlock>

              {categories.length > 0 ? (
                <FieldBlock label="Categoria" hint="Opcional, pero ayuda a ordenar el catalogo.">
                  <Controller
                    control={control}
                    name="category_id"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? 'none'}
                        onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                      >
                        <SelectTrigger className="h-12 rounded-md border-white/10 bg-white/5 text-white">
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
                </FieldBlock>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="admin-surface rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="admin-label">Opciones</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Variantes en el mismo flujo
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Activalo solo si el cliente tiene que elegir algo antes de agregar el producto.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setHasOptions((current) => !current)}
            className="admin-surface-muted inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-foreground"
          >
            <span
              className={
                hasOptions
                  ? 'rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-400'
                  : 'rounded-full bg-white/8 px-2.5 py-1 text-muted-foreground'
              }
            >
              {hasOptions ? 'Activo' : 'Simple'}
            </span>
            {hasOptions ? 'Este producto tiene opciones' : 'Activar opciones'}
          </button>
        </div>

        <div className="mt-5">
          {hasOptions ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-emerald-100">
                Prepara talle, color, medida o cualquier atributo ahora. Todo se guarda junto con el producto.
              </div>

              <ProductOptionsEditor
                value={draftOptions}
                onChange={setDraftOptions}
                disabled={isSubmitting}
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Si desactivas esta seccion y guardas, el producto vuelve a quedar sin opciones.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-5">
              <p className="text-sm font-medium text-foreground">Producto simple</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                El cliente podra agregarlo directo al carrito, sin elegir variantes.
              </p>
            </div>
          )}
        </div>
      </section>

      {productId ? (
        <section className="admin-surface rounded-xl p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="admin-label">Galeria</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">Imagenes del producto</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Suma fotos extra o refresca la portada sin salir de la ficha.
              </p>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryUpload}
                className="hidden"
                disabled={isUploadingGallery}
              />
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-emerald-300">
                <Plus className="size-4" />
                {isUploadingGallery ? 'Subiendo...' : 'Agregar imagen'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/8 bg-white/5"
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
                    className="rounded-full bg-black/60 p-2 text-neutral-50 transition hover:bg-red-500/80"
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            {images.length === 0 ? (
              <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-center text-sm text-neutral-500">
                Sin imagenes todavia
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="admin-surface rounded-xl p-5 sm:p-6">
        <button
          type="button"
          onClick={() => setAdvancedOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="admin-label">Opciones avanzadas</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Detalles extra del producto
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Descripcion, precio tachado, badge, orden y visibilidad. Nada de esto compite con lo principal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {advancedCount > 0 ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                {advancedCount} configurado{advancedCount === 1 ? '' : 's'}
              </span>
            ) : null}
            {advancedOpen ? (
              <ChevronUp className="size-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {advancedOpen ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <FieldBlock
                label="Descripcion corta"
                hint="Sirve para resumir el producto en la card."
              >
                <Input
                  {...register('short_description')}
                  placeholder="Ej: Tela premium, corte amplio y stock limitado"
                  aria-invalid={!!errors.short_description}
                  maxLength={CONTENT_LIMITS.product_short_description}
                  className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                />
                <FieldMeta
                  current={shortDescription.length}
                  max={CONTENT_LIMITS.product_short_description}
                />
                {errors.short_description ? (
                  <FieldError message={errors.short_description.message} />
                ) : null}
              </FieldBlock>

              <FieldBlock
                label="Precio tachado"
                hint="Opcional. Ayuda a mostrar referencia o descuento."
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">$</span>
                  <Input
                    {...register('compare_price', {
                      valueAsNumber: true,
                      setValueAs: (value) =>
                        value === '' || Number.isNaN(value) ? null : Number(value),
                    })}
                    type="number"
                    min={0}
                    step={0.01}
                    className="h-12 rounded-md border-white/10 bg-white/5 pl-8 text-white"
                  />
                </div>
              </FieldBlock>
            </div>
            <FieldBlock
              label="Descripcion completa"
              hint="Se muestra en el detalle del producto."
            >
              <Textarea
                {...register('description')}
                placeholder="Cuenta materiales, medidas, terminaciones o cualquier detalle que ayude a vender mejor."
                aria-invalid={!!errors.description}
                maxLength={CONTENT_LIMITS.product_description}
                className="min-h-32 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
              />
              <FieldMeta current={description.length} max={CONTENT_LIMITS.product_description} />
              {errors.description ? <FieldError message={errors.description.message} /> : null}
            </FieldBlock>

            <div className="grid gap-6 lg:grid-cols-3">
              <FieldBlock label="Badge" hint="Etiqueta corta para destacar algo puntual.">
                <Input
                  {...register('badge')}
                  placeholder="Nuevo, -20%, Preventa"
                  maxLength={CONTENT_LIMITS.badge}
                  className="h-12 rounded-md border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                />
                <FieldMeta current={badge.length} max={CONTENT_LIMITS.badge} />
                {badge ? (
                  <div className="mt-3">
                    <Badge className="border-0 bg-white/10 px-3 py-1 text-xs text-neutral-100">
                      {badge}
                    </Badge>
                  </div>
                ) : null}
              </FieldBlock>

              <FieldBlock label="Orden" hint="Menor numero = aparece antes.">
                <Input
                  {...register('sort_order', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className="h-12 rounded-md border-white/10 bg-white/5 text-white"
                />
              </FieldBlock>

              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-foreground">Estado del producto</p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      name: 'is_active' as const,
                      label: 'Visible en tienda',
                      description: 'Controla si el producto aparece en la tienda publica.',
                    },
                    {
                      name: 'is_featured' as const,
                      label: 'Marcar como destacado',
                      description: 'Se muestra en la seccion destacada.',
                    },
                  ].map((toggle) => (
                    <div
                      key={toggle.name}
                      className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {toggle.description}
                          </p>
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
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {imageError ? <FormFeedback kind="error" message={imageError} /> : null}
      {submitError ? <FormFeedback kind="error" message={submitError} /> : null}

      <section className="admin-surface rounded-xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {productId ? 'Todo se guarda junto' : 'Creacion simple en un solo paso'}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {productId
                  ? 'Ficha, portada y opciones se actualizan desde este mismo boton.'
                  : 'El producto se crea con nombre, precio, portada y opciones si las preparaste.'}
              </p>
            </div>
          </div>

          <SaveButton
            isLoading={isSubmitting}
            isSaved={saved}
            label={productId ? 'Guardar producto' : 'Crear producto'}
            loadingLabel={productId ? 'Guardando producto...' : 'Creando producto...'}
            savedLabel="Guardado"
          />
        </div>
      </section>
    </form>
  )
}

function createLocalImageRecord(
  productId: string,
  imageId: string,
  url: string,
  sortOrder: number,
): ProductImage {
  return {
    id: imageId,
    product_id: productId,
    url,
    alt: null,
    sort_order: sortOrder,
    created_at: new Date().toISOString(),
  }
}

function getActionError(error: unknown) {
  if (typeof error === 'string') return error

  if (
    typeof error === 'object' &&
    error !== null &&
    'formErrors' in error &&
    Array.isArray((error as { formErrors?: string[] }).formErrors)
  ) {
    return (error as { formErrors?: string[] }).formErrors?.[0] ?? COPY.admin.loadError
  }

  return COPY.admin.loadError
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-neutral-200">{label}</Label>
      {hint ? <p className="mt-1.5 text-xs leading-5 text-neutral-500">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  )
}

function FieldMeta({ current, max }: { current: number; max: number }) {
  return (
    <p className="mt-2 text-xs text-muted-foreground">
      {current}/{max}
    </p>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="mt-2 text-xs text-red-300">{message}</p>
}
