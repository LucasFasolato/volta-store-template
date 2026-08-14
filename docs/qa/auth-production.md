# VOLTA Store — Auth production checklist

## Objetivo

Mantener toda la experiencia visible bajo la marca VOLTA, evitar que scanners de correo consuman enlaces de un solo uso y dejar Google OAuth con branding confiable.

## Flujo de email implementado

1. `signInWithOtp()` envía a una URL del origen real de la aplicación: `/auth/email?next=/admin&provider=email`.
2. El template agrega `token_hash` a esa URL.
3. `GET /auth/email` solo muestra una pantalla VOLTA. No verifica ni consume el token.
4. El usuario toca **Entrar a VOLTA**.
5. `POST /auth/email/confirm` ejecuta `verifyOtp({ token_hash, type: 'email' })`.
6. Si el token es válido, se crea/restaura la sesión, se ejecuta onboarding idempotente y se redirige al panel.

Esto separa el GET que puede visitar un scanner del POST voluntario que consume el token.

## Supabase — configuración requerida en producción

Proyecto: `zfugbeyixqaphkgfnkbb` (`volta-store`).

### URL Configuration

- **Site URL:** usar la URL canónica de producción de VOLTA Store.
- **Redirect URLs:** incluir la URL canónica con `/auth/callback` y `/auth/email`. Si se mantienen previews para QA, agregarlas de forma controlada según la política del proyecto.
- Verificar que `NEXT_PUBLIC_APP_URL` en Vercel apunte a la misma URL canónica. El flujo nuevo ya prioriza el host real de la request para evitar redirects a dominios viejos.

### Email Templates

En **Authentication → Email Templates**, reemplazar el contenido de **Magic Link** por `supabase/templates/volta-access.html` y usar:

- Subject: `Tu acceso a VOLTA Store`

Si el proyecto envía **Confirm signup** para usuarios nuevos, aplicar el mismo branding y el mismo patrón de enlace basado en `{{ .RedirectTo }}` + `{{ .TokenHash }}` para que el alta inicial tenga el mismo flujo seguro.

No volver a enlazar directamente `{{ .ConfirmationURL }}` desde el botón principal: ese endpoint consume el token en un GET y puede ser abierto antes por scanners de correo.

### SMTP

Antes de apertura pública, configurar SMTP propio con un dominio de VOLTA.

Objetivo recomendado:

- Sender name: `VOLTA`
- Sender email: una casilla del dominio oficial (por ejemplo `acceso@<dominio-volta>`)
- SPF y DKIM válidos en el proveedor de correo.
- Desactivar link tracking/rewrite para emails de autenticación.

## Google OAuth — configuración requerida

En **Google Auth Platform**:

- App name: `VOLTA`
- Support email: cuenta oficial de VOLTA
- Logo: logo oficial
- Homepage: dominio oficial
- Privacy policy: página pública del dominio oficial
- Terms of service: página pública del dominio oficial
- Authorized domains: dominio oficial de VOLTA
- Scopes: mantener únicamente los necesarios para login (`openid`, email, profile)
- Enviar branding a verificación cuando Google lo solicite.

En el OAuth Client Web:

- Authorized JavaScript origin: dominio oficial de VOLTA Store.
- Authorized redirect URI actual: `https://zfugbeyixqaphkgfnkbb.supabase.co/auth/v1/callback`.
- Cuando se active custom domain de Supabase, agregar primero también su callback antes de activarlo.

## Custom domain de Supabase

Para eliminar `zfugbeyixqaphkgfnkbb.supabase.co` de la pantalla de consentimiento, configurar un custom domain de Supabase, idealmente `auth.<dominio-volta>` o `api.<dominio-volta>`.

Orden seguro:

1. Crear el CNAME/TXT que indique Supabase.
2. Verificar el dominio en Supabase.
3. Agregar `https://auth.<dominio-volta>/auth/v1/callback` al OAuth Client de Google sin quitar todavía el callback viejo.
4. Activar el custom domain en Supabase.
5. Probar Google OAuth de punta a punta.
6. Recién después decidir si se retira el callback viejo.

## QA de aceptación

### Email

- Solicitar acceso con un usuario existente.
- Confirmar que el remitente y asunto sean VOLTA.
- Confirmar que el botón abre `/auth/email` y todavía muestra **Entrar a VOLTA**.
- Recargar esa página antes de tocar el botón: el token debe seguir válido.
- Tocar **Entrar a VOLTA** una vez: debe abrir `/admin` o `/onboarding`.
- Volver a usar exactamente el mismo correo: debe mostrar el error de link usado/vencido.
- Solicitar dos emails y comprobar que se use el más reciente.
- Probar Gmail en iPhone/Safari y Gmail/Chrome desktop.

### Google

- Abrir login en incógnito.
- Tocar **Continuar con Google**.
- Verificar nombre/logo VOLTA en la pantalla de Google.
- Tras custom domain, verificar que no aparezca el project ref aleatorio como identidad principal.
- Completar login y confirmar llegada a `/admin` o `/onboarding`.

### Regresión

- Cerrar sesión y volver a entrar con Google.
- Cerrar sesión y volver a entrar por email.
- Verificar que usuarios existentes con tienda no creen una segunda tienda.
- Verificar que errores de callback vuelvan a `/login` con feedback legible.
