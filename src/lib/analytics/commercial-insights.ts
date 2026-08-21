import type { StoreAnalyticsSnapshot } from '@/lib/queries/analytics'

export type CommercialOpportunity = {
  id: string
  tone: 'opportunity' | 'positive' | 'neutral'
  title: string
  body: string
  action: string
}

export function buildCommercialOpportunities(snapshot: StoreAnalyticsSnapshot): CommercialOpportunity[] {
  const opportunities: CommercialOpportunity[] = []
  const topProducts = snapshot.topProducts ?? []

  const highInterestLowCart = topProducts.find((product) => product.views >= 5 && product.cartRate < 8)
  if (highInterestLowCart) {
    opportunities.push({
      id: `low-cart:${highInterestLowCart.id}`,
      tone: 'opportunity',
      title: `${highInterestLowCart.name} llama la atención, pero convierte poco`,
      body: `${highInterestLowCart.views} aperturas y ${highInterestLowCart.addToCart} agregados al carrito en el período.`,
      action: 'Revisá foto principal, precio, descripción y opciones disponibles.',
    })
  }

  if (snapshot.addToCart.value >= 2 && snapshot.whatsappClicks.value === 0) {
    opportunities.push({
      id: 'cart-without-whatsapp',
      tone: 'opportunity',
      title: 'Hay intención de compra que no llega a WhatsApp',
      body: `${snapshot.addToCart.value} agregados al carrito y ningún inicio de pedido por WhatsApp.`,
      action: 'Probá el checkout en mobile y revisá que entrega, datos y CTA final sean claros.',
    })
  }

  if (snapshot.visits.value >= 10 && snapshot.productViews.value === 0) {
    opportunities.push({
      id: 'visits-without-products',
      tone: 'opportunity',
      title: 'La gente entra, pero no abre productos',
      body: `${snapshot.visits.value} visitas sin aperturas de producto registradas.`,
      action: 'Revisá portada, orden del catálogo y qué productos aparecen primero.',
    })
  }

  const strongestProduct = [...topProducts].sort((a, b) => b.addToCart - a.addToCart || b.cartRate - a.cartRate)[0]
  if (strongestProduct && strongestProduct.addToCart >= 2) {
    opportunities.push({
      id: `strong-product:${strongestProduct.id}`,
      tone: 'positive',
      title: `${strongestProduct.name} está mostrando intención de compra`,
      body: `${strongestProduct.addToCart} agregados al carrito sobre ${strongestProduct.views} aperturas.`,
      action: 'Compartilo de forma individual y usalo como producto protagonista.',
    })
  }

  if (snapshot.topCategory && snapshot.topCategory.views >= 3) {
    opportunities.push({
      id: `category:${snapshot.topCategory.id}`,
      tone: 'neutral',
      title: `${snapshot.topCategory.name} concentra interés`,
      body: `${snapshot.topCategory.views} aperturas de producto pertenecen a esta categoría.`,
      action: 'Mantené sus mejores productos visibles y actualizados.',
    })
  }

  if (snapshot.whatsappClicks.value >= 2 && snapshot.conversionRate >= 5) {
    opportunities.push({
      id: 'healthy-whatsapp-conversion',
      tone: 'positive',
      title: 'La tienda está generando conversaciones comerciales',
      body: `${snapshot.whatsappClicks.value} inicios de WhatsApp con ${snapshot.conversionRate.toFixed(1)}% de conversión por sesión.`,
      action: 'Seguí llevando tráfico y compará cómo evoluciona este porcentaje.',
    })
  }

  if (opportunities.length === 0 && snapshot.hasData) {
    opportunities.push({
      id: 'collect-more-signal',
      tone: 'neutral',
      title: 'Todavía estamos juntando señal útil',
      body: 'Hay actividad, pero todavía no aparece un patrón suficientemente claro para recomendar un cambio.',
      action: 'Seguí compartiendo la tienda y volvé a mirar cuando haya más visitas y acciones.',
    })
  }

  return opportunities.slice(0, 3)
}
