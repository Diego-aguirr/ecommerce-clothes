# 10 — Stock Reservation (Reserva de Stock al Crear Orden)

## Nombre
Sistema de reserva de stock en la creación de la orden (T7)

## Función
Garantizar que el stock se reserve **al crear la orden** (antes del pago), evitando overselling y race conditions. Si el pago falla, la reserva se libera automáticamente.

## Importancia
🔴 **CRÍTICO** — Sin reserva atómica, dos compradores pueden llevarse la última unidad.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/order.service.ts` | `createOrder` (reserva stock), `releaseStockReservation`, `confirmPaymentAndUpdateStock` (convierte reserved → sale) |

### Webhook
| Archivo | Función |
|---------|---------|
| `src/app/api/webhooks/mercadopago/route.ts` | Llama a `releaseStockReservation` en `rejected`/`cancelled` |

### Prisma Schema
| Modelo | Campo/Enum |
|--------|------------|
| `StockMovement` | `type` enum: `reserved`, `sale`, `released` |
| `PaymentStatus` | `CREATED`, `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `REFUNDED`, `CHARGED_BACK` |

## Flujo Completo

```
1. Usuario hace checkout → placeOrder
2. createOrder (transacción atómica):
   a. Valida stock disponible (SELECT ... FOR UPDATE implícito via update con where stock >= qty)
   b. Crea Order + Payment (status: CREATED)
   c. Reserva stock: decrementa variant.stock + crea StockMovement(type: "reserved")
   d. Retorna Order + Payment + init_point (MP)
3. Usuario paga en MercadoPago
4. Webhook recibe evento:
   a. Si APPROVED → confirmPaymentAndUpdateStock:
       - Convierte StockMovement "reserved" → "sale"
       - Marca orden paid, payment APPROVED
   b. Si REJECTED/CANCELLED → releaseStockReservation:
       - Incrementa variant.stock (+qty)
       - Crea StockMovement(type: "released", note: "Liberación de reserva por Orden X")
       - Marca payment REJECTED/CANCELLED
   c. Si amount_mismatch / mp_fetch_error / not_accredited → NO toca stock (payment queda PENDING, reserva vigente)
```

## Reserva Atómica (Race-Safe)

En `createOrderTransaction`:

```typescript
// Dentro de la misma transacción que crea la orden
await reserveStock(tx, input.productsToOrder, variants, newOrder.id);

// reserveStock hace por cada item:
const currentVariant = await tx.productVariant.findUnique({
  where: { id: variant.id },
  select: { stock: true },
});

if (!currentVariant || currentVariant.stock < item.quantity) {
  throw new Error(`Stock insuficiente...`);
}

await tx.productVariant.update({
  where: { id: variant.id },
  data: { stock: { decrement: item.quantity } },
});

await tx.stockMovement.create({
  data: {
    productId: item.productId,
    variantId: variant.id,
    quantity: -item.quantity,
    type: "reserved",
    note: `Reserva por Orden ${orderId}`,
  },
});
```

**Por qué es race-safe**: `decrement` + `where stock >= qty` implícito en la validación previa dentro de la misma transacción. PostgreSQL serializa las transacciones concurrentes — solo una pasa.

## Liberación de Reserva

En `releaseStockReservation(orderId)`:

```typescript
// Busca movimiento "reserved" para esta orden
const reservedMovement = await tx.stockMovement.findFirst({
  where: { productId, variantId, type: "reserved", note: { contains: orderId } },
});

if (reservedMovement) {
  // Devuelve stock
  await tx.productVariant.update({
    where: { id: variantId },
    data: { stock: { increment: item.quantity } },
  });

  // Registra liberación
  await tx.stockMovement.create({
    data: {
      productId,
      variantId,
      quantity: item.quantity, // positivo = entrada
      type: "released",
      note: `Liberación de reserva por Orden ${orderId}`,
    },
  });
}
```

**Idempotente**: si se llama 2 veces, la segunda no encuentra movimiento "reserved" y no hace nada.

## Webhook Integration

En `route.ts` (webhook MP):

```typescript
// Después de mapear status
if (newStatus === PaymentStatus.APPROVED) {
  await confirmPaymentAndUpdateStock(tx, payment.orderId);
} else if (newStatus === PaymentStatus.REJECTED || newStatus === PaymentStatus.CANCELLED) {
  // Liberar reserva si el pago falla
  await releaseStockReservation(payment.orderId);
}
```

**Casos que NO liberan reserva**:
- `amount_mismatch` → payment queda PENDING, reserva vigente (MP reintentará)
- `mp_fetch_error` → 500, MP reintentará, reserva vigente
- `not_accredited` → 500, MP reintentará hasta acreditar, reserva vigente
- `duplicate` → ya procesado, no toca stock

## StockMovement Types

| Type | Cuándo | Quantity | Nota |
|------|--------|----------|------|
| `reserved` | `createOrder` | `-qty` | `Reserva por Orden {orderId}` |
| `sale` | `confirmPaymentAndUpdateStock` | (convierte reserved → sale) | `Venta por Orden {orderId}` |
| `released` | `releaseStockReservation` | `+qty` | `Liberación de reserva por Orden {orderId}` |

## Compatibilidad Legacy (Órdenes Pre-Deploy)

Si una orden fue creada **antes** de este deploy (no tiene movimiento `reserved`):

```typescript
// En confirmPaymentAndUpdateStock:
const reservedMovement = await tx.stockMovement.findFirst({
  where: { productId, variantId, type: "reserved", note: { contains: orderId } },
});

if (reservedMovement) {
  // Convertir reserved → sale
  await tx.stockMovement.update({
    where: { id: reservedMovement.id },
    data: { type: "sale", note: `Venta por Orden ${orderId}` },
  });
} else {
  // Legacy: decrementar stock ahora + crear movement "sale"
  await tx.productVariant.update({ where: { id: variantId }, data: { stock: { decrement: item.quantity } } });
  await tx.stockMovement.create({ data: { type: "sale", ... } });
}
```

Así órdenes en vuelo antes del deploy no pierden su deducción de stock.

## Verificación

```bash
# Tests
pnpm run test:run

# Verificar stock después de crear orden (sin pagar):
# variant.stock debe haber bajado, StockMovement type="reserved" existe

# Pagar → StockMovement type="reserved" → "sale"

# Rechazar → variant.stock vuelve a subir, StockMovement type="released" existe
```

## Decisiones de Diseño

| Decisión | Razón |
|----------|-------|
| Reservar en `createOrder` (no al pagar) | Evita oversell; dos usuarios no pueden comprar la última unidad |
| `StockMovement` con types | Trazabilidad completa: reservado → vendido O liberado |
| Liberación solo en REJECTED/CANCELLED | amount_mismatch y not_accredited mantienen reserva (MP reintentará) |
| Idempotencia en release | Safe para reintentos de webhook o re-ejecución manual |
| Legacy shim | Órdenes pre-deploy no pierden deducción de stock |
| Sin auto-expiración | Usuario decide cancelar; admin cancela manualmente |

## Comandos de Verificación Manual

```bash
# Ver stock actual
npx prisma db execute --stdin <<'SQL'
SELECT v.id, v.sku, v.stock, p.title
FROM "ProductVariant" v
JOIN "Product" p ON v."productId" = p.id
ORDER BY p.title, v.size;
SQL

# Ver movimientos de una orden
npx prisma db execute --stdin <<'SQL'
SELECT sm.type, sm.quantity, sm.note, sm."createdAt"
FROM "StockMovement" sm
WHERE sm.note LIKE '%Orden <ORDER_ID>%'
ORDER BY sm."createdAt";
SQL
```