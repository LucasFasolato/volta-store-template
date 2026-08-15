'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Edit3, FolderTree, GripVertical, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { categorySchema, type CategoryInput } from '@/lib/validations/product'
import { createCategory, deleteCategory, updateCategory } from '@/lib/actions/products'
import { CONTENT_LIMITS } from '@/data/defaults'
import type { Category } from '@/types/store'

export function CategoriasList({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const createLockRef = useRef(false)
  const updateLockRef = useRef<string | null>(null)
  const deleteLockRef = useRef(false)

  const newForm = useForm<CategoryInput>({ resolver: zodResolver(categorySchema), defaultValues: { name: '', sort_order: categories.length } })
  const editForm = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) })

  async function handleCreate(data: CategoryInput) {
    if (createLockRef.current) return

    const normalized = data.name.trim().toLocaleLowerCase('es')
    if (categories.some((category) => category.name.trim().toLocaleLowerCase('es') === normalized)) {
      toast.error('Ya existe una categoría con ese nombre.')
      return
    }

    createLockRef.current = true
    try {
      const result = await createCategory(data)
      if (result?.error) {
        toast.error(result.error.formErrors?.[0] ?? 'No pudimos crear la categoría.')
        return
      }
      if (result?.category) setCategories((current) => [...current, result.category as Category])
      setShowNew(false)
      newForm.reset({ name: '', sort_order: categories.length + 1 })
      toast.success('Categoría creada.')
    } finally {
      createLockRef.current = false
    }
  }

  async function handleUpdate(id: string, data: CategoryInput) {
    if (updateLockRef.current) return

    const normalized = data.name.trim().toLocaleLowerCase('es')
    if (categories.some((category) => category.id !== id && category.name.trim().toLocaleLowerCase('es') === normalized)) {
      toast.error('Ya existe una categoría con ese nombre.')
      return
    }

    updateLockRef.current = id
    try {
      const result = await updateCategory(id, data)
      if (result?.error) {
        toast.error(result.error.formErrors?.[0] ?? 'No pudimos actualizar la categoría.')
        return
      }
      if (result?.category) setCategories((current) => current.map((item) => item.id === id ? result.category as Category : item))
      setEditingId(null)
      toast.success('Categoría actualizada.')
    } finally {
      updateLockRef.current = null
    }
  }

  async function handleDelete() {
    if (!categoryToDelete || deleteLockRef.current) return
    deleteLockRef.current = true
    setDeletingId(categoryToDelete.id)
    try {
      const result = await deleteCategory(categoryToDelete.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setCategories((current) => current.filter((item) => item.id !== categoryToDelete.id))
      setCategoryToDelete(null)
      toast.success('Categoría eliminada.')
    } finally {
      setDeletingId(null)
      deleteLockRef.current = false
    }
  }

  function startEdit(category: Category) {
    if (updateLockRef.current) return
    editForm.reset({ name: category.name, sort_order: category.sort_order })
    setEditingId(category.id)
  }

  if (categories.length === 0 && !showNew) {
    return (
      <EmptyState
        icon={FolderTree}
        title="Todavía no hay categorías"
        description="Son opcionales. Agregalas cuando ayuden a ordenar el catálogo."
        action={<Button type="button" onClick={() => setShowNew(true)} className="rounded-[9px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]"><Plus className="size-4" />Nueva categoría</Button>}
      />
    )
  }

  return (
    <>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-[10px] border border-black/7 bg-[#fbfcfd] p-2.5 dark:border-white/8 dark:bg-white/[0.025]">
            {editingId === category.id ? (
              <form onSubmit={editForm.handleSubmit((data) => handleUpdate(category.id, data))} className="space-y-2">
                <Input {...editForm.register('name')} autoFocus maxLength={CONTENT_LIMITS.category_name} disabled={editForm.formState.isSubmitting} className="h-9 rounded-[8px] bg-white dark:bg-white/5" />
                {editForm.formState.errors.name ? <p className="text-xs text-red-500">{editForm.formState.errors.name.message}</p> : null}
                <div className="flex gap-1.5">
                  <Button type="submit" size="sm" disabled={editForm.formState.isSubmitting} aria-busy={editForm.formState.isSubmitting} className="h-8 rounded-[8px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]"><Check className="size-3.5" />{editForm.formState.isSubmitting ? 'Guardando…' : 'Guardar'}</Button>
                  <Button type="button" size="sm" variant="ghost" disabled={editForm.formState.isSubmitting} onClick={() => setEditingId(null)} className="h-8 rounded-[8px]"><X className="size-3.5" />Cancelar</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2.5">
                <GripVertical className="size-3.5 shrink-0 text-muted-foreground/45" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{category.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">/{category.slug}</p>
                </div>
                <button type="button" onClick={() => startEdit(category)} disabled={!!updateLockRef.current || !!deletingId} className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-black/5 hover:text-foreground disabled:opacity-50 dark:hover:bg-white/5" aria-label={`Editar ${category.name}`}><Edit3 className="size-3.5" /></button>
                <button type="button" onClick={() => setCategoryToDelete(category)} disabled={deletingId === category.id || deleteLockRef.current} className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-400/10" aria-label={`Eliminar ${category.name}`}><Trash2 className="size-3.5" /></button>
              </div>
            )}
          </div>
        ))}

        {showNew ? (
          <form onSubmit={newForm.handleSubmit(handleCreate)} className="rounded-[10px] border border-[#12e89a]/30 bg-[#12e89a]/5 p-2.5">
            <Input {...newForm.register('name')} autoFocus placeholder="Nombre de la categoría" maxLength={CONTENT_LIMITS.category_name} disabled={newForm.formState.isSubmitting} className="h-9 rounded-[8px] bg-white" />
            {newForm.formState.errors.name ? <p className="mt-1 text-xs text-red-500">{newForm.formState.errors.name.message}</p> : null}
            <div className="mt-2 flex gap-1.5">
              <Button type="submit" size="sm" disabled={newForm.formState.isSubmitting} aria-busy={newForm.formState.isSubmitting} className="h-8 rounded-[8px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]"><Check className="size-3.5" />{newForm.formState.isSubmitting ? 'Creando…' : 'Crear'}</Button>
              <Button type="button" size="sm" variant="ghost" disabled={newForm.formState.isSubmitting} onClick={() => { setShowNew(false); newForm.reset({ name: '', sort_order: categories.length }) }} className="h-8 rounded-[8px]"><X className="size-3.5" />Cancelar</Button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setShowNew(true)} disabled={newForm.formState.isSubmitting || createLockRef.current} className="flex h-9 w-full items-center justify-center gap-2 rounded-[9px] border border-dashed border-black/10 text-xs font-medium text-muted-foreground transition hover:border-black/20 hover:text-foreground disabled:opacity-50 dark:border-white/10"><Plus className="size-3.5" />Nueva categoría</button>
        )}
      </div>

      <ConfirmationDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => { if (!open && !deletingId) setCategoryToDelete(null) }}
        title={categoryToDelete ? `Eliminar “${categoryToDelete.name}”?` : 'Eliminar categoría'}
        description="Los productos no se eliminan, pero dejarán de pertenecer a esta categoría."
        confirmLabel="Eliminar categoría"
        onConfirm={handleDelete}
        isPending={!!categoryToDelete && deletingId === categoryToDelete.id}
      />
    </>
  )
}
