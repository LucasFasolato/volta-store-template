'use client'

import { useMemo, useState, type ReactNode } from 'react'
import type { AnalyticsDailyPoint } from '@/lib/queries/analytics'

type ChartMetric = 'visits' | 'whatsapp'

export function AnalyticsActivityChart({ data }: { data: AnalyticsDailyPoint[] }) {
  const [metric, setMetric] = useState<ChartMetric>('visits')
  const values = useMemo(() => data.map((point) => point[metric]), [data, metric])
  const total = values.reduce((sum, value) => sum + value, 0)
  const maxValue = Math.max(1, ...values)
  const chart = buildChart(values, maxValue)
  const hasValues = values.some((value) => value > 0)
  const labels = buildDateLabels(data)

  return (
    <article className="rounded-[18px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#111820] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="admin-label">Evolución</p>
          <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] text-foreground sm:text-lg">Actividad de tu tienda</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Intl.NumberFormat('es-AR').format(total)} {metric === 'visits' ? 'visitas' : 'pedidos a WhatsApp'} en el período
          </p>
        </div>

        <div className="inline-flex w-fit rounded-[10px] border border-black/8 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
          <ChartToggle active={metric === 'visits'} onClick={() => setMetric('visits')}>Visitas</ChartToggle>
          <ChartToggle active={metric === 'whatsapp'} onClick={() => setMetric('whatsapp')}>WhatsApp</ChartToggle>
        </div>
      </div>

      <div className="mt-5">
        {hasValues ? (
          <div className="relative overflow-hidden rounded-[14px] bg-slate-50/70 px-2 pb-2 pt-3 dark:bg-white/[0.025]">
            <svg viewBox="0 0 640 190" role="img" aria-label={`Evolución de ${metric === 'visits' ? 'visitas' : 'WhatsApp'}`} className="block h-auto w-full">
              <defs>
                <linearGradient id={`analytics-fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12e89a" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#12e89a" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[42, 94, 146].map((y) => (
                <line key={y} x1="12" x2="628" y1={y} y2={y} stroke="currentColor" className="text-slate-200 dark:text-white/8" strokeWidth="1" />
              ))}

              <path d={chart.areaPath} fill={`url(#analytics-fill-${metric})`} />
              <path d={chart.linePath} fill="none" stroke="#12e89a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {chart.points.map((point, index) => (
                <circle
                  key={`${point.x}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={values.length <= 14 ? 3.4 : 2.2}
                  fill="#12e89a"
                  opacity={values.length <= 30 || index === values.length - 1 ? 1 : 0.58}
                >
                  <title>{`${formatDate(data[index]?.date)}: ${values[index] ?? 0}`}</title>
                </circle>
              ))}
            </svg>

            <div className="flex items-center justify-between px-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              <span>{labels.first}</span>
              {labels.middle ? <span>{labels.middle}</span> : null}
              <span>{labels.last}</span>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[190px] items-center justify-center rounded-[14px] border border-dashed border-black/8 bg-slate-50/60 px-4 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.025]">
            Todavía no hay actividad de {metric === 'visits' ? 'visitas' : 'WhatsApp'} en este período.
          </div>
        )}
      </div>
    </article>
  )
}

function ChartToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-8 rounded-[7px] px-3 text-xs font-semibold transition ${
        active
          ? 'bg-white text-foreground shadow-sm dark:bg-white/10'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function buildChart(values: number[], maxValue: number) {
  const width = 640
  const height = 190
  const padX = 14
  const padTop = 14
  const padBottom = 28
  const usableWidth = width - padX * 2
  const usableHeight = height - padTop - padBottom
  const denominator = Math.max(1, values.length - 1)

  const points = values.map((value, index) => ({
    x: padX + (index / denominator) * usableWidth,
    y: padTop + usableHeight - (value / maxValue) * usableHeight,
  }))

  if (points.length === 0) {
    return { points: [], linePath: '', areaPath: '' }
  }

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
  const bottom = padTop + usableHeight
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${bottom} L ${points[0].x.toFixed(2)} ${bottom} Z`

  return { points, linePath, areaPath }
}

function buildDateLabels(data: AnalyticsDailyPoint[]) {
  if (data.length === 0) return { first: '', middle: '', last: '' }
  const middleIndex = Math.floor(data.length / 2)
  return {
    first: formatDate(data[0].date),
    middle: data.length >= 14 ? formatDate(data[middleIndex].date) : '',
    last: formatDate(data[data.length - 1].date),
  }
}

function formatDate(date: string | undefined) {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`))
    .replace('.', '')
}
