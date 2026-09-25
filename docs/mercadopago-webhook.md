# MercadoPago Webhook — Cómo confirmamos los pagos

Cuando un usuario paga en MercadoPago, MP nos manda un POST a `/api/webhooks/mercadopago` con el evento. Lo que sigue es una cadena de validaciones que se parece más a un control de seguridad que a un simple callback.

## 1. Seguridad primero — la firma

MP firma cada webhook con un secreto que tenemos en `MERCADOPAGO_WEBHOOK_SECRET`. Nosotros tomamos el body crudo, calculamos el HMAC SHA256 con nuestro secreto, y lo comparo contra el `x-signature` que viene en el header. Uso `timingSafeEqual` para que no sea vulnerable a timing attacks.

En **producción**: si la firma no coincide, rechazo con 401. Punto.
En **desarrollo**: si la firma no coincide, la salteo silenciosamente y sigo (no hay ningún `console.*` en el route) para poder testear con el sandbox de MP.

Detalle no obvio: si `MERCADOPAGO_WEBHOOK_SECRET` no está seteado, `verifySignature` devuelve `false` sin más → en producción TODOS los webhooks caen en 401, y en desarrollo todos pasan.

## 2. ¿Qué nos llegó?

Parseo el body con Zod (`webhookSchema`). Si el `type` no es `"payment"`, no me interesa — retorno 200 y listo. MP manda muchos tipos de eventos (merchant_orders, etc), pero nosotros solo nos importan los pagos.

## 3. ¿Qué dice MP del pago?

Acá viene lo importante: **no confío ciegamente en lo que me llega**. Hago un `Payment.get({ id })` para ir a buscar el estado REAL del pago directo a la API de MP. Por qué? Porque el webhook podría venir con datos viejos o incompletos. Si MP falla al responder, logueo el error y retorno `{ ok: true }` — esto es clave porque si retorno error, MP reintenta infinitas veces.

## 4. Busco el pago en mi DB

El `external_reference` que viene de MP es el ID de nuestro registro `Payment` en la DB. Con eso busco la orden asociada. Si no existe, logueo y respondo.

## 5. Validaciones de seguridad

- **Provider check**: verifico que el pago sea de MercadoPago (hardening contra payloads trucados)
- **Anti-fraude**: si el status es `"approved"` pero `status_detail` no es `"accredited"`, no proceso. Puede ser que MP diga "aprobado" pero el dinero aún no está liquidado
- **Validación de monto**: comparo `transaction_amount` de MP contra `amount` de mi DB. Si no coinciden, logueo `amount_mismatch` y tiro error. Esto detecta si alguien intentó pagar menos de lo que debe

## 6. Idempotencia — el truco más importante

Los webhooks de MP pueden llegar **más de una vez** para el mismo pago. Si proceso dos veces, decremento stock dos veces = cagada monumental.

La solución: uso `updateMany` con filtro `status: { in: [CREATED, PENDING] }`. Si el pago ya fue procesado antes, `count === 0` y me voy sin hacer nada. Es race-safe porque `updateMany` es atómico en PostgreSQL.

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
