import { DEFAULT_THEME } from '@/data/defaults'
import { evaluateStorePublicationState, type StorePublicationSnapshot } from '@/lib/store/publication'
import { normalizeCardLayout } from '@/lib/utils/card-layout'
import type { AdminStoreData, Category, ProductWithImages, StoreTheme } from '@/types/store'

export type LaunchChecklistStatus = 'done' | 'missing' | 'recommended'
export type StoreReadinessState = 'draft' | 'ready' | 'published'

export type LaunchChecklistItem = {
  id: string
  title: string
  description: string
  status: LaunchChecklistStatus
  href: string
  ctaLabel: string
}

export type StoreLaunchPlan = {
  state: StoreReadinessState
  status: AdminStoreData['store']['status']
  stateLabel: string
  headline: string
  summary: string
  requiredItems: LaunchChecklistItem[]
  recommendedItems: LaunchChecklistItem[]
  completedRequiredCount: number
  totalRequiredCount: number
  completedRecommendedCount: number
  totalRecommendedCount: number
  requiredCompletionPercent: number
  missingRequiredCount: number
  shareEnabled: boolean
  previewEnabled: boolean
  previewPath: string
  canPublish: boolean
  isPublished: boolean
  publication: StorePublicationSnapshot
  publicPath: string
  publicUrl: string
  whatsappShareUrl: string
  shareMessage: string
  blockers: string[]
  nextBestAction: {
    href: string
    label: string
    title: string
  }
}

export type ActivationFlowStep = {
  id: 'contact' | 'hero' | 'products' | 'publish'
  navLabel: string
  title: string
  description: string
  href: string
  ctaLabel: string
  skipLabel?: string
  status: 'done' | 'current' | 'upcoming'
  completionText: string
  hint: string
  doneMessage: string
}

function buildPublicUrl(slug: string) {
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? 'https://tu-tienda.com'
  const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '')
  const publicPath = `/tienda/${slug}`

  return {
    publicPath,
    publicUrl: `${normalizedBaseUrl}${publicPath}`,
  }
}

function buildItem(input: {
  id: string
  done: boolean
  title: string
  description: string
  href: string
  ctaLabel: string
  missingStatus?: Exclude<LaunchChecklistStatus, 'done'>
}) {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    href: input.href,
    ctaLabel: input.ctaLabel,
    status: input.done ? 'done' : (input.missingStatus ?? 'missing'),
  } satisfies LaunchChecklistItem
}

function hasSelectedStyle(theme: StoreTheme) {
  return (
    theme.primary_color !== DEFAULT_THEME.primary_color ||
    theme.secondary_color !== DEFAULT_THEME.secondary_color ||
    theme.accent_color !== DEFAULT_THEME.accent_color ||
    theme.background_color !== DEFAULT_THEME.background_color ||
    theme.surface_color !== DEFAULT_THEME.surface_color ||
    theme.text_color !== DEFAULT_THEME.text_color ||
    theme.visual_mode !== DEFAULT_THEME.visual_mode ||
    theme.font_preset !== DEFAULT_THEME.font_preset ||
    theme.heading_font !== DEFAULT_THEME.heading_font ||
    theme.body_font !== DEFAULT_THEME.body_font ||
    theme.card_style !== DEFAULT_THEME.card_style ||
    normalizeCardLayout(theme.card_layout) !== normalizeCardLayout(DEFAULT_THEME.card_layout) ||
    theme.button_style !== DEFAULT_THEME.button_style
  )
}

function buildStateCopy(plan: StorePublicationSnapshot) {
  if (plan.state === 'published') {
    if (plan.canPublish) {
      return {
        stateLabel: 'Publicada',
        headline: 'Tu tienda ya esta publicada y lista para recibir pedidos',
        summary: 'El enlace ya funciona para otras personas. Ahora toca compartirlo y seguir puliendo detalles comerciales.',
      }
    }

    return {
      stateLabel: 'Publicada con alertas',
      headline: 'La tienda sigue publicada, pero conviene reforzar lo esencial',
      summary: 'No la apagamos para no cortar ventas, pero hay puntos clave que deberias completar para sostener una buena primera impresion.',
    }
  }

  if (plan.state === 'ready') {
    return {
      stateLabel: 'Lista para publicar',
      headline: 'Tu tienda ya esta lista para publicarse',
      summary: 'Solo falta publicarla para que cualquiera pueda verla y empezar a mandarte pedidos por WhatsApp.',
    }
  }

  return {
    stateLabel: 'En activacion',
    headline: 'Tu tienda ya esta adentro. Ahora falta cerrar la base para publicar',
    summary: 'Ya resolviste el ingreso inicial. Sigue este orden para completar lo esencial, ver la preview y dejarla lista para vender.',
  }
}

export function buildStoreLaunchPlan({
  storeData,
  categories,
  products,
}: {
  storeData: AdminStoreData
  categories: Category[]
  products: ProductWithImages[]
}): StoreLaunchPlan {
  const { store, theme } = storeData
  const publication = evaluateStorePublicationState({ storeData, products })
  const { readiness } = publication
  const hasCategories = categories.length > 0
  const hasInstagram = Boolean(store.instagram?.trim())
  const hasAddress = Boolean(store.address?.trim())
  const hasHours = Boolean(store.hours?.trim())
  const hasTemplate = hasSelectedStyle(theme)

  const requiredItems = readiness.checks.map((check) =>
    buildItem({
      id: check.key,
      done: check.passed,
      title: check.label,
      description: check.detail,
      href: check.href,
      ctaLabel: check.ctaLabel,
    }),
  )

  const recommendedItems = [
    buildItem({
      id: 'style',
      done: hasTemplate,
      title: 'Estilo inicial',
      description: hasTemplate
        ? 'La tienda ya tiene una base visual definida.'
        : 'Elige un preset visual para que la tienda se vea mas redonda antes de compartirla fuerte.',
      href: '/admin/tienda',
      ctaLabel: 'Elegir estilo',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'categories',
      done: hasCategories,
      title: 'Categorias',
      description: 'Ordenar el catalogo ayuda a recorrerlo mejor cuando tengas mas productos.',
      href: '/admin/catalogo#categorias',
      ctaLabel: 'Crear categoria',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'instagram',
      done: hasInstagram,
      title: 'Instagram visible',
      description: 'Suma respaldo social y hace que tu negocio se vea mas confiable.',
      href: '/admin/negocio',
      ctaLabel: 'Agregar Instagram',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'address',
      done: hasAddress,
      title: 'Direccion o zona',
      description: 'Ubica mejor tu negocio y despeja dudas antes del primer mensaje.',
      href: '/admin/negocio',
      ctaLabel: 'Agregar direccion',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'hours',
      done: hasHours,
      title: 'Horarios de atencion',
      description: 'Ayuda a ordenar mejor las consultas y dar mas claridad.',
      href: '/admin/negocio',
      ctaLabel: 'Agregar horarios',
      missingStatus: 'recommended',
    }),
  ]

  const completedRequiredCount = requiredItems.filter((item) => item.status === 'done').length
  const totalRequiredCount = requiredItems.length
  const completedRecommendedCount = recommendedItems.filter((item) => item.status === 'done').length
  const totalRecommendedCount = recommendedItems.length
  const missingRequiredItems = requiredItems.filter((item) => item.status !== 'done')
  const missingRequiredCount = missingRequiredItems.length
  const blockers = missingRequiredItems.map((item) => item.title)
  const stateCopy = buildStateCopy(publication)
  const { publicPath, publicUrl } = buildPublicUrl(store.slug)
  const previewPath = '/admin/vista-previa'
  const shareMessage = `Hola! Te comparto mi tienda ${store.name}. Puedes verla aqui: ${publicUrl}`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
  const firstMissingRequired = missingRequiredItems[0]
  const firstRecommended = recommendedItems.find((item) => item.status !== 'done')

  const nextBestAction = firstMissingRequired
    ? {
        href: firstMissingRequired.href,
        label: firstMissingRequired.ctaLabel,
        title: firstMissingRequired.title,
      }
    : publication.isReadyToPublish
      ? {
          href: '#publish-gate',
          label: 'Publicar tienda',
          title: 'Publicar tienda',
        }
      : firstRecommended
        ? {
            href: firstRecommended.href,
            label: firstRecommended.ctaLabel,
            title: firstRecommended.title,
          }
        : {
            href: '#share-tools',
            label: 'Compartir tienda',
            title: 'Tu tienda ya esta publicada',
          }

  return {
    state: publication.state,
    status: store.status,
    stateLabel: stateCopy.stateLabel,
    headline: stateCopy.headline,
    summary: stateCopy.summary,
    requiredItems,
    recommendedItems,
    completedRequiredCount,
    totalRequiredCount,
    completedRecommendedCount,
    totalRecommendedCount,
    requiredCompletionPercent: Math.round((completedRequiredCount / totalRequiredCount) * 100),
    missingRequiredCount,
    shareEnabled: publication.isPublished,
    previewEnabled: true,
    previewPath,
    canPublish: publication.canPublish,
    isPublished: publication.isPublished,
    publication,
    publicPath,
    publicUrl,
    whatsappShareUrl,
    shareMessage,
    blockers,
    nextBestAction,
  }
}

export function buildActivationFlowSteps(plan: StoreLaunchPlan): ActivationFlowStep[] {
  const stepDrafts = [
    {
      id: 'contact',
      navLabel: 'Negocio',
      title: 'Ajusta los datos con los que te van a encontrar',
      description: 'Nombre, enlace publico y WhatsApp son la base para publicar sin friccion.',
      href: '/admin/negocio',
      ctaLabel: 'Completar negocio',
      items: ['brand-name', 'slug', 'whatsapp'],
      doneMessage: 'El negocio ya tiene identidad clara y un canal listo para vender.',
    },
    {
      id: 'hero',
      navLabel: 'Portada',
      title: 'Arma una portada que explique que vendes',
      description: 'Titulo, subtitulo e imagen para que el primer vistazo ya se sienta serio.',
      href: '/admin/tienda?tab=contenido',
      ctaLabel: 'Completar portada',
      items: ['hero-copy', 'hero-image'],
      doneMessage: 'La portada ya se ve clara y profesional.',
    },
    {
      id: 'products',
      navLabel: 'Producto',
      title: 'Carga un producto completo y publicable',
      description: 'Necesitas al menos un producto activo con precio e imagen.',
      href: '/admin/catalogo/nuevo',
      ctaLabel: 'Agregar producto',
      items: ['active-product', 'product-image', 'product-price'],
      doneMessage: 'Tu tienda ya tiene algo concreto y vendible para mostrar.',
    },
  ] as const satisfies Array<{
    id: ActivationFlowStep['id']
    navLabel: string
    title: string
    description: string
    href: string
    ctaLabel: string
    items: string[]
    doneMessage: string
  }>

  const allItems = [...plan.requiredItems, ...plan.recommendedItems]

  const mappedSteps: ActivationFlowStep[] = stepDrafts.map((step) => {
    const stepItems = allItems.filter((item) => (step.items as readonly string[]).includes(item.id))
    const doneCount = stepItems.filter((item) => item.status === 'done').length
    const totalCount = stepItems.length
    const isDone = totalCount > 0 && doneCount === totalCount
    const firstIncompleteItem = stepItems.find((item) => item.status !== 'done')

    return {
      id: step.id,
      navLabel: step.navLabel,
      title: step.title,
      description: step.description,
      href: firstIncompleteItem?.href ?? step.href,
      ctaLabel: firstIncompleteItem?.ctaLabel ?? step.ctaLabel,
      status: isDone ? 'done' : 'upcoming',
      completionText: `${doneCount}/${totalCount}`,
      hint: firstIncompleteItem
        ? firstIncompleteItem.description
        : 'Este paso ya esta listo y deja a la tienda mucho mas cerca de poder publicarse.',
      doneMessage: step.doneMessage,
    }
  })

  mappedSteps.push({
    id: 'publish',
    navLabel: 'Publicar',
    title: 'Publica la tienda y empieza a recibir pedidos',
    description: 'Con la base resuelta, el siguiente paso es dejar el enlace visible para otras personas.',
    href: '#publish-gate',
    ctaLabel: plan.isPublished ? 'Compartir tienda' : 'Ir a publicar',
    status: plan.isPublished ? 'done' : 'upcoming',
    completionText: plan.isPublished ? '1/1' : '0/1',
    hint: plan.publication.isReadyToPublish
      ? 'Negocio, portada y producto ya estan listos. Revisa la vista previa y publica cuando quieras.'
      : 'Este paso se habilita cuando completes negocio, portada y producto con una base comercial minima.',
    doneMessage: 'La tienda ya esta visible y lista para compartirse.',
  })

  const currentStepIndex = mappedSteps.findIndex((step) => step.status !== 'done')

  if (currentStepIndex === -1) {
    mappedSteps[mappedSteps.length - 1] = {
      ...mappedSteps[mappedSteps.length - 1],
      status: 'done',
    }
    return mappedSteps
  }

  mappedSteps[currentStepIndex] = {
    ...mappedSteps[currentStepIndex],
    status: 'current',
  }

  return mappedSteps
}
