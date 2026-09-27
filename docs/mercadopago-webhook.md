# MercadoPago Webhook — Cómo confirmamos los pagos

Cuando un usuario paga en MercadoPago, MP nos manda un POST a `/api/webhooks/mercadopago` con el evento. Lo que sigue es una cadena de validaciones que se parece más a un control de seguridad que a un simple callback.

## 1. Seguridad primero — la firma

MP **no firma el body**: firma un *manifest* armado con valores del request. El secreto vive en `MERCADOPAGO_WEBHOOK_SECRET`, y con él calculo el HMAC SHA256 de ese manifest y lo comparo contra el campo `v1` del header `x-signature`. La comparación es timing-safe (`timingSafeEqual` sobre buffers de igual longitud, en UTF-8 de los dos strings hex) para que no sea vulnerable a timing attacks.

El header tiene pinta de `ts=1700000000,v1=<64 chars hex>`: `ts` es el timestamp de la notificación y `v1` es la firma. **Detalle crítico**: ese header NO es hex crudo — antes hacíamos `Buffer.from(x-signature, "hex")` sobre el header entero, eso devuelve 0 bytes, y la comparación nunca pasaba.

El manifest es la concatenación de los segmentos que tienen valor, cada uno como `key:value;` (el `;` final es parte del contrato), en este orden:

1. `id:{data.id};` — el valor sale del **query param `data.id` de la URL**, no del body. Si es alfanumérico, va en minúsculas antes de usarlo.
2. `request-id:{x-request-id};` — desde el header `x-request-id`. Si no está, se omite el segmento entero.
3. `ts:{ts};` — desde el campo `ts=` **dentro del header `x-signature`**, no del body. Si no está, se omite.

Si ningún segmento tiene valor, el manifest es la cadena vacía y el HMAC se calcula igual sobre `""` (nunca se saltea la verificación). Si falta `ts` o `v1` en el header, la firma es inválida. La implementación vive en `src/lib/mercadopago-signature.ts` (funciones puras, sin tocar la body) con tests en `src/lib/mercadopago-signature.test.ts`.

En **producción**: si la firma no coincide (o falta el secreto), rechazo con 401. Punto. *(fail-closed)*
En **desarrollo**: si la firma no coincide, la salteo silenciosamente y sigo (no hay ningún `console.*` en el route) para poder testear con el sandbox de MP. Este bypass es un contrato intencional y documentado.

Detalle no obvio: si `MERCADOPAGO_WEBHOOK_SECRET` no está seteado, `verifyMpSignature` devuelve `false` sin más → en producción TODOS los webhooks caen en 401, y en desarrollo todos pasan.

## 2. ¿Qué nos llegó?

Parseo el body con Zod (`webhookSchema`). Si el `type` no es `"payment"`, no me interesa — retorno 200 y listo. MP manda muchos tipos de eventos (merchant_orders, etc), pero nosotros solo nos importan los pagos.

## 3. ¿Qué dice MP del pago?

Acá viene lo importante: **no confío ciegamente en lo que me llega**. Hago un `Payment.get({ id })` para ir a buscar el estado REAL del pago directo a la API de MP. ¿Por qué? Porque el webhook podría venir con datos viejos o incompletos.

Si MP falla al responder, **no respondo 200**: la transacción devuelve un resultado discriminado (`mp_fetch_error`) y afuera escribo el log de forma duradera antes de responder **500**. El log tiene que ir fuera de la transacción: si lo escribo adentro, un throw posterior haría rollback y perdería el evento. Con 500, MP reintenta con backoff acotado (15 min → 96 h): el evento nunca se pierde y los reintentos son finitos. Antes respondíamos `{ ok: true }` y un fallo transitorio de MP dejaba el evento sin registrar para siempre.

La decisión (status HTTP + payload del log) vive en `src/lib/mercadopago-webhook-decision.ts` (`decideWebhookOutcome`), con tests puros en `src/lib/mercadopago-webhook-decision.test.ts` — el route solo arma los markers y escribe el log.

## 4. Busco el pago en mi DB

El `external_reference` que viene de MP es el ID de nuestro registro `Payment` en la DB. Con eso busco la orden asociada. Si no existe, logueo y respondo.

## 5. Validaciones de seguridad

- **Provider check**: verifico que el pago sea de MercadoPago (hardening contra payloads trucados)
- **Anti-fraude**: si el status es `"approved"` pero `status_detail` no es `"accredited"`, no proceso. Puede ser que MP diga "aprobado" pero el dinero aún no está liquidado. Escribo un log duradero `not_accredited` (con `paymentId`, `mpStatus` y `status_detail`) **fuera** de la transacción y respondo 500, para que MP reintente hasta que el dinero se acredite
- **Validación de monto**: comparo `transaction_amount` de MP contra `amount` de mi DB. Si no coinciden, logueo `amount_mismatch` y tiro error. Esto detecta si alguien intentó pagar menos de lo que debe

## 6. Idempotencia — el truco más importante

Los webhooks de MP pueden llegar **más de una vez** para el mismo pago. Si proceso dos veces, decremento stock dos veces = cagada monumental.

La solución: uso `updateMany` con filtro `status: { in: [CREATED, PENDING] }`. Si el pago ya fue procesado antes, `count === 0` y respondo 200 sin reprocesar. Es race-safe porque `updateMany` es atómico en PostgreSQL.

Detalle importante: **antes de responder 200**, escribo un log `duplicate` con el `providerPaymentId` **fuera** de la transacción. Así un doble cobro deja una traza consultable en la DB — antes el camino duplicado no escribía nada y un cobro doble era imposible de detectar.

## 7. La transacción atómica — todo o nada

Si el pago es `APPROVED`, ejecuto **una sola transacción de Prisma** que hace:

```
BEGIN;
  → Decremento stock de cada variante vendida
  → Registro StockMovement por cada item (trazabilidad)
  → Marco orden como isPaid: true, status: "paid"
COMMIT;
```

Si algo falla en el medio, **todo se revierte**. No queda una orden pagada sin stock decrementado, ni stock decrementado sin orden pagada.

## El bug que encontramos

Cuando implementamos variantes/colores, apareció un **double stock decrement**. Pasaba que al cambiar la variante de una orden, el flujo creaba una variante nueva y el decremento se ejecutaba dos veces. Se resolvió rastreando el flujo completo y asegurando que solo se ejecute una vez por transacción — el `isPaid` check al inicio de `confirmPaymentAndUpdateStock` actúa como guard de idempotencia a nivel de orden.

## Resumen

**validación criptográfica → fetch real desde MP → validación de monto → idempotencia → transacción atómica**

Cada capa protege un escenario distinto de fallo o fraude.
