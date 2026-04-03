# Volta Store

Plataforma multi-tenant de ventas por WhatsApp. Cada cliente administra su propia tienda configurable con branding, catálogo y checkout vía WhatsApp.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** estricto
- **Tailwind CSS v4** + **shadcn/ui** (radix-nova)
- **Supabase** — Auth (magic link), Postgres, Storage, RLS
- **Zustand** — carrito con persistencia local
- **React Hook Form** + **Zod** — validaciones robustas
- **Framer Motion** — animaciones selectivas

---

## Requisitos

- Node.js 18+
- npm
- Proyecto en [Supabase](https://supabase.com)

---

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-org/volta-store-template
cd volta-store-template
npm install
```

### 2. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá los valores:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Base de datos

Ejecutá las migraciones en Supabase SQL Editor en este orden:

```
supabase/migrations/20240101000001_schema.sql
supabase/migrations/20240101000002_rls.sql
supabase/migrations/20240101000003_storage.sql
supabase/migrations/20240101000004_onboarding.sql
```

O con la CLI de Supabase:

```bash
supabase db push
```

### 4. Configurar autenticación

En el panel de Supabase → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`

Para producción, reemplazá `localhost:3000` con tu dominio real.

### 5. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## Arquitectura

```
src/
├── app/
│   ├── (public)/
│   │   └── tienda/[slug]/       # Landing pública de cada store
│   ├── admin/                   # Panel admin (protegido)
│   │   ├── page.tsx             # Dashboard / resumen
│   │   ├── apariencia/          # Tema + layout
│   │   ├── contenido/           # Hero y textos
│   │   ├── productos/           # CRUD productos
│   │   ├── categorias/          # CRUD categorías
│   │   └── configuracion/       # Info del negocio
│   ├── auth/callback/           # Callback de magic link
│   └── login/                   # Página de acceso
│
├── components/
│   ├── admin/                   # Componentes del panel admin
│   ├── auth/                    # Login form
│   ├── cart/                    # CartSheet (Zustand)
│   ├── common/                  # CharCounter, SaveButton
│   ├── landing/                 # Hero, Catálogo, Footer
│   └── product/                 # ProductCard, ProductModal
│
├── lib/
│   ├── actions/                 # Server actions (auth, store, products)
│   ├── queries/                 # Queries de solo lectura
│   ├── stores/                  # Zustand (carrito)
│   ├── supabase/                # Clients (browser, server, proxy)
│   ├── utils/                   # format, theme
│   ├── validations/             # Schemas Zod
│   └── whatsapp/                # Builder de mensaje y URL wa.me
│
├── data/
│   ├── defaults.ts              # Valores por defecto de tema/layout/content
│   └── system-copy.ts           # Textos del sistema (no editables por usuarios)
│
└── types/
    ├── database.ts              # Tipos de la base de datos Supabase
    └── store.ts                 # Tipos de dominio
```

---

## Multi-tenant

Cada usuario autenticado tiene exactamente **una store** asociada vía `owner_id`. El acceso está restringido por RLS: los admins solo pueden ver y modificar su propia data, mientras que la landing pública puede leer stores activas sin auth.

### Onboarding automático

En el primer login (callback de magic link), el sistema:
1. Crea un `profile`
2. Crea una `store` con slug único derivado del email
3. Inserta `store_theme`, `store_layout` y `store_content` con valores por defecto
4. Redirige a `/admin`

---

## Theming dinámico

Cada store aplica su tema via **CSS custom properties** inyectadas inline en el wrapper del store:

```css
--store-primary      → color principal (botones, precios)
--store-secondary    → color de acento (badges, highlights)
--store-bg           → fondo de la tienda
--store-text         → texto principal
--store-radius       → border radius global
--store-image-ratio  → aspect ratio de imágenes de productos
```

Esto permite que cada tienda tenga su propia identidad visual sin afectar el resto de la app.

---

## Guardrails de contenido

Los textos configurables tienen límites estrictos para proteger el diseño:

| Campo                      | Máximo |
|---------------------------|--------|
| hero_title                | 45 caracteres |
| hero_subtitle             | 110 caracteres |
| support_text              | 60 caracteres |
| product_name              | 55 caracteres |
| product_short_description | 90 caracteres |
| product_description       | 280 caracteres |
| badge                     | 18 caracteres |
| category_name             | 24 caracteres |

Los textos del sistema (labels de carrito, CTAs, etc.) viven en `src/data/system-copy.ts` y no son editables por los usuarios.

---

## Storage

Imágenes almacenadas en Supabase Storage, bucket `store-assets`, organizadas por usuario:

```
store-assets/
└── {userId}/
    ├── logo.jpg
    ├── hero.jpg
    └── products/
        └── {productId}/
            └── {timestamp}.jpg
```

Validaciones en el cliente: mínimo 800px de ancho, formatos JPG/PNG/WebP, máximo 10MB.

---

## WhatsApp checkout

Al confirmar el pedido se construye un mensaje estructurado y se abre `wa.me/{numero}?text={mensaje}`:

```
Hola, quiero confirmar este pedido:

🛒 Pedido
- Producto A x2 — $20.000
- Producto B x1 — $8.500

Subtotal: $28.500

Datos:
- Nombre:
- Teléfono:
- Dirección / retiro:
- Aclaraciones:

Gracias.
```

Lógica centralizada en `src/lib/whatsapp/builder.ts`.

---

## Desarrollo

```bash
npm run dev      # Desarrollo con Turbopack
npm run build    # Build de producción
npm run lint     # Lint con ESLint
```

---

## Deploy

La app puede desplegarse en **Vercel** con configuración zero:

1. Conectar el repo en Vercel
2. Agregar las variables de entorno
3. Actualizar las URLs de redirect en Supabase con el dominio de producción
