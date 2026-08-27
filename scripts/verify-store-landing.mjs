import { readFileSync } from 'node:fs'

const page = readFileSync('src/app/page.tsx', 'utf8')
const analytics = readFileSync('src/components/analytics/LandingAnalytics.tsx', 'utf8')

const failures = []
const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(`${label}: missing ${JSON.stringify(text)}`)
}
const forbidText = (source, text, label) => {
  if (source.includes(text)) failures.push(`${label}: forbidden ${JSON.stringify(text)}`)
}

const sectionCount = (page.match(/data-store-landing-section=/g) ?? []).length
if (sectionCount !== 6) failures.push(`page length: expected exactly 6 primary landing sections, found ${sectionCount}`)

requireText(page, 'Tu tienda online, lista para vender por WhatsApp.', 'hero promise')
requireText(page, 'data-store-landing-section="hero"', 'hero section')
requireText(page, 'data-store-landing-section="steps"', 'steps section')
requireText(page, 'data-store-landing-section="product"', 'product section')
requireText(page, 'data-store-landing-section="proof"', 'real proof section')
requireText(page, 'data-store-landing-section="pricing"', 'pricing section')
requireText(page, 'data-store-landing-section="cta"', 'closing section')
requireText(page, 'id="landing-hero"', 'mobile acquisition hero observer')
requireText(page, 'id="planes"', 'pricing observer')
requireText(page, 'id="landing-final-cta"', 'closing observer')
requireText(page, 'href="/tienda/strongprotein"', 'real store proof')
requireText(page, 'landing_primary_cta_click', 'primary CTA analytics')
requireText(page, 'landing_real_store_click', 'real store analytics')
requireText(page, 'landing_free_cta_click', 'free plan analytics')
requireText(page, 'landing_volta_cta_click', 'VOLTA plan analytics')
requireText(page, 'landing_pro_cta_click', 'PRO plan analytics')
requireText(page, "formatBillingAmount(VOLTA_BILLING_PLAN.introAmount)", 'VOLTA price source')
requireText(page, "formatBillingAmount(VOLTA_PRO_PLAN.standardAmount)", 'PRO price source')
requireText(page, "callbackParams.set('provider', 'google')", 'OAuth root callback')
requireText(page, "redirect(`/auth/callback?${callbackParams.toString()}`)", 'OAuth redirect')
requireText(page, 'style={{ paddingTop: \'env(safe-area-inset-top)\' }}', 'safe-area header')
requireText(page, 'min-h-11 items-center justify-center', 'mobile header CTA target')
requireText(analytics, 'className="inline-flex min-h-11', 'mobile sticky CTA target')
requireText(page, 'href="/privacy"', 'privacy link')
requireText(page, 'href="/terms"', 'terms link')

forbidText(page, 'const faqs =', 'retired FAQ data')
forbidText(page, 'Preguntas frecuentes', 'retired FAQ chapter')
forbidText(page, 'data-store-landing-section="faq"', 'FAQ section')

if (failures.length) {
  console.error('Store Landing 2.1 verification failed:\n- ' + failures.join('\n- '))
  process.exit(1)
}

console.log('Store Landing 2.1 verification passed.')
