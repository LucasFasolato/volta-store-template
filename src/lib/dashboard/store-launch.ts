import { DEFAULT_THEME } from '@/data/defaults'
import { normalizeCardLayout } from '@/lib/utils/card-layout'
import type { AdminStoreData, Category, ProductWithImages, StoreTheme } from '@/types/store'

export type LaunchChecklistStatus = 'done' | 'missing' | 'recommended'
export type StoreReadinessState = 'draft' | 'almost_ready' | 'ready'

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
  id: 'hero' | 'products' | 'style'
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

export function buildStoreLaunchPlan({
  storeData,
  categories,
  products,
}: {
  storeData: AdminStoreData
  categories: Category[]
  products: ProductWithImages[]
}): StoreLaunchPlan {
  const { store, content, theme } = storeData
  const activeProducts = products.filter((product) => product.is_active)
  const hasHeroTitle = content.hero_title.trim().length > 0
  const hasHeroSubtitle = content.hero_subtitle.trim().length > 0
  const hasHeroCopy = hasHeroTitle && hasHeroSubtitle
  const hasHeroImage = Boolean(content.hero_image_url)
  const hasActiveProduct = activeProducts.length >= 1
  const hasTemplate = hasSelectedStyle(theme)
  const hasCategories = categories.length > 0
  const hasInstagram = Boolean(store.instagram?.trim())
  const hasAddress = Boolean(store.address?.trim())
  const hasHours = Boolean(store.hours?.trim())

  const requiredItems = [
    buildItem({
      id: 'hero-copy',
      done: hasHeroCopy,
      title: 'Titulo y subtitulo',
      description: 'Completa el titulo y subtitulo para que la portada cuente rapido que vendes.',
      href: '/admin/contenido#section-copy',
      ctaLabel: 'Completar portada',
    }),
    buildItem({
      id: 'hero-image',
      done: hasHeroImage,
      title: 'Imagen de portada',
      description: 'Para completar este paso, subi una imagen de portada.',
      href: '/admin/contenido#section-hero-image',
      ctaLabel: 'Subir imagen',
    }),
    buildItem({
      id: 'products',
      done: hasActiveProduct,
      title: 'Tu primer producto',
      description: 'Para continuar, agrega al menos un producto activo con nombre y precio.',
      href: activeProducts.length > 0 ? '/admin/productos' : '/admin/productos/nuevo',
      ctaLabel: activeProducts.length > 0 ? 'Ver productos' : 'Agregar producto',
    }),
    buildItem({
      id: 'style',
      done: hasTemplate,
      title: 'Estilo inicial',
      description: 'Elige un preset visual para que la tienda se vea lista. Despues puedes cambiar todo.',
      href: '/admin/apariencia',
      ctaLabel: 'Elegir estilo',
    }),
  ]

  const recommendedItems = [
    buildItem({
      id: 'categories',
      done: hasCategories,
      title: 'Categorias',
      description: 'Ordenar el catalogo ayuda a recorrerlo mejor cuando tengas mas productos.',
      href: '/admin/categorias',
      ctaLabel: 'Crear categoria',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'instagram',
      done: hasInstagram,
      title: 'Instagram visible',
      description: 'Suma respaldo social y hace que tu negocio se vea mas confiable.',
      href: '/admin/configuracion#section-contacto',
      ctaLabel: 'Agregar Instagram',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'address',
      done: hasAddress,
      title: 'Direccion o zona',
      description: 'Ubica mejor tu negocio y despeja dudas antes del primer mensaje.',
      href: '/admin/configuracion#section-contexto',
      ctaLabel: 'Agregar direccion',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'hours',
      done: hasHours,
      title: 'Horarios de atencion',
      description: 'Ayuda a ordenar mejor las consultas y dar mas claridad.',
      href: '/admin/configuracion#section-contexto',
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
  const hardBlockersMissing = !hasHeroCopy || !hasHeroImage || !hasActiveProduct || !hasTemplate

  let state: StoreReadinessState
  if (missingRequiredCount === 0) {
    state = 'ready'
  } else if (!hardBlockersMissing) {
    state = 'almost_ready'
  } else {
    state = 'draft'
  }

  const stateCopy = {
    draft: {
      stateLabel: 'En activacion',
      headline: 'Termina estos 3 pasos y tu tienda ya se va a sentir real',
      summary: 'Primero deja bien la portada, agrega un producto y elige un estilo. Lo demas puede venir despues.',
    },
    almost_ready: {
      stateLabel: 'Casi lista',
      headline: 'Te queda muy poco para mostrarla con confianza',
      summary: 'La base ya esta. Cierra el ultimo paso y vas a poder abrir la tienda como algo listo para compartir.',
    },
    ready: {
      stateLabel: 'Lista para compartir',
      headline: 'Tu tienda ya esta lista para mostrarse',
      summary: 'Portada, producto y estilo ya quedaron resueltos. Ahora puedes compartirla y empezar a recibir pedidos.',
    },
  } satisfies Record<StoreReadinessState, { stateLabel: string; headline: string; summary: string }>

  const { publicPath, publicUrl } = buildPublicUrl(store.slug)
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
    : firstRecommended
      ? {
          href: firstRecommended.href,
          label: firstRecommended.ctaLabel,
          title: firstRecommended.title,
        }
      : {
          href: '#share-tools',
          label: 'Compartir tienda',
          title: 'Tu tienda ya esta lista',
        }

  return {
    state,
    stateLabel: stateCopy[state].stateLabel,
    headline: stateCopy[state].headline,
    summary: stateCopy[state].summary,
    requiredItems,
    recommendedItems,
    completedRequiredCount,
    totalRequiredCount,
    completedRecommendedCount,
    totalRecommendedCount,
    requiredCompletionPercent: Math.round((completedRequiredCount / totalRequiredCount) * 100),
    missingRequiredCount,
    shareEnabled: state !== 'draft',
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
      id: 'hero',
      navLabel: 'Portada',
      title: 'Arma la portada de tu tienda',
      description: 'Titulo, subtitulo e imagen obligatoria para que el primer vistazo tenga impacto.',
      href: '/admin/contenido#section-copy',
      ctaLabel: 'Completar portada',
      items: ['hero-copy', 'hero-image'],
      doneMessage: 'La portada ya se ve clara y profesional.',
    },
    {
      id: 'products',
      navLabel: 'Producto',
      title: 'Carga tu primer producto',
      description: 'Solo nombre y precio. Lo importante aca es que ya haya algo real para mostrar.',
      href: '/admin/productos/nuevo',
      ctaLabel: 'Agregar producto',
      items: ['products'],
      doneMessage: 'Tu tienda ya tiene algo concreto para vender.',
    },
    {
      id: 'style',
      navLabel: 'Estilo',
      title: 'Elige un estilo inicial',
      description: 'Selecciona un preset visual para que la tienda se vea lista. Despues puedes cambiar todo.',
      href: '/admin/apariencia',
      ctaLabel: 'Elegir estilo',
      items: ['style'],
      doneMessage: 'La tienda ya se ve lista para mostrarse.',
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
        : 'Este paso ya esta listo y deja a la tienda un poco mas cerca de poder compartirse.',
      doneMessage: step.doneMessage,
    }
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
