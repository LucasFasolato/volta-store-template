'use client'

import { useEffect } from 'react'

const NOVA_HERO =
  'https://images.unsplash.com/photo-1777840347880-747242e0db00?auto=format&fit=crop&fm=jpg&q=84&w=1800'
const NOVA_SET =
  'https://images.unsplash.com/photo-1617030557822-c8c35f07c60b?auto=format&fit=crop&fm=jpg&q=84&w=1400'
const NOVA_CAP =
  'https://images.unsplash.com/photo-1777455163868-b113d82fbe74?auto=format&fit=crop&fm=jpg&q=84&w=1200'
const NOVA_TEE =
  'https://images.unsplash.com/photo-1598795737563-07467e744bac?auto=format&fit=crop&fm=jpg&q=84&w=1200'

function svgFallback(kind: 'hero' | 'product') {
  const svg = kind === 'hero'
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4efe7"/><stop offset="1" stop-color="#d9cbbb"/></linearGradient><radialGradient id="g" cx="75%" cy="20%" r="70%"><stop stop-color="#a7f3d0" stop-opacity=".7"/><stop offset="1" stop-color="#f4efe7" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="720" fill="url(#b)"/><rect width="1200" height="720" fill="url(#g)"/><g transform="translate(650 120)"><rect x="30" y="150" width="210" height="330" rx="28" fill="#f9faf9" stroke="#d8d8d2" stroke-width="5"/><rect x="96" y="62" width="78" height="110" rx="18" fill="#6b3f22"/><rect x="112" y="42" width="46" height="32" rx="8" fill="#161b18"/><rect x="62" y="260" width="148" height="92" rx="12" fill="#eef1ec"/><ellipse cx="135" cy="500" rx="150" ry="24" fill="#111b16" opacity=".12"/><path d="M310 185c82-72 197-74 275 10l-38 89c-63-40-143-39-201 3z" fill="#111713"/><ellipse cx="447" cy="494" rx="145" ry="24" fill="#111b16" opacity=".12"/></g><text x="78" y="125" fill="#0b1712" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="700" letter-spacing="8">NOVA</text><text x="78" y="172" fill="#48645a" font-family="Arial,Helvetica,sans-serif" font-size="19" letter-spacing="5">STUDIO</text></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8dfd3"/><stop offset="1" stop-color="#b8c8bd"/></linearGradient></defs><rect width="900" height="700" fill="url(#b)"/><ellipse cx="455" cy="590" rx="245" ry="38" fill="#0b1712" opacity=".14"/><rect x="285" y="176" width="290" height="330" rx="34" fill="#fafaf7" stroke="#d6d7d0" stroke-width="6"/><rect x="382" y="78" width="96" height="128" rx="22" fill="#724629"/><rect x="402" y="50" width="56" height="42" rx="10" fill="#131915"/><rect x="335" y="306" width="190" height="108" rx="16" fill="#eef1eb"/><text x="450" y="365" text-anchor="middle" fill="#0d1713" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" letter-spacing="5">NOVA</text></svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function replacementFor(image: HTMLImageElement) {
  const src = image.getAttribute('src') ?? ''
  if (!src.includes('/landing/nova/')) return null

  const context = image.parentElement?.parentElement?.textContent?.toLowerCase() ?? ''
  const alt = image.alt.toLowerCase()

  if (context.includes('nova cap')) return { src: NOVA_CAP, fallback: svgFallback('product') }
  if (context.includes('daily objects')) return { src: NOVA_TEE, fallback: svgFallback('product') }
  if (context.includes('essential set') || alt.includes('essential set')) return { src: NOVA_SET, fallback: svgFallback('product') }
  return { src: NOVA_HERO, fallback: svgFallback('hero') }
}

export function LandingMediaRecovery() {
  useEffect(() => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[src*="/landing/nova/"]'))
    const cleanups: Array<() => void> = []

    images.forEach((image) => {
      const replacement = replacementFor(image)
      if (!replacement) return

      let fallbackApplied = false
      const onError = () => {
        if (fallbackApplied) return
        fallbackApplied = true
        image.src = replacement.fallback
      }

      image.addEventListener('error', onError)
      image.src = replacement.src
      image.decoding = 'async'
      image.referrerPolicy = 'no-referrer'

      cleanups.push(() => image.removeEventListener('error', onError))
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])

  return null
}
