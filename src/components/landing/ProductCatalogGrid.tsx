'use client'

import { useEffect, useState } from 'react'
import { Grid2X2, Rows3 } from 'lucide-react'
import { CatalogProductCard } from '@/components/product/CatalogProductCard'
import { cn } from '@/lib/utils'
import type { ProductWithImages, StoreTheme } from '@/types/store'
import styles from './ProductCatalogGrid.module.css'

type CatalogView = 'grid' | 'large'

type CatalogItem = {
  product: ProductWithImages
  href: string
}

type Props = {
  items: CatalogItem[]
  theme: StoreTheme
  desktopColumns: number
}

const STORAGE_KEY = 'volta:catalog-view-v1'

export function ProductCatalogGrid({ items, theme, desktopColumns }: Props) {
  const [view, setView] = useState<CatalogView>('grid')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'large' || saved === 'grid') setView(saved)
  }, [])

  function choose(next: CatalogView) {
    setView(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const safeColumns = Math.min(4, Math.max(2, desktopColumns || 2))
  const largeColumns = Math.min(3, safeColumns)

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-2 sm:mb-4">
        <span className="mr-1 hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline" style={{ color: 'var(--store-muted-text)' }}>
          Vista
        </span>
        <ViewButton active={view === 'grid'} onClick={() => choose('grid')} label="Ver más">
          <Grid2X2 className="size-4" />
        </ViewButton>
        <ViewButton active={view === 'large'} onClick={() => choose('large')} label="Ver grande">
          <Rows3 className="size-4" />
        </ViewButton>
      </div>

      <div
        className={view === 'grid' ? styles.grid : styles.large}
        style={{
          ['--catalog-columns' as string]: String(safeColumns),
          ['--catalog-large-columns' as string]: String(largeColumns),
        }}
      >
        {items.map(({ product, href }) => (
          <CatalogProductCard key={product.id} product={product} productHref={href} theme={theme} />
        ))}
      </div>
    </div>
  )
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition active:scale-[0.97]',
      )}
      style={active
        ? {
            background: 'var(--store-primary)',
            color: 'var(--store-primary-contrast)',
            borderColor: 'var(--store-primary)',
          }
        : {
            background: 'color-mix(in srgb, var(--store-surface) 88%, transparent)',
            color: 'var(--store-soft-text)',
            borderColor: 'var(--store-card-border)',
          }}
    >
      {children}
      <span className="hidden min-[380px]:inline">{label}</span>
    </button>
  )
}
