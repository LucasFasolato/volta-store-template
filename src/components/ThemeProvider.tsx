'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Global theme provider for VOLTA.
 * Applies theme class to <html> so ALL app surfaces respond consistently.
 * - attribute="class" → adds "light" or "dark" to <html>
 * - defaultTheme="light" → initial state is light
 * - enableSystem → "system" option follows prefers-color-scheme
 * - storageKey="volta-theme" → persists preference in localStorage
 * - disableTransitionOnChange → prevents jarring cross-fade on switch
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="volta-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
