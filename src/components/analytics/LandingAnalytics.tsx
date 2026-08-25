'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LandingMediaRecovery } from '@/components/landing/LandingMediaRecovery'
import { trackSaasEvent, type SaasFunnelEventType } from '@/lib/analytics/saas-events'

function eventFromElement(element: HTMLElement): SaasFunnelEventType | null {
  const value = element.dataset.saasEvent
  const allowed: SaasFunnelEventType[] = [
    'landing_primary_cta_click',
    'landing_real_store_click',
    'landing_free_cta_click',
    'landing_volta_cta_click',
    'landing_pro_cta_click',
  ]
  return allowed.includes(value as SaasFunnelEventType) ? value as SaasFunnelEventType : null
}

export function LandingAnalytics() {
  const [showMobileCta, setShowMobileCta] = useState(false)

  useEffect(() => {
    trackSaasEvent('landing_view', { dedupeKey: 'landing-view' })

    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const element = target.closest<HTMLElement>('[data-saas-event]')
      if (!element) return
      const type = eventFromElement(element)
      if (!type) return
      const plan = element.dataset.saasPlan
      trackSaasEvent(type, {
        ctaLocation: element.dataset.saasLocation ?? null,
        plan: plan === 'free' || plan === 'volta' || plan === 'pro' ? plan : null,
      })
    }

    document.addEventListener('click', onClick, true)

    const hero = document.getElementById('landing-hero')
    const pricing = document.getElementById('planes')
    const finalCta = document.getElementById('landing-final-cta')
    let heroVisible = true
    let pricingVisible = false
    let finalVisible = false

    const syncMobileCta = () => setShowMobileCta(!heroVisible && !pricingVisible && !finalVisible)
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting
        if (entry.target === pricing) {
          pricingVisible = entry.isIntersecting
          if (entry.isIntersecting) {
            trackSaasEvent('landing_pricing_view', { dedupeKey: 'landing-pricing-view' })
          }
        }
        if (entry.target === finalCta) finalVisible = entry.isIntersecting
      }
      syncMobileCta()
    }, { threshold: 0.12 })

    if (hero) observer.observe(hero)
    if (pricing) observer.observe(pricing)
    if (finalCta) observer.observe(finalCta)

    return () => {
      document.removeEventListener('click', onClick, true)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <LandingMediaRecovery />
      {showMobileCta ? (
        <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-[70] md:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-[20px] border border-white/12 bg-[#07120f]/96 p-2.5 pl-4 text-white shadow-[0_20px_60px_rgba(7,18,15,.32)] backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Creá tu tienda gratis</p>
              <p className="mt-0.5 text-[10px] text-white/55">Sin tarjeta · publicás en minutos</p>
            </div>
            <Link
              href="/login"
              data-saas-event="landing_primary_cta_click"
              data-saas-location="mobile_sticky"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#12e89a] px-4 text-xs font-bold text-[#04251a]"
            >
              Empezar <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </>
  )
}
