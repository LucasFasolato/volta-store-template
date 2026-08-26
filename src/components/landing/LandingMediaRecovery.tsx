'use client'

import { useEffect } from 'react'

const NOVA_HERO =
  'https://images.unsplash.com/photo-1617030557822-c8c35f07c60b?auto=format&fit=crop&fm=jpg&q=88&w=1800'
const NOVA_BOTTLE =
  'https://images.unsplash.com/photo-1544003484-3cd181d17917?auto=format&fit=crop&fm=jpg&q=88&w=1200'
const NOVA_TOTE =
  'https://images.unsplash.com/photo-1617030557822-c8c35f07c60b?auto=format&fit=crop&fm=jpg&q=88&w=1200'
const NOVA_CANDLE =
  'https://images.unsplash.com/photo-1616172890963-a45e7da8de31?auto=format&fit=crop&fm=jpg&q=88&w=1200'
const NOVA_TEE =
  'https://images.unsplash.com/photo-1598795737563-07467e744bac?auto=format&fit=crop&fm=jpg&q=88&w=1200'

const PRODUCT_MEDIA = [
  { src: NOVA_BOTTLE, title: 'NOVA Bottle', price: '$24.000', position: 'center 48%' },
  { src: NOVA_TOTE, title: 'Daily Tote', price: '$28.000', position: '72% 72%' },
  { src: NOVA_CANDLE, title: 'Scented Candle', price: '$19.000', position: 'center 54%' },
  { src: NOVA_TEE, title: 'Essential Tee', price: '$26.000', position: 'center 42%' },
] as const

function svgFallback(kind: 'hero' | 'product') {
  const svg = kind === 'hero'
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5f1e9"/><stop offset="1" stop-color="#d9cec0"/></linearGradient><radialGradient id="g" cx="76%" cy="20%" r="72%"><stop stop-color="#a7f3d0" stop-opacity=".55"/><stop offset="1" stop-color="#f5f1e9" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="720" fill="url(#b)"/><rect width="1200" height="720" fill="url(#g)"/><g transform="translate(620 116)"><path d="M38 195h230l22 304H16z" fill="#f4efe5" stroke="#d5cabd" stroke-width="6"/><path d="M78 195c5-92 133-92 138 0" fill="none" stroke="#c6b8a5" stroke-width="12"/><rect x="306" y="84" width="94" height="334" rx="42" fill="#171c19"/><rect x="329" y="55" width="48" height="44" rx="10" fill="#0a0d0c"/><rect x="432" y="234" width="116" height="154" rx="22" fill="#6a452d"/><rect x="451" y="218" width="78" height="28" rx="8" fill="#232823"/><path d="M580 230c104-83 229-70 289 10l-34 86c-84-51-162-43-226 11z" fill="#141916"/></g><text x="78" y="116" fill="#0c1712" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="700" letter-spacing="8">NOVA</text><text x="78" y="164" fill="#4f675e" font-family="Arial,Helvetica,sans-serif" font-size="19" letter-spacing="5">STUDIO</text></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0e9df"/><stop offset="1" stop-color="#cdd8d0"/></linearGradient></defs><rect width="900" height="700" fill="url(#b)"/><ellipse cx="455" cy="590" rx="245" ry="38" fill="#0b1712" opacity=".12"/><rect x="318" y="144" width="264" height="376" rx="48" fill="#f9faf7" stroke="#d8dbd5" stroke-width="7"/><rect x="397" y="72" width="106" height="122" rx="29" fill="#1b211e"/><rect x="420" y="45" width="60" height="40" rx="10" fill="#0e1210"/><rect x="354" y="304" width="192" height="108" rx="16" fill="#eef1eb"/><text x="450" y="365" text-anchor="middle" fill="#0d1713" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" letter-spacing="5">NOVA</text></svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function setText(card: HTMLElement, title: string, price: string) {
  const titleNode = card.querySelector<HTMLElement>('p')
  const priceNode = card.querySelector<HTMLElement>('span.text-slate-500')
  if (titleNode) titleNode.textContent = title
  if (priceNode) priceNode.textContent = price
}

function polishCard(image: HTMLImageElement, index: number) {
  const card = image.parentElement as HTMLElement | null
  const media = PRODUCT_MEDIA[index]
  if (!card || !media) return

  card.style.border = '1px solid rgba(7,18,15,.08)'
  card.style.borderRadius = '18px'
  card.style.boxShadow = '0 14px 34px rgba(7,18,15,.10)'
  card.style.background = '#fff'
  card.style.overflow = 'hidden'

  image.style.aspectRatio = '1.08 / 1'
  image.style.width = '100%'
  image.style.objectFit = 'cover'
  image.style.objectPosition = media.position
  image.style.background = '#eee9e1'
  image.style.filter = 'saturate(.92) contrast(1.025)'

  const body = image.nextElementSibling as HTMLElement | null
  if (body) {
    body.style.padding = '10px 11px 11px'
  }

  setText(card, media.title, media.price)
}

export function LandingMediaRecovery() {
  useEffect(() => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[src*="/landing/nova/"]'))
    if (!images.length) return

    const cleanups: Array<() => void> = []

    images.forEach((image, imageIndex) => {
      const isHero = imageIndex === 0
      const isMobileDetail = imageIndex === images.length - 1
      const productIndex = imageIndex - 1
      const media = isHero
        ? { src: NOVA_HERO, fallback: svgFallback('hero'), position: 'center 68%' }
        : isMobileDetail
          ? { src: NOVA_TOTE, fallback: svgFallback('product'), position: '60% 68%' }
          : { ...PRODUCT_MEDIA[productIndex], fallback: svgFallback('product') }

      if (!media) return

      let fallbackApplied = false
      const onError = () => {
        if (fallbackApplied) return
        fallbackApplied = true
        image.src = media.fallback
        image.style.objectPosition = 'center'
      }

      image.addEventListener('error', onError)
      image.src = media.src
      image.decoding = 'async'
      image.referrerPolicy = 'no-referrer'
      image.style.objectPosition = media.position
      image.style.background = '#eee9e1'

      if (isHero) {
        image.setAttribute('fetchpriority', 'high')
        image.style.filter = 'saturate(.9) contrast(1.035)'
      } else if (!isMobileDetail && productIndex >= 0 && productIndex < PRODUCT_MEDIA.length) {
        polishCard(image, productIndex)
      } else if (isMobileDetail) {
        image.style.filter = 'saturate(.9) contrast(1.03)'
      }

      cleanups.push(() => image.removeEventListener('error', onError))
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])

  return null
}
