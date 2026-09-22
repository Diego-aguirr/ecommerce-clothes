# 03 — Orders (Órdenes)

## Nombre
Sistema de Órdenes

## Función
Gestiona la creación, consulta y gestión de órdenes de compra. Incluye la creación atómica con decremento de stock, snapshots de precio, y estados de entrega.

## Importancia
🔴 **CRÍTICO** — Las órdenes son la transacción principal del negocio.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/order.service.ts` | Crear órdenes, obtener por usuario/ID, paginación |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/order/place-order.ts` | Crear orden (orquestador principal) |
| `src/actions/order/get-order-by-id.ts` | Obtener orden por ID |
| `src/actions/order/get-orders-by-user.ts` | Órdenes del usuario |
| `src/actions/admin/orders.ts` | Gestión admin de órdenes |

### Pages
| Ruta | Función |
|------|---------|
| `(shop)/orders/page.tsx` | Lista de órdenes del usuario |
| `(shop)/orders/[id]/page.tsx` | Detalle de orden |
| `admin/orders/page.tsx` | Lista admin de órdenes |
| `admin/orders/[id]/page.tsx` | Detalle admin de orden |

### Modelos Relacionados
- `Order` — Órdenes con totales, estados, método de envío
- `OrderItem` — Items con snapshot de precio y talla
- `OrderAddress` — Dirección snapshot de la orden

## Estados de Orden

| Estado | Significado |
|--------|-------------|
| `pending` | Creada, esperando pago |
| `paid` | Pago confirmado |
| `cancelled` | Cancelada |

## Estados de Entrega

| Estado | Significado |
|--------|-------------|
| `pending` | Esperando envío |
| `shipped` | Enviada |
| `delivered` | Entregada |

## Métodos de Envío

| Método | Significado |
|--------|-------------|
| `delivery` | Envío a domicilio (requiere dirección) |
| `pickup` | Retiro en local (dirección opcional) |

## Flujo de Creación

```
1. Usuario confirma checkout
2. action place-order.ts
3. Validar sesión (requireSession)
4. Validar items con Zod
5. order.service.ts → crear Order + OrderItem + OrderAddress
6. Crear Payment (status: CREATED)
7. Decrementar stock atómicamente
8. Registrar StockMovement por cada item
9. Crear preferencia de MercadoPago
10. Retornar init_point (URL de pago)
```

## Snapshot de Precio

Los `OrderItem` guardan:
- `productName`: Nombre al momento de compra
- `productDescription`: Descripción al momento de compra
- `price`: Precio al momento de compra
- `size`: Talla al momento de compra
- `color`: Color al momento de compra

Esto asegura que si el precio del producto cambia después, la orden mantiene el precio original.

## Token de Idempotencia

`Order.idempotencyToken` previene órdenes duplicadas. Si el mismo token se envía dos veces, se retorna la orden existente.

## Requiere Revisión

- [ ] Verificar que el decremento de stock sea atómico (no double decrement)
- [ ] Testear flujo completo: crear orden → pago → confirmación
- [ ] Revisar que pickup no requiera dirección completa
- [ ] Confirmar que los snapshots de precio sean correctos
- [ ] Verificar que el idempotency token funcione

## Bugs Conocidos y Resueltos

- **Empty strings en pickup**: Cuando shippingMethod era "pickup", los campos de dirección eran strings vacíos en vez de null → se corrigió con conversión explícita
- **Double stock decrement**: Al cambiar variantes, el stock se decrementaba dos veces
