# 04 — Payments (Pagos)

## Nombre
Sistema de Pagos con MercadoPago

## Función
Gestiona la integración con MercadoPago: creación de preferencias de pago, procesamiento de webhooks, validación de firmas, y confirmación atómica de pagos con decremento de stock.

## Importancia
🔴 **CRÍTICO** — Sin pagos funcionales, no hay negocio.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/payment.service.ts` | Crear preferencias de pago |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/payment/create-preference.ts` | Crear preferencia de MercadoPago |

### API Routes
| Archivo | Función |
|---------|---------|
| `src/app/api/webhooks/mercadopago/route.ts` | Webhook de confirmación de pago |
| `src/app/api/checkout/start/route.ts` | Iniciar checkout |

### Config
| Archivo | Función |
|---------|---------|
| `src/lib/mercadopago.ts` | Cliente de MercadoPago |
| `src/lib/zod.ts` | Schema de validación del webhook |

### Components
| Archivo | Función |
|---------|---------|
| `src/components/mercadopago/MercadoPagoButton.tsx` | Botón de pago |

### Modelos Relacionados
- `Payment` — Registro de pago con estado y provider
- `PaymentLog` — Logs de eventos de pago

## Estados de Pago

| Estado | Significado |
|--------|-------------|
| `CREATED` | Pago creado, esperando |
| `PENDING` | En proceso |
| `APPROVED` | Aprobado y confirmado |
| `REJECTED` | Rechazado |
| `CANCELLED` | Cancelado |

## Flujo Completo de Pago

```
1. Usuario confirma checkout
2. Se crea Order + Payment (status: CREATED)
3. Se crea preferencia de MercadoPago
4. MercadoPago retorna init_point (URL de pago)
5. Usuario paga en MercadoPago
6. MercadoPago envía webhook a /api/webhooks/mercadopago
7. Webhook: verificar firma HMAC
8. Webhook: fetch estado real desde MP
9. Webhook: validar monto contra DB
10. Webhook: idempotencia (no duplicar)
11. Webhook: si APPROVED → transacción atómica:
    - Decrementar stock
    - Registrar StockMovement
    - Marcar orden como pagada
```

## Seguridad del Webhook

1. **Firma HMAC SHA256**: Verifica que el request viene de MercadoPago
2. **Timing-safe comparison**: Previene timing attacks
3. **Validación de monto**: Compara transaction_amount contra amount de DB
4. **Anti-fraude**: Solo procesa si status_detail es "accredited"
5. **Idempotencia**: updateMany con filtro de estado previene duplicados

## Estado

✅ **RESUELTO** — Todos los puntos de revisión verificados y corregidos.

## Bugs Corregidos

- **Double stock decrement**: El webhook ejecutaba decremento dos veces al cambiar variantes → resuelto con transacción atómica + idempotencia via `updateMany`.
- **Amount mismatch no logueado**: Los pagos con monto diferente se procesaban sin alerta → ahora crea `PaymentLog` con evento `amount_mismatch` y lanza error.
