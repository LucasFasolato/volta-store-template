# Bloque B — Venta y medición

Estado: listo para validación en rama `agent/block-b-sales-growth`.

## Alcance

### Analytics simple
- Visitas de tienda.
- Productos vistos.
- Productos agregados al pedido.
- Aperturas del pedido.
- Continuaciones a WhatsApp.
- Conversión visita → WhatsApp.
- Producto más visto.
- Ventana fija: últimos 7 días.
- Sin filtros avanzados ni panel técnico.

### Compartir / publicar
- Estado de tienda claro: publicada o borrador.
- Copiar enlace.
- Ver tienda.
- Compartir por WhatsApp.
- Objetivo visible: primeras 10 visitas.

### QR
- QR automático de la URL pública.
- Descarga PNG.
- Pensado para mostrador, bolsas, vidriera e historias.
- Sin editor de QR ni opciones innecesarias.

### WhatsApp 2.0
- Nombre opcional según configuración del comercio.
- Retiro / envío opcional según configuración.
- Observaciones opcionales.
- Máximo tres decisiones simples.
- El pedido se conserva al abrir WhatsApp.
- WhatsApp recibe productos, variantes, cantidades, total y datos de coordinación.

### Confianza
- Vista clara en Configuración de los datos que generan confianza.
- WhatsApp, horarios, dirección e Instagram solo aparecen si existen.
- El storefront reutiliza esos datos como señales de confianza.

## Eventos

- `store_view`
- `product_view`
- `add_to_cart`
- `cart_open`
- `whatsapp_checkout`

Las visitas y vistas de producto se deduplican por sesión para evitar inflar métricas por navegación repetida.

## Migración requerida

Aplicar `supabase/migrations/20260812193000_sales_growth_foundations.sql` antes de validar persistencia de preferencias y Analytics en producción.

La aplicación degrada de forma segura si la migración todavía no fue aplicada: el storefront sigue funcionando y el dashboard muestra que las métricas aún no están disponibles.

## QA antes de merge

1. Aplicar la migración en Supabase.
2. Abrir una tienda publicada en incógnito.
3. Confirmar que una visita suma una sola vez en la sesión.
4. Abrir dos productos diferentes.
5. Agregar un producto simple.
6. Agregar un producto con variantes.
7. Abrir el pedido.
8. Completar nombre + retiro/envío + observación.
9. Continuar a WhatsApp y verificar el texto generado.
10. Volver a la tienda y confirmar que el pedido sigue guardado.
11. Revisar Resumen: métricas y producto más visto.
12. Probar Configuración con los tres toggles de pedido.
13. Desactivar cada toggle y validar que desaparece del pedido.
14. Completar/quitar dirección, horarios e Instagram y revisar señales de confianza.
15. Copiar enlace público.
16. Compartir por WhatsApp.
17. Escanear QR desde otro dispositivo.
18. Descargar QR.
19. Revisar desktop/mobile y light/dark del admin.
20. Revisar consola y errores de runtime.

## Fuera de alcance

- CRM.
- Órdenes internas.
- Pagos.
- Stock avanzado.
- Funnels configurables.
- Exportaciones de analytics.
- Cupones.
- Logística.
- VOLTA CHAT.
