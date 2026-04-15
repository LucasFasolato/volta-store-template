/**
 * System copy, internal and non-editable by store owners.
 * These strings define the structural UX language of the platform.
 */
export const COPY = {
  cart: {
    title: 'Tu pedido',
    addToCart: 'Agregar al carrito',
    quantity: 'Cantidad',
    total: 'Total',
    subtotal: 'Subtotal',
    empty: 'Tu carrito esta vacio',
    emptyDescription: 'Agrega productos para armar tu pedido y enviarlo por WhatsApp.',
    checkout: 'Pedir por WhatsApp',
    continueShopping: 'Seguir comprando',
    remove: 'Eliminar',
    checkoutUnavailable: 'Los pedidos por WhatsApp no estan disponibles en este momento.',
    item: 'articulo',
    items: 'articulos',
  },
  product: {
    viewProduct: 'Ver producto',
    featured: 'Productos destacados',
    catalog: 'Catalogo',
    allProducts: 'Todos los productos',
    noProducts: 'Estamos preparando el catalogo.',
    noProductsDescription:
      'Pronto vas a encontrar productos, precios y opciones para comprar por WhatsApp.',
    noProductsInCategoryDescription:
      'Prueba explorando otras secciones o vuelve al catalogo completo.',
    modalFallbackDescription:
      'Agregalo al carrito y seguimos la compra por WhatsApp con disponibilidad, opciones y entrega.',
    backToStore: 'Volver a la tienda',
    shareProduct: 'Compartir producto',
  },
  checkout: {
    greeting: 'Hola! Quiero hacer este pedido:',
    orderLabel: 'Pedido',
    dataLabel: 'Datos para coordinar',
    nameField: '- Nombre:',
    phoneField: '- Telefono:',
    addressField: '- Entrega o retiro:',
    notesField: '- Aclaraciones:',
    closing: 'Quedo atento a la confirmacion. Gracias!',
  },
  admin: {
    saved: 'Guardado',
    saving: 'Guardando...',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    newProduct: 'Nuevo producto',
    newCategory: 'Nueva categoria',
    published: 'Publicado',
    draft: 'Borrador',
    active: 'Activo',
    inactive: 'Inactivo',
    loadError: 'No pudimos guardar los cambios. Intenta nuevamente.',
  },
  errors: {
    generic: 'Ocurrio un error. Intenta de nuevo.',
    unauthorized: 'No tienes permiso para realizar esta accion.',
    notFound: 'No encontrado.',
  },
} as const
