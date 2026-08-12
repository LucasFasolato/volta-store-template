/**
 * System copy, internal and non-editable by store owners.
 * These strings define the structural UX language of the platform.
 */
export const COPY = {
  cart: {
    title: 'Tu pedido',
    addToCart: 'Agregar al pedido',
    quantity: 'Cantidad',
    total: 'Total',
    subtotal: 'Subtotal',
    empty: 'Tu pedido está vacío',
    emptyDescription: 'Agregá productos para armar tu pedido y enviarlo por WhatsApp.',
    checkout: 'Continuar por WhatsApp',
    continueShopping: 'Seguir comprando',
    remove: 'Quitar',
    checkoutUnavailable: 'Los pedidos por WhatsApp no están disponibles en este momento.',
    item: 'artículo',
    items: 'artículos',
  },
  product: {
    viewProduct: 'Ver producto',
    featured: 'Productos destacados',
    catalog: 'Catálogo',
    allProducts: 'Todos los productos',
    noProducts: 'Estamos preparando el catálogo.',
    noProductsDescription:
      'Pronto vas a encontrar productos, precios y opciones para comprar por WhatsApp.',
    noProductsInCategoryDescription:
      'Probá explorando otras secciones o volvé al catálogo completo.',
    modalFallbackDescription:
      'Agregalo al pedido y coordiná disponibilidad, opciones y entrega por WhatsApp.',
    backToStore: 'Volver a la tienda',
    shareProduct: 'Compartir producto',
  },
  checkout: {
    greeting: '¡Hola! Quiero hacer este pedido:',
    orderLabel: 'Pedido',
    dataLabel: 'Datos para coordinar',
    nameField: '- Nombre:',
    phoneField: '- Teléfono:',
    addressField: '- Entrega o retiro:',
    notesField: '- Aclaraciones:',
    closing: 'Quedo atento a la confirmación. ¡Gracias!',
  },
  admin: {
    saved: 'Guardado',
    saving: 'Guardando…',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    newProduct: 'Nuevo producto',
    newCategory: 'Nueva categoría',
    published: 'Publicado',
    draft: 'Borrador',
    active: 'Activo',
    inactive: 'Inactivo',
    loadError: 'No pudimos guardar los cambios. Intentá nuevamente.',
  },
  errors: {
    generic: 'Ocurrió un error. Intentá de nuevo.',
    unauthorized: 'No tenés permiso para realizar esta acción.',
    notFound: 'No encontrado.',
  },
} as const
