'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Monitor, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

type Variant = 'pill' | 'sidebar'

const OPTIONS = [
  { value: 'light', Icon: Sun, label: 'Claro' },
  { value: 'system', Icon: Monitor, label: 'Sistema' },
  { value: 'dark', Icon: Moon, label: 'Oscuro' },
] as const

/**
 * Reusable theme toggle for onboarding and admin.
 * variant="pill"    → compact row of icon buttons (onboarding header)
 * variant="sidebar" → labeled row with icons (admin sidebar footer)
 */
export function ThemeToggle({ variant = 'pill' }: { variant?: Variant }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  // useSyncExternalStore: client snapshot returns true (mounted), server snapshot false (prevents hydration mismatch)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  // Render a placeholder that matches final dimensions to avoid layout shift
  if (!mounted) {
    return variant === 'pill' ? (
      <div className="h-8 w-[88px] rounded-xl" />
    ) : (
      <div className="h-8 rounded-lg" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  if (variant === 'sidebar') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg px-2.5 py-2',
          isDark ? 'bg-white/4' : 'bg-black/4',
        )}
      >
        <span className="text-[11px] font-medium text-muted-foreground">Apariencia</span>
        <div className="flex items-center gap-0.5">
          {OPTIONS.map(({ value, Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                'flex items-center justify-center rounded p-1 transition-all duration-150',
                theme === value
                  ? isDark
                    ? 'bg-white/14 text-white'
                    : 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // pill variant
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-xl p-1',
        isDark ? 'bg-white/8' : 'bg-black/6',
      )}
    >
      {OPTIONS.map(({ value, Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            'flex items-center justify-center rounded-lg p-1.5 transition-all duration-150',
            theme === value
              ? isDark
                ? 'bg-white/14 text-white'
                : 'bg-white text-foreground shadow-sm'
              : isDark
                ? 'text-white/40 hover:text-white/65'
                : 'text-black/35 hover:text-black/55',
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}
