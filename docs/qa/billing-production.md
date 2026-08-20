# VOLTA Billing — checklist de producción

La integración usa **suscripciones de Mercado Pago sin plan asociado** y checkout alojado por Mercado Pago. VOLTA no recibe ni guarda datos de tarjeta.

## Modelo comercial

- ARS 15.000 por mes durante los primeros 3 cobros aprobados.
- Desde el cuarto cobro: ARS 30.000 por mes.
- Una sola suscripción por tienda.
- Cancelación disponible desde el admin.
- La tienda no se suspende automáticamente por estado de facturación en esta etapa.

## Variables privadas

Configurar en producción y preview cuando corresponda:

```env
MERCADO_PAGO_ACCESS_TOKEN=...
MERCADO_PAGO_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://www.voltastore.app
```

Nunca exponer `MERCADO_PAGO_ACCESS_TOKEN` ni `MERCADO_PAGO_WEBHOOK_SECRET` con prefijo `NEXT_PUBLIC_`.

## Webhook

URL:

```text
https://www.voltastore.app/api/billing/mercado-pago/webhook
```

Habilitar como mínimo:

- `subscription_preapproval`
- `subscription_authorized_payment`

También puede habilitarse `payment` según la configuración de la cuenta. VOLTA sólo procesa los tópicos de suscripción que necesita.

La ruta valida `x-signature` con HMAC-SHA256, `x-request-id` y `data.id` antes de consultar a Mercado Pago.

## Smoke test recomendado

1. Abrir `/admin/plan` con un comercio de prueba.
2. Confirmar que el estado inicial sea `Sin activar`.
3. Activar con Mercado Pago y completar el checkout con una cuenta de prueba o flujo controlado.
4. Confirmar estado `Activo` después del webhook o de `Actualizar estado`.
5. Confirmar que un cobro autorizado aparece una sola vez en `Últimos cobros` aunque el webhook se reintente.
6. Confirmar que después del tercer cobro aprobado el importe recurrente pasa de ARS 15.000 a ARS 30.000.
7. Cancelar y confirmar estado `Cancelado` en VOLTA y Mercado Pago.

## Guardrails

- RLS: el propietario sólo puede leer su propia facturación.
- Escrituras: service role únicamente, siempre después de autenticar al propietario o validar el webhook.
- `billing_claim_checkout` serializa intentos concurrentes y evita crear checkouts duplicados desde VOLTA.
- Los movimientos usan identificadores únicos del proveedor para tolerar reintentos de webhook.
- Errores del proveedor no apagan la tienda.
