'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Edit3, GripVertical, Plus, Tags, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  createBrand,
  deleteBrand,
  reorderBrands,
  setBrandActive,
  updateBrand,
} from '@/lib/actions/brands'
import type { Brand } from '@/types/store'

export function BrandsList({ brands: initialBrands }: { brands: Brand[] }) {
  const router = useRouter()
  const [brands, setBrands] = useState(initialBrands)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const createLock = useRef(false)

  async function handleCreate() {
    const name = newName.trim()
    if (!name || createLock.current) return
    createLock.current = true
    try {
      const result = await createBrand({ name })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      if (result?.brand) setBrands((current) => [...current, result.brand])
      setNewName('')
      setShowNew(false)
      toast.success('Marca creada.')
      router.refresh()
    } finally {
      createLock.current = false
    }
  }

  async function handleUpdate(brand: Brand) {
    const name = editingName.trim()
    if (!name) return
    const result = await updateBrand(brand.id, { name })
    if (result?.error) {
      toast.error(result.error)
      return
    }
    setBrands((current) => current.map((item) => item.id === brand.id ? { ...item, name, slug: result.slug ?? item.slug } : item))
    setEditingId(null)
    setEditingName('')
    toast.success('Marca actualizada.')
    router.refresh()
  }

  function toggleBrand(brand: Brand, checked: boolean) {
    const previous = brand.is_active
    setBrands((current) => current.map((item) => item.id === brand.id ? { ...item, is_active: checked } : item))
    startTransition(async () => {
      const result = await setBrandActive(brand.id, checked)
      if (result?.error) {
        setBrands((current) => current.map((item) => item.id === brand.id ? { ...item, is_active: previous } : item))
        toast.error(result.error)
        return
      }
      toast.success(checked ? 'Marca visible.' : 'Marca oculta.')
      router.refresh()
    })
  }

  async function handleDelete() {
    if (!brandToDelete || deleting) return
    setDeleting(true)
    try {
      const result = await deleteBrand(brandToDelete.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setBrands((current) => current.filter((item) => item.id !== brandToDelete.id))
      setBrandToDelete(null)
      toast.success('Marca eliminada. Los productos quedaron sin marca.')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  function moveBrand(sourceId: string, targetId: string) {
    if (!sourceId || sourceId === targetId || pending) return
    const previous = brands
    const sourceIndex = brands.findIndex((item) => item.id === sourceId)
    const targetIndex = brands.findIndex((item) => item.id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return

    const next = [...brands]
    const [moved] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, moved)
    const ordered = next.map((item, index) => ({ ...item, sort_order: index }))
    setBrands(ordered)

    startTransition(async () => {
      const result = await reorderBrands(ordered.map((item) => item.id))
      if (result?.error) {
        setBrands(previous)
        toast.error(result.error)
        return
      }
      toast.success('Orden de marcas guardado.')
      router.refresh()
    })
  }

  if (brands.length === 0 && !showNew) {
    return (
      <EmptyState
        icon={Tags}
        title="Todavía no hay marcas"
        description="Son opcionales. Usalas cuando ayuden a encontrar productos más rápido."
        action={<Button type="button" onClick={() => setShowNew(true)} className="rounded-[9px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]"><Plus className="size-4" />Nueva marca</Button>}
      />
    )
  }

  return (
    <>
      <div className="space-y-2">
        {brands.map((brand) => (
          <div
            key={brand.id}
            draggable={!pending && editingId !== brand.id}
            onDragStart={() => setDraggedId(brand.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (draggedId) moveBrand(draggedId, brand.id)
              setDraggedId(null)
            }}
            className={`rounded-[10px] border p-2.5 transition ${draggedId === brand.id ? 'border-[#12e89a]/40 bg-[#12e89a]/5 opacity-75' : 'border-black/7 bg-[#fbfcfd] dark:border-white/8 dark:bg-white/[0.025]'}`}
          >
            {editingId === brand.id ? (
              <form onSubmit={(event) => { event.preventDefault(); void handleUpdate(brand) }} className="space-y-2">
                <Input value={editingName} onChange={(event) => setEditingName(event.target.value.slice(0, 80))} autoFocus className="h-9 rounded-[8px] bg-white dark:bg-white/5" />
                <div className="flex gap-1.5">
                  <Button type="submit" size="sm" className="h-8 rounded-[8px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]"><Check className="size-3.5" />Guardar</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 rounded-[8px]"><X className="size-3.5" />Cancelar</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2.5">
                <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/45" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{brand.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">/{brand.slug}</p>
                </div>
                <Switch checked={brand.is_active} disabled={pending} onCheckedChange={(checked) => toggleBrand(brand, checked)} aria-label={`Mostrar ${brand.name}`} className="data-[state=checked]:bg-[#12e89a]" />
                <button type="button" onClick={() => { setEditingId(brand.id); setEditingName(brand.name) }} className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5" aria-label={`Editar ${brand.name}`}><Edit3 className="size-3.5" /></button>
                <button type="button" onClick={() => setBrandToDelete(brand)} className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10" aria-label={`Eliminar ${brand.name}`}><Trash2 className="size-3.5" /></button>
              </div>
            )}
          </div>
        ))}

        {showNew ? (
          <form onSubmit={(event) => { event.preventDefault(); void handleCreate() }} className="rounded-[10px] border border-[#12e89a]/30 bg-[#12e89a]/5 p-2.5">
            <Input value={newName} onChange={(event) => setNewName(event.target.value.slice(0, 80))} autoFocus placeholder="Nombre de la marca" className="h-9 rounded-[8px] bg-white" />
            <div className="mt-2 flex gap-1.5">
              <Button type="submit" size="sm" disabled={!newName.trim()} className="h-8 rounded-[8px] bg-[#12e89a] text-[#062117] hover:bg-[#0fd98f]"><Check className="size-3.5" />Crear</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowNew(false); setNewName('') }} className="h-8 rounded-[8px]"><X className="size-3.5" />Cancelar</Button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setShowNew(true)} className="flex h-9 w-full items-center justify-center gap-2 rounded-[9px] border border-dashed border-black/10 text-xs font-medium text-muted-foreground transition hover:border-black/20 hover:text-foreground dark:border-white/10"><Plus className="size-3.5" />Nueva marca</button>
        )}
      </div>

      <ConfirmationDialog
        open={!!brandToDelete}
        onOpenChange={(open) => { if (!open && !deleting) setBrandToDelete(null) }}
        title={brandToDelete ? `Eliminar “${brandToDelete.name}”?` : 'Eliminar marca'}
        description="Los productos no se eliminan. Quedarán sin marca hasta que les asignes otra."
        confirmLabel="Eliminar marca"
        onConfirm={handleDelete}
        isPending={deleting}
      />
    </>
  )
}
