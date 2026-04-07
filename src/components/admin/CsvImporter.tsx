'use client'

import { useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { importProductsFromCSV } from '@/lib/actions/import'
import type { ImportResult, ImportRow } from '@/lib/actions/import'

// ── CSV parsing ─────────────────────────────────────────────────────────────

/**
 * Minimal but solid CSV parser.
 * Handles: quoted fields, commas inside quotes, empty fields, BOM, CRLF.
 * Does NOT handle newlines inside quoted fields (not needed for this use case).
 */
function parseCsv(text: string): string[][] {
  const lines = text
    .replace(/^\uFEFF/, '') // strip BOM
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  return lines
    .map((line) => {
      const fields: string[] = []
      let i = 0

      while (i < line.length) {
        if (line[i] === '"') {
          // Quoted field
          let field = ''
          i++ // skip opening quote
          while (i < line.length) {
            if (line[i] === '"' && line[i + 1] === '"') {
              field += '"'
              i += 2
            } else if (line[i] === '"') {
              i++ // skip closing quote
              break
            } else {
              field += line[i]
              i++
            }
          }
          fields.push(field)
          if (line[i] === ',') i++ // skip comma
        } else {
          // Unquoted field
          const end = line.indexOf(',', i)
          if (end === -1) {
            fields.push(line.slice(i))
            break
          }
          fields.push(line.slice(i, end))
          i = end + 1
        }
      }

      // Handle trailing comma
      if (line.endsWith(',')) fields.push('')

      return fields
    })
    .filter((row) => row.some((cell) => cell.trim() !== ''))
}

function csvToObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const headers = rows[0].map((h) => h.trim().toLowerCase())
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = (row[i] ?? '').trim()
    })
    return obj
  })
}

// ── Column mapping ──────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ['nombre', 'precio'] as const

const COLUMN_ALIASES: Record<string, string> = {
  // nombre
  name: 'nombre',
  producto: 'nombre',
  title: 'nombre',
  titulo: 'nombre',
  // precio
  price: 'precio',
  cost: 'precio',
  costo: 'precio',
  valor: 'precio',
  // descripcion_corta
  short_description: 'descripcion_corta',
  descripcion_corta: 'descripcion_corta',
  resumen: 'descripcion_corta',
  // descripcion
  description: 'descripcion',
  detalle: 'descripcion',
  // precio_comparacion
  compare_price: 'precio_comparacion',
  precio_original: 'precio_comparacion',
  precio_tachado: 'precio_comparacion',
  // badge
  etiqueta: 'badge',
  label: 'badge',
  // categoria
  category: 'categoria',
  // imagen_url
  image_url: 'imagen_url',
  imagen: 'imagen_url',
  image: 'imagen_url',
  foto: 'imagen_url',
  // slug
  url: 'slug',
}

function normalizeColumn(col: string): string {
  const lower = col.toLowerCase()
  return COLUMN_ALIASES[lower] ?? lower
}

function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  headers.forEach((h) => {
    const normalized = normalizeColumn(h)
    mapping[h] = normalized
  })
  return mapping
}

// ── CSV template ────────────────────────────────────────────────────────────

const CSV_TEMPLATE = [
  'nombre,descripcion_corta,descripcion,precio,precio_comparacion,badge,categoria,imagen_url,opcion_talle,opcion_color',
  'Remera Básica,Algodón premium,Corte regular. Disponible en varios talles.,4500,6000,Nuevo,Remeras,https://ejemplo.com/img.jpg,S/M/L/XL,Blanco/Negro',
  'Pantalón Jogger,Cómodo y liviano,,8900,,,Pantalones,,S/M/L,',
].join('\n')

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'volta-productos-plantilla.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ───────────────────────────────────────────────────────────────

type ParsedState = {
  headers: string[]
  rows: Record<string, string>[]
  columnMap: Record<string, string>
}

type ResultState = ImportResult & { done: true }

export function CsvImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<ParsedState | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ResultState | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('El archivo debe ser un CSV.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo no puede superar 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = csvToObjects(text)
      if (rows.length === 0) {
        toast.error('El archivo está vacío o no tiene el formato correcto.')
        return
      }
      if (rows.length > 500) {
        toast.error('El archivo tiene más de 500 filas. Dividilo en lotes más chicos.')
        return
      }
      const headers = Object.keys(rows[0])
      const columnMap = autoMapColumns(headers)
      setParsed({ headers, rows, columnMap })
      setFileName(file.name)
      setImportResult(null)
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function updateColumnMap(original: string, mapped: string) {
    if (!parsed) return
    setParsed((prev) => prev && { ...prev, columnMap: { ...prev.columnMap, [original]: mapped } })
  }

  function reset() {
    setParsed(null)
    setFileName(null)
    setImportResult(null)
    setShowErrors(false)
  }

  async function handleImport() {
    if (!parsed) return

    // Check required columns are mapped
    const mappedValues = Object.values(parsed.columnMap)
    const missing = REQUIRED_COLUMNS.filter((col) => !mappedValues.includes(col))
    if (missing.length > 0) {
      toast.error(`Faltan columnas requeridas: ${missing.join(', ')}`)
      return
    }

    setIsImporting(true)

    // Build ImportRow array using the column mapping
    const importRows: ImportRow[] = parsed.rows.map((row) => {
      const mapped: ImportRow = { nombre: '', precio: 0 }
      for (const [original, targetKey] of Object.entries(parsed.columnMap)) {
        if (row[original] !== undefined) {
          ;(mapped as Record<string, unknown>)[targetKey] = row[original]
        }
      }
      return mapped
    })

    const result = await importProductsFromCSV(importRows)
    setImportResult({ ...result, done: true })
    setIsImporting(false)

    if (result.created > 0) {
      toast.success(`${result.created} producto${result.created > 1 ? 's' : ''} importado${result.created > 1 ? 's' : ''}.`)
    }
    if (result.errors.length > 0) {
      toast.warning(`${result.errors.length} fila${result.errors.length > 1 ? 's' : ''} con errores.`)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (importResult) {
    return <ImportResultView result={importResult} onReset={reset} showErrors={showErrors} onToggleErrors={() => setShowErrors((v) => !v)} />
  }

  if (!parsed) {
    return (
      <div className="space-y-6">
        {/* Template download */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-white/4 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-neutral-200">Plantilla CSV</p>
            <p className="mt-0.5 text-xs text-neutral-500">Descargá la plantilla para ver el formato esperado con un ejemplo.</p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-white/20 hover:bg-white/8"
          >
            <Download className="size-4" />
            Descargar plantilla
          </button>
        </div>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-4 rounded-[28px] border-2 border-dashed px-6 py-14 text-center transition"
          style={{
            borderColor: dragOver ? 'var(--admin-accent, #34d399)' : 'rgba(255,255,255,0.1)',
            background: dragOver ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Upload className="size-7 text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-200">Subir archivo CSV</p>
            <p className="mt-1 text-sm text-neutral-500">Arrastrá el archivo aquí o hacé clic para seleccionarlo.</p>
            <p className="mt-2 text-xs text-neutral-600">CSV · máx 500 filas · máx 2 MB</p>
          </div>
        </div>

        {/* Column reference */}
        <ColumnReference />
      </div>
    )
  }

  // Preview + mapping
  const previewRows = parsed.rows.slice(0, 5)
  const mappedValues = Object.values(parsed.columnMap)
  const missingRequired = REQUIRED_COLUMNS.filter((col) => !mappedValues.includes(col))

  return (
    <div className="space-y-6">
      {/* File info */}
      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-white/4 px-5 py-3">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-neutral-200">{fileName}</p>
            <p className="text-xs text-neutral-500">{parsed.rows.length} filas detectadas</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-full p-1.5 text-neutral-500 transition hover:bg-white/8 hover:text-neutral-300"
          aria-label="Cambiar archivo"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Column mapping */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-200">Mapeo de columnas</h3>
        <p className="mb-4 text-xs text-neutral-500">
          Las columnas se mapearon automáticamente. Ajustá si el nombre de tu columna es diferente.
        </p>
        <div className="space-y-2">
          {parsed.headers.map((header) => (
            <ColumnMappingRow
              key={header}
              original={header}
              mapped={parsed.columnMap[header]}
              onChange={(v) => updateColumnMap(header, v)}
            />
          ))}
        </div>

        {missingRequired.length > 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-[16px] border border-red-500/20 bg-red-500/8 px-4 py-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">
              Faltan columnas requeridas: <strong>{missingRequired.join(', ')}</strong>.
              Mapeá al menos estas columnas para continuar.
            </p>
          </div>
        ) : null}
      </div>

      {/* Preview table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-200">
          Vista previa{' '}
          <span className="font-normal text-neutral-500">
            (primeras {Math.min(5, parsed.rows.length)} de {parsed.rows.length} filas)
          </span>
        </h3>
        <div className="overflow-x-auto rounded-[18px] border border-white/8 bg-white/3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8">
                {parsed.headers.map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-neutral-400">
                    {h}
                    {parsed.columnMap[h] && parsed.columnMap[h] !== h ? (
                      <span className="ml-1 text-emerald-500">→ {parsed.columnMap[h]}</span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  {parsed.headers.map((h) => (
                    <td key={h} className="max-w-[160px] truncate px-3 py-2 text-neutral-300">
                      {row[h] || <span className="text-neutral-600">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting || missingRequired.length > 0}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="size-4" />
          {isImporting ? `Importando ${parsed.rows.length} filas...` : `Importar ${parsed.rows.length} productos`}
        </button>
        <button type="button" onClick={reset} className="text-sm text-neutral-500 hover:text-neutral-300">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

const KNOWN_TARGETS = [
  { value: 'nombre', label: 'nombre (requerido)' },
  { value: 'precio', label: 'precio (requerido)' },
  { value: 'descripcion_corta', label: 'descripcion_corta' },
  { value: 'descripcion', label: 'descripcion' },
  { value: 'precio_comparacion', label: 'precio_comparacion' },
  { value: 'badge', label: 'badge' },
  { value: 'categoria', label: 'categoria' },
  { value: 'imagen_url', label: 'imagen_url' },
  { value: 'slug', label: 'slug' },
  { value: '(ignorar)', label: '— ignorar —' },
]

function ColumnMappingRow({
  original,
  mapped,
  onChange,
}: {
  original: string
  mapped: string
  onChange: (v: string) => void
}) {
  const isOptionColumn = original.toLowerCase().startsWith('opcion_') || original.toLowerCase().startsWith('opción_')
  const isRequired = REQUIRED_COLUMNS.includes(mapped as (typeof REQUIRED_COLUMNS)[number])
  const isRecognized = KNOWN_TARGETS.some((t) => t.value === mapped) || isOptionColumn

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-white/6 bg-white/3 px-3 py-2.5">
      <span className="w-36 shrink-0 truncate text-xs font-medium text-neutral-300">{original}</span>
      <span className="text-neutral-600">→</span>
      {isOptionColumn ? (
        <span className="flex-1 text-xs text-emerald-400">opción detectada: {original.replace(/^opci[oó]n_/i, '')}</span>
      ) : (
        <select
          value={mapped}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
        >
          <option value={mapped} disabled={isRecognized}>
            {mapped}
          </option>
          {KNOWN_TARGETS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      )}
      {isRequired ? (
        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          requerido
        </span>
      ) : null}
    </div>
  )
}

function ImportResultView({
  result,
  onReset,
  showErrors,
  onToggleErrors,
}: {
  result: ResultState
  onReset: () => void
  showErrors: boolean
  onToggleErrors: () => void
}) {
  const hasErrors = result.errors.length > 0

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="size-5 text-emerald-400" />}
          label="Creados"
          value={result.created}
          color="emerald"
        />
        <StatCard
          icon={<AlertCircle className="size-5 text-amber-400" />}
          label="Con errores"
          value={result.skipped}
          color="amber"
        />
        <StatCard
          icon={<FileText className="size-5 text-neutral-400" />}
          label="Total procesados"
          value={result.created + result.skipped}
          color="neutral"
        />
      </div>

      {/* Errors detail */}
      {hasErrors ? (
        <div className="rounded-[20px] border border-amber-500/20 bg-amber-500/5 p-4">
          <button
            type="button"
            onClick={onToggleErrors}
            className="flex w-full items-center justify-between gap-3 text-sm font-medium text-amber-300"
          >
            <span>{result.errors.length} fila{result.errors.length > 1 ? 's' : ''} con problemas</span>
            {showErrors ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {showErrors ? (
            <div className="mt-3 space-y-2">
              {result.errors.map((err) => (
                <div key={err.row} className="flex gap-3 text-xs">
                  <span className="shrink-0 font-semibold text-amber-500">Fila {err.row}</span>
                  <span className="text-amber-200/70">{err.reason}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-[18px] border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-300">Todos los productos se importaron sin errores.</p>
        </div>
      )}

      <div className="flex gap-3">
        <a
          href="/admin/productos"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
        >
          Ver productos
        </a>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5"
        >
          Importar otro archivo
        </button>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'emerald' | 'amber' | 'neutral'
}) {
  const bg = color === 'emerald' ? 'bg-emerald-500/8 border-emerald-500/20' : color === 'amber' ? 'bg-amber-500/8 border-amber-500/20' : 'bg-white/4 border-white/8'

  return (
    <div className={`flex items-center gap-3 rounded-[18px] border px-4 py-4 ${bg}`}>
      {icon}
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  )
}

function ColumnReference() {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/3 p-5">
      <h3 className="mb-3 text-sm font-semibold text-neutral-200">Columnas reconocidas</h3>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {[
          { col: 'nombre', req: true, desc: 'Nombre del producto' },
          { col: 'precio', req: true, desc: 'Precio de venta (número)' },
          { col: 'descripcion_corta', req: false, desc: 'Se muestra en la card (máx 90)' },
          { col: 'descripcion', req: false, desc: 'Detalle del modal (máx 280)' },
          { col: 'precio_comparacion', req: false, desc: 'Precio tachado (referencia)' },
          { col: 'badge', req: false, desc: 'Etiqueta corta (Nuevo, -20%)' },
          { col: 'categoria', req: false, desc: 'Se crea si no existe' },
          { col: 'imagen_url', req: false, desc: 'URL pública de la imagen' },
          { col: 'slug', req: false, desc: 'URL del producto (auto si vacío)' },
          { col: 'opcion_NOMBRE', req: false, desc: 'Atributos: opcion_talle, opcion_color...' },
        ].map(({ col, req, desc }) => (
          <div key={col} className="flex gap-2 text-xs">
            <code className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 font-mono text-neutral-300">
              {col}
            </code>
            {req ? <span className="text-emerald-500">*</span> : null}
            <span className="text-neutral-500">{desc}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-neutral-600">* requerido</p>
    </div>
  )
}
