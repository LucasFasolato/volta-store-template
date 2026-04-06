import type { AdminStoreData, Category, ProductWithImages } from '@/types/store'
import { sanitizePhoneNumber } from '@/lib/utils/format'
import { storeSlugSchema } from '@/lib/validations/store'

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
  id: 'contact' | 'hero' | 'products' | 'categories' | 'trust'
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

export function buildStoreLaunchPlan({
  storeData,
  categories,
  products,
}: {
  storeData: AdminStoreData
  categories: Category[]
  products: ProductWithImages[]
}): StoreLaunchPlan {
  const { store, content } = storeData
  const activeProducts = products.filter((product) => product.is_active)
  const hasValidSlug = storeSlugSchema.safeParse(store.slug).success
  const hasStoreName = store.name.trim().length >= 2
  const hasWhatsapp = sanitizePhoneNumber(store.whatsapp).length >= 8
  const hasHeroTitle = content.hero_title.trim().length > 0
  const hasHeroSubtitle = content.hero_subtitle.trim().length > 0
  const hasHeroCopy = hasHeroTitle && hasHeroSubtitle
  const hasHeroImage = Boolean(content.hero_image_url)
  const hasCategories = categories.length > 0
  const hasActiveProduct = activeProducts.length >= 1
  const hasThreeActiveProducts = activeProducts.length >= 3
  const hasInstagram = Boolean(store.instagram?.trim())
  const hasAddress = Boolean(store.address?.trim())
  const hasHours = Boolean(store.hours?.trim())

  const requiredItems = [
    buildItem({
      id: 'store-name',
      done: hasStoreName,
      title: 'Nombre del negocio',
      description: 'Ayuda a que tu tienda se entienda desde el primer vistazo.',
      href: '/admin/configuracion#section-identidad',
      ctaLabel: 'Editar nombre',
    }),
    buildItem({
      id: 'public-link',
      done: hasValidSlug,
      title: 'Enlace de tu tienda',
      description: 'Es la direccion que vas a compartir con tus clientes.',
      href: '/admin/configuracion#section-identidad',
      ctaLabel: 'Revisar enlace',
    }),
    buildItem({
      id: 'whatsapp',
      done: hasWhatsapp,
      title: 'WhatsApp listo para pedidos',
      description: 'Sin este dato no pueden abrir la conversacion para comprar.',
      href: '/admin/configuracion#section-contacto',
      ctaLabel: 'Cargar WhatsApp',
    }),
    buildItem({
      id: 'hero-copy',
      done: hasHeroCopy,
      title: 'Mensaje principal de la portada',
      description: 'Explica rapido que vendes y por que vale la pena mirar tu catalogo.',
      href: '/admin/contenido#section-copy',
      ctaLabel: 'Completar portada',
    }),
    buildItem({
      id: 'hero-image',
      done: hasHeroImage,
      title: 'Imagen principal',
      description: 'Agregar una imagen principal ayuda a que tu tienda se vea mas profesional.',
      href: '/admin/contenido#section-hero-image',
      ctaLabel: 'Subir imagen',
    }),
    buildItem({
      id: 'categories',
      done: hasCategories,
      title: 'Primera categoria',
      description: 'Ordena el catalogo y hace mas facil encontrar lo que buscan.',
      href: '/admin/categorias',
      ctaLabel: 'Crear categoria',
    }),
    buildItem({
      id: 'products',
      done: hasThreeActiveProducts,
      title: 'Minimo de productos activos',
      description: 'Con al menos tres productos la tienda se siente real y lista para compartir.',
      href: activeProducts.length > 0 ? '/admin/productos' : '/admin/productos/nuevo',
      ctaLabel: 'Agregar productos',
    }),
  ]

  const recommendedItems = [
    buildItem({
      id: 'instagram',
      done: hasInstagram,
      title: 'Instagram visible',
      description: 'Suma respaldo social y ayuda a que te reconozcan mas rapido.',
      href: '/admin/configuracion#section-contacto',
      ctaLabel: 'Agregar Instagram',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'address',
      done: hasAddress,
      title: 'Direccion o zona',
      description: 'Ubica mejor tu negocio y reduce dudas antes del primer mensaje.',
      href: '/admin/configuracion#section-contexto',
      ctaLabel: 'Agregar direccion',
      missingStatus: 'recommended',
    }),
    buildItem({
      id: 'hours',
      done: hasHours,
      title: 'Horarios de atencion',
      description: 'Mostrar horarios puede generar mas confianza y ordenar mejor las consultas.',
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
  const hardBlockersMissing =
    !hasStoreName ||
    !hasValidSlug ||
    !hasWhatsapp ||
    !hasHeroCopy ||
    !hasCategories ||
    !hasActiveProduct

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
      stateLabel: 'Borrador',
      headline: 'Todavia le faltan bases para compartirla',
      summary: 'Completa lo esencial y tu tienda va a quedar mucho mas clara y confiable para quien llegue por primera vez.',
    },
    almost_ready: {
      stateLabel: 'Casi lista',
      headline: 'Te faltan algunos puntos para publicarla con confianza',
      summary: 'La base ya esta armada. Ajusta lo que falta y vas a poder compartirla con mucha mas seguridad.',
    },
    ready: {
      stateLabel: 'Lista para compartir',
      headline: 'Tu tienda esta lista para compartir',
      summary: 'Ya tienes lo necesario para mostrarla con confianza y empezar a recibir pedidos por WhatsApp.',
    },
  } satisfies Record<
    StoreReadinessState,
    { stateLabel: string; headline: string; summary: string }
  >

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
      id: 'contact',
      navLabel: 'WhatsApp',
      title: 'Conecta tu WhatsApp',
      description: 'Sin este dato nadie puede escribirte para comprar. Es la pieza mas importante de toda la tienda.',
      href: '/admin/configuracion#section-contacto',
      ctaLabel: 'Cargar WhatsApp',
      skipLabel: 'Seguir despues',
      items: ['store-name', 'public-link', 'whatsapp'],
      doneMessage: 'Ya pueden encontrarte y escribirte directamente.',
    },
    {
      id: 'hero',
      navLabel: 'Portada',
      title: 'Arma tu portada',
      description: 'Lo primero que ve un cliente cuando entra. Un buen mensaje y una imagen hacen que se quede y recorra el catalogo.',
      href: '/admin/contenido#section-copy',
      ctaLabel: 'Editar portada',
      skipLabel: 'Seguir despues',
      items: ['hero-copy', 'hero-image'],
      doneMessage: 'Tu portada ya transmite quien sos y que ofreces.',
    },
    {
      id: 'products',
      navLabel: 'Productos',
      title: 'Carga tus primeros productos',
      description: 'Con al menos tres productos el catalogo se siente real y listo para que alguien lo recorra con ganas de comprar.',
      href: '/admin/productos/nuevo',
      ctaLabel: 'Agregar producto',
      skipLabel: 'Seguir despues',
      items: ['products'],
      doneMessage: 'Tu catalogo ya empezo. Podes agregar mas cuando quieras.',
    },
    {
      id: 'categories',
      navLabel: 'Categorias',
      title: 'Organiza el catalogo',
      description: 'Las categorias hacen que encontrar algo sea rapido y claro. Con una sola ya alcanza para empezar.',
      href: '/admin/categorias',
      ctaLabel: 'Crear categoria',
      skipLabel: 'Seguir despues',
      items: ['categories'],
      doneMessage: 'Tu tienda ya tiene estructura y es mucho mas facil de navegar.',
    },
    {
      id: 'trust',
      navLabel: 'Confianza',
      title: 'Suma datos de confianza',
      description: 'Instagram, direccion u horarios hacen que alguien que no te conoce confie mucho mas rapido antes de escribirte.',
      href: '/admin/configuracion#section-contexto',
      ctaLabel: 'Agregar informacion',
      skipLabel: 'Dejar para despues',
      items: ['instagram', 'address', 'hours'],
      doneMessage: 'Tu negocio ya transmite mucha mas confianza.',
    },
  ] as const satisfies Array<{
    id: ActivationFlowStep['id']
    navLabel: string
    title: string
    description: string
    href: string
    ctaLabel: string
    skipLabel?: string
    items: string[]
    doneMessage: string
  }>

  const allItems = [...plan.requiredItems, ...plan.recommendedItems]

  const mappedSteps: ActivationFlowStep[] = stepDrafts.map((step) => {
    const stepItemIds = step.items as readonly string[]
    const stepItems = allItems.filter((item) => stepItemIds.includes(item.id))
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
      skipLabel: isDone ? undefined : step.skipLabel,
      status: isDone ? 'done' : 'upcoming',
      completionText: `${doneCount}/${totalCount}`,
      hint: firstIncompleteItem
        ? firstIncompleteItem.description
        : 'Este paso ya esta listo y ayuda a que la tienda se vea mas completa.',
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
