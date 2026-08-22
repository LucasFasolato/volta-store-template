import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'
import './volta-premium.css'
import './appearance-polish.css'
import './admin-nav-contrast.css'
import './core-ux-polish.css'
import './ux-simplification.css'
import './storefront-polish.css'
import './contrast-system.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })
const plusJakarta = Plus_Jakarta_Sans({ variable: '--font-plus-jakarta', subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Volta Store', template: '%s - Volta Store' },
  description: 'La forma más simple y profesional de vender por WhatsApp.',
  icons: {
    icon: [{ url: '/brand/volta-mark.png', type: 'image/png', sizes: '192x192' }],
    shortcut: '/brand/volta-mark.png',
    apple: '/brand/volta-mark.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} ${playfair.variable}`} suppressHydrationWarning><body className="font-sans"><ThemeProvider>{children}<Toaster richColors position="top-center" /></ThemeProvider></body></html>
}
