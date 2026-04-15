'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Edit, FolderTree, GripVertical, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { CharCounter } from '@/components/common/CharCounter'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { categorySchema, type CategoryInput } from '@/lib/validations/product'
import { createCategory, deleteCategory, updateCategory } from '@/lib/actions/products'
import { CONTENT_LIMITS } from '@/data/defaults'
import type { Category } from '@/types/store'

type CategoriasListProps = {
  categories: Category[]
}

export function CategoriasList({ categories: initialCategories }: CategoriasListProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const newForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', sort_order: categories.length },
  })

  const editForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  async function handleCreate(data: CategoryInput) {
    const result = await createCategory(data)

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? 'No pudimos crear la categoria.'
      toast.error(message)
      return
    }

    if (result?.category) {
      setCategories((prev) => [...prev, result.category as Category])
    }

    setShowNew(false)
    newForm.reset({ name: '', sort_order: categories.length + 1 })
    toast.success('Categoria creada.')
  }

  async function handleUpdate(id: string, data: CategoryInput) {
    const result = await updateCategory(id, data)

    if (result?.error) {
      const message = result.error.formErrors?.[0] ?? 'No pudimos actualizar la categoria.'
      toast.error(message)
      return
    }

    if (result?.category) {
      setCategories((prev) =>
        prev.map((category) => (category.id === id ? (result.category as Category) : category)),
      )
    }
    setEditingId(null)
    toast.success('Categoria actualizada.')
  }

  async function handleDelete() {
    if (!categoryToDelete) return

    setDeletingId(categoryToDelete.id)
    const result = await deleteCategory(categoryToDelete.id)
    setDeletingId(null)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    setCategories((prev) => prev.filter((category) => category.id !== categoryToDelete.id))
    setCategoryToDelete(null)
    toast.success('Categoria eliminada.')
  }

  function startEdit(category: Category) {
    editForm.reset({ name: category.name, sort_order: category.sort_order })
    setEditingId(category.id)
  }

  const newName = useWatch({ control: newForm.control, name: 'name' }) ?? ''
  const editName = useWatch({ control: editForm.control, name: 'name' }) ?? ''

  return (
    <>
      <div className="space-y-5">
        {categories.length === 0 && !showNew ? (
          <EmptyState
            icon={FolderTree}
            title="Todavia no tienes categorias"
            description="Crea una categoria para ordenar el catalogo y ayudar a los clientes a encontrar productos mas rapido."
            action={
              <Button
                type="button"
                onClick={() => setShowNew(true)}
                className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300"
              >
                <Plus className="mr-2 size-4" />
                Crear primera categoria
              </Button>
            }
          />
        ) : null}

        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="surface-panel-soft premium-ring rounded-[24px] px-4 py-4 sm:px-5"
            >
              {editingId === category.id ? (
                <form
                  onSubmit={editForm.handleSubmit((data) => handleUpdate(category.id, data))}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-4 text-neutral-600" />
                    <div className="relative w-full sm:min-w-[18rem]">
                      <Input
                        {...editForm.register('name')}
                        autoFocus
                        maxLength={CONTENT_LIMITS.category_name}
                        className="h-10 rounded-2xl border-white/10 bg-white/5 pr-16 text-white"
                      />
                      <CharCounter
                        current={editName.length}
                        max={CONTENT_LIMITS.category_name}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300"
                    >
                      <Check className="mr-1.5 size-3.5" />
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <X className="mr-1.5 size-3.5" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-4 text-neutral-600" />
                    <div>
                      <p className="text-sm font-medium text-white">{category.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">/{category.slug}</p>
                    </div>
                  </div>

                  <div className="sm:ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(category)}
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Edit className="mr-1.5 size-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === category.id}
                      onClick={() => setCategoryToDelete(category)}
                      className="rounded-full text-neutral-400 hover:bg-red-400/10 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showNew ? (
          <form
            onSubmit={newForm.handleSubmit(handleCreate)}
            className="surface-panel premium-ring rounded-[24px] px-4 py-4 sm:px-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Input
                  {...newForm.register('name')}
                  autoFocus
                  placeholder="Nombre de la categoria"
                  maxLength={CONTENT_LIMITS.category_name}
                  className="h-10 rounded-2xl border-white/10 bg-white/5 pr-16 text-white placeholder:text-neutral-500"
                />
                <CharCounter
                  current={newName.length}
                  max={CONTENT_LIMITS.category_name}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full bg-emerald-400 text-black hover:bg-emerald-300"
                >
                  <Check className="mr-1.5 size-3.5" />
                  Crear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowNew(false)
                    newForm.reset({ name: '', sort_order: categories.length })
                  }}
                  className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <X className="mr-1.5 size-3.5" />
                  Cancelar
                </Button>
              </div>
            </div>
            {newForm.formState.errors.name ? (
              <p className="mt-2 text-xs text-red-300">{newForm.formState.errors.name.message}</p>
            ) : null}
          </form>
        ) : categories.length > 0 ? (
          <Button
            type="button"
            onClick={() => setShowNew(true)}
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Plus className="mr-2 size-4" />
            Agregar categoria
          </Button>
        ) : null}
      </div>

      <ConfirmationDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setCategoryToDelete(null)
          }
        }}
        title={categoryToDelete ? `Eliminar ${categoryToDelete.name}` : 'Eliminar categoria'}
        description="Los productos que usaban esta categoria seguiran activos, pero quedaran sin categoria en la tienda."
        confirmLabel="Eliminar categoria"
        onConfirm={handleDelete}
        isPending={!!categoryToDelete && deletingId === categoryToDelete.id}
      />
    </>
  )
}
