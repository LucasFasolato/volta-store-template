# VOLTA Store

VOLTA Store es un SaaS de comercio configurable que permite a un negocio publicar una tienda profesional, administrar su catálogo y convertir intención de compra en un pedido estructurado por WhatsApp.

**Producción:** https://www.voltastore.app

## Producto actual

VOLTA Store está en producción y hoy incluye:

- Google OAuth + Magic Link;
- activación guiada del negocio hasta publicar/compartir;
- catálogo con categorías, marcas, múltiples imágenes, precios, promociones, opciones y disponibilidad;
- personalización visual y de contenido;
- storefront público por slug con historial seguro de slugs;
- búsqueda, filtros, ordenamiento y productos relacionados;
- carrito persistido en navegador;
- checkout configurable y handoff estructurado a WhatsApp;
- Share Engine y atribución de campañas;
- analytics comerciales para el merchant;
- planes Gratis, VOLTA y VOLTA PRO;
- billing SaaS mediante Mercado Pago;
- RLS, migrations versionadas y guardrails de ownership.

Los detalles de estado, deuda y próximos pasos **no se mantienen duplicados en este README**. La fuente operativa es el Product OS.

## VOLTA Product OS

Este repositorio opera bajo **VOLTA OS v1.0**.

Antes de desarrollar, empezar por:

1. [`AGENTS.md`](./AGENTS.md)
2. [`docs/CURRENT_STATE.md`](./docs/CURRENT_STATE.md)
3. [`docs/GUARDRAILS.md`](./docs/GUARDRAILS.md)
4. [`docs/ROADMAP.md`](./docs/ROADMAP.md)
5. [`docs/SYSTEM.md`](./docs/SYSTEM.md)

Otros contratos útiles:

- [`docs/PRODUCT.md`](./docs/PRODUCT.md) — definición del producto y alcance;
- [`docs/DEBT.md`](./docs/DEBT.md) — deuda material basada en evidencia;
- [`docs/decisions/`](./docs/decisions) — ADRs duraderos;
- [`volta.product.yaml`](./volta.product.yaml) — manifiesto machine-readable;
- [`docs/ai/`](./docs/ai) — auditoría/contexto histórico, no sustituto de la realidad actual.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres + Storage
- Zustand
- React Hook Form + Zod
- Vercel

## Arquitectura de alto nivel

```text
src/app                 rutas, landing, auth, admin y storefront
src/components/admin    experiencia merchant
src/components/landing  storefront público
src/components/product  detalle/product UI
src/components/cart     carrito/checkout
src/lib/actions         mutaciones y reglas server-side
src/lib/queries         read models
src/lib/server          contexto/ownership compartido
src/lib/analytics       medición comercial y atribución
src/lib/billing         acceso comercial y billing
src/lib/sharing         links/distribución
src/lib/supabase        clientes Supabase
supabase/migrations     schema, RLS y evolución de datos
```

Para arquitectura, contratos y hotspots actuales usar [`docs/SYSTEM.md`](./docs/SYSTEM.md), no este resumen.

## Desarrollo local

Requiere una versión moderna de Node.js compatible con Next.js 16 y acceso a la configuración Supabase correspondiente.

```bash
npm install
npm run dev
```

Las credenciales y valores de entorno viven fuera de Git. No copiar secretos a documentación, commits o ejemplos versionados.

### Base de datos

`supabase/migrations/` es la fuente de verdad estructural. Para una base conectada usar el flujo de Supabase CLI/migrations correspondiente; no reconstruir el sistema ejecutando manualmente sólo las migrations iniciales históricas.

## Quality gate

Para cambios relevantes:

```bash
npm run lint
npm run test
npm run build
```

Además, según el cambio, verificar auth/RLS, migrations, mobile/desktop, storefront, carrito, checkout WhatsApp, billing y producción siguiendo `AGENTS.md` y `docs/GUARDRAILS.md`.

## Seguridad

- un owner = una Store está protegido a nivel de base de datos;
- nunca confiar en `store_id`/ownership provisto por el cliente;
- RLS y migrations son parte del contrato del producto;
- `store-assets` usa media pública de storefront por decisión explícita, con escritura/borrado restringidos por ownership;
- operaciones destructivas de producción requieren aprobación humana según VOLTA OS.

## Deploy

`main` representa código listo para producción y el destino operativo es Vercel. Los cambios sensibles o significativos deben pasar por PR y verificación antes de integrarse.
