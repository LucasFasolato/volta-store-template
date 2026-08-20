# VOLTA Billing — accesos bonificados

## Objetivo

Permitir excepciones comerciales controladas (primeros clientes, beta, partners) sin crear ni mantener una suscripción recurrente.

## Seguridad

- `billing_access_overrides` no tiene privilegios para `anon` ni `authenticated`.
- Solo `service_role` puede leer o modificar overrides.
- El comerciante recibe únicamente el estado seguro necesario en `/admin/plan`; nunca ve notas internas ni quién otorgó la bonificación.
- El control interno vive en `/internal/billing` y requiere que el email autenticado esté incluido en `VOLTA_INTERNAL_ADMIN_EMAILS`.
- `startVoltaSubscription` vuelve a comprobar el override en servidor para impedir activar Mercado Pago desde una llamada manual.

## Variable interna

En Vercel configurar únicamente para producción (y preview si se desea probar):

```env
VOLTA_INTERNAL_ADMIN_EMAILS=admin@ejemplo.com,otro@ejemplo.com
```

Usar emails de cuentas reales de Supabase Auth. No exponer esta variable con prefijo `NEXT_PUBLIC_`.

## Comportamiento al bonificar

1. Si no existe suscripción recurrente, se activa el override inmediatamente.
2. Si existe una suscripción pendiente/activa/pausada, VOLTA primero exige que Mercado Pago confirme la cancelación.
3. Si Mercado Pago no confirma la cancelación, la bonificación no se aplica. Esto evita que una cuenta marcada como gratuita siga recibiendo cargos.
4. Se puede definir vencimiento o dejarlo sin fecha.
5. Al quitar la bonificación no se crea ninguna suscripción automáticamente. El comercio pasa a estado normal y decidirá cuándo activar su plan.

## Smoke test

1. Configurar `VOLTA_INTERNAL_ADMIN_EMAILS`.
2. Ingresar con esa cuenta y abrir `/internal/billing`.
3. Elegir una tienda sin suscripción y marcar `Bonificar`.
4. Abrir `/admin/plan` como propietario de esa tienda: debe mostrar `Bonificado`, importe `$0` y no mostrar botón de Mercado Pago.
5. Confirmar que una llamada a `startVoltaSubscription` devuelve que la cuenta ya tiene acceso bonificado.
6. Quitar la bonificación y confirmar que no se genera ningún cobro o checkout automáticamente.
7. Para una tienda con suscripción activa, confirmar que el grant solo se aplica después de que Mercado Pago acepte la cancelación.

`VOLTA_BILLING_ENFORCEMENT` queda preparado como feature flag para una etapa posterior. La existencia de esta épica no bloquea automáticamente tiendas actuales.
