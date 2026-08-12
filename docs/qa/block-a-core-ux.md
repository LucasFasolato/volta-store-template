# Bloque A — Core UX QA

Estado: listo para validación en rama `agent/block-a-core-ux`.

## Objetivo

Cerrar el flujo principal de VOLTA STORE antes de sumar nuevas funcionalidades. La prioridad es que una persona no técnica pueda entender qué hacer, modificar datos y completar una compra sin ayuda.

## Criterios globales

- Una acción principal clara por pantalla.
- Sin scroll horizontal accidental.
- Touch targets de al menos 44px en acciones principales.
- Light y dark con contraste legible.
- Mobile diseñado como experiencia propia, no como desktop comprimido.
- Estados de guardado, error, vacío y carga visibles y en lenguaje simple.
- Ninguna acción irreversible sin confirmación explícita.
- El pedido no se pierde al abrir WhatsApp.

## Admin

### Navegación

- [x] Desktop: Resumen / Apariencia / Productos / Configuración.
- [x] Mobile: Inicio / Productos / Apariencia / Más.
- [x] Contraste aislado del light mode en sidebar y navegación mobile.
- [x] Item activo accesible con `aria-current`.

### Apariencia

- [x] Navegación interna horizontal en desktop.
- [x] Mobile: 4 + 4 opciones visibles sin scroll lateral.
- [x] Workspace sin overflow horizontal.
- [x] Controles y preview se apilan cuando el ancho no alcanza.
- [x] Guardado contextual cerca de la sección modificada.
- [x] El guardado contextual se resuelve por feedback real de éxito/error, no por un timeout optimista.
- [x] Uploads directos no generan un falso estado de “cambios sin guardar”.

### Imágenes

- [x] JPG / PNG / WebP.
- [x] Máximo 10 MB.
- [x] Mínimo 800px de ancho.
- [x] Error de archivo ilegible.
- [x] Estado de carga visible.
- [x] Se eliminó el control de “quitar” que no borraba realmente la imagen guardada.

### Productos

- [x] Buscador y filtros.
- [x] Estado vacío con CTA.
- [x] Vista mobile separada de la tabla desktop.
- [x] Eliminación con diálogo de confirmación.
- [x] Estados Activo / Oculto visibles.

## Storefront

### Catálogo

- [x] Cards táctiles con foco visible.
- [x] Filtros contenidos a su propia zona horizontal.
- [x] Empty state de catálogo/categoría.
- [x] Paginación con labels accesibles.

### Producto

- [x] Modal fullscreen real en mobile.
- [x] Escape/cierre y bloqueo de scroll del body.
- [x] Opciones obligatorias bloquean “Agregar” hasta completar selección.
- [x] Cantidad y total visibles.
- [x] Sin imagen tiene fallback legible.

### Pedido / carrito

- [x] Resumen del pedido legible.
- [x] Cantidades editables.
- [x] Quitar producto accesible.
- [x] Variantes visibles por línea.
- [x] CTA principal: “Continuar por WhatsApp”.
- [x] El carrito no se vacía automáticamente al abrir WhatsApp.
- [x] “Vaciar pedido” es una acción explícita separada.
- [x] Si el navegador bloquea la nueva ventana, el pedido se conserva y se muestra un error.
- [x] Bottom bar mobile respeta safe area.

### Footer / confianza

- [x] Copy orientado al cliente, sin jerga técnica.
- [x] Contacto, Instagram, dirección y horarios solo aparecen cuando existen.
- [x] WhatsApp se presenta como contacto; el pedido estructurado se envía desde el carrito.

## QA manual antes de merge a main

Hacer una sola pasada sobre el preview de la rama:

1. Login Google y magic link.
2. Onboarding nuevo.
3. Admin desktop light.
4. Admin desktop dark.
5. Admin mobile light.
6. Admin mobile dark.
7. Crear/editar producto simple.
8. Crear/editar producto con opciones.
9. Subir portada y producto con archivo válido e inválido.
10. Storefront desktop y mobile.
11. Producto simple → carrito.
12. Producto con opciones → selección obligatoria → carrito.
13. Cambiar cantidades y quitar líneas.
14. Continuar por WhatsApp y volver a la tienda: el pedido debe seguir disponible.
15. Vaciar pedido de forma explícita.
16. Revisar consola y errores de runtime.

## Fuera del Bloque A

No se incorporan analytics, QR, templates por rubro, checkout extendido ni nuevas funcionalidades de negocio. Esas mejoras pertenecen a los bloques siguientes.
