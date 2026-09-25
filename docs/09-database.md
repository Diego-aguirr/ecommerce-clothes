# 09 — Database (Base de Datos)

## Nombre
Schema y Modelos de Datos

## Función
Define la estructura completa de la base de datos PostgreSQL con Prisma ORM. Incluye todos los modelos, relaciones, índices y enums.

## Importancia
🔴 **CRÍTICO** — Es la fuente de verdad de todos los datos.

## Archivos Involucrados

### Schema
| Archivo | Función |
|---------|---------|
| `prisma/schema.prisma` | Definición completa de modelos |

### Generated
| Archivo | Función |
|---------|---------|
| `src/generated/prisma/` | Cliente Prisma generado (nunca importar directamente) |

## Modelos y Relaciones

### Productos
```
Category (1) ──→ (N) Product
Product (1) ──→ (N) ProductVariant
Product (1) ──→ (N) ProductColor
Product (1) ──→ (N) ProductImage
Product (1) ──→ (N) StockMovement
ProductColor (1) ──→ (N) ProductColorImage
```

### Usuarios
```
User (1) ──→ (N) Account
User (1) ──→ (N) Session
User (1) ──→ (N) UserAddress
User (1) ──→ (N) Order
```

### Órdenes
```
User (1) ──→ (N) Order
Order (1) ──→ (N) OrderItem
Order (1) ──→ (1) OrderAddress
Order (1) ──→ (N) Payment
Payment (1) ──→ (N) PaymentLog
```

### Direcciones
```
Province (1) ──→ (N) UserAddress
Province (1) ──→ (N) OrderAddress
```

## Enums

| Enum | Valores | Uso |
|------|---------|-----|
| Size | XS, S, M, L, XL, XXL, XXXL, UNICO, AJUSTABLE | Tallas de productos |
| Gender | men, women, kid, unisex, outfits | Género del producto |
| Role | user, admin | Roles de usuario |
| UserStatus | ACTIVE, BLOCKED, DELETED | Estado de usuario |
| PaymentStatus | CREATED, PENDING, APPROVED, REJECTED, CANCELLED | Estado de pago |
| DeliveryStatus | pending, shipped, delivered | Estado de entrega |
| PaymentProvider | mercadopago, cash | Provider de pago |
| OrderStatus | pending, paid, cancelled | Estado de orden |
| ShippingMethod | delivery, pickup | Método de envío |

## Índices Importantes

| Modelo | Índice | Propósito |
|--------|--------|-----------|
| Product | gender | Filtrado por género |
| ProductVariant | `@@unique([productId, size, color])` + 4 índices simples (`productId`, `sku`, `color`, `isActive`) | Unicidad de variante y búsquedas frecuentes |
| ProductColor | productId | Filtrado por producto |
| Order | userId, orderNumber | Búsquedas por usuario |
| OrderItem | orderId, productId, variantId | Joins frecuentes |
| Payment | orderId, providerPaymentId | Búsquedas por orden |

## Reglas de Importación

Son **reglas objetivo**; hoy el código todavía las viola en varios lugares:

- **NUNCA** importar tipos de Prisma en componentes `.tsx` → hoy lo hacen `product-wizard.tsx`, `step-basic-data.tsx`, `edit-product-tabs.tsx`, `VariantForm.tsx`, `edit-product-form.tsx` y `(shop)/gender/[gender]/page.tsx`
- **NUNCA** importar `src/generated/prisma/` en actions → hoy lo hacen `actions/admin/orders.ts`, `actions/admin/products.ts`, `actions/admin/users.ts` y `actions/product/product-pagination.ts`
- **SIEMPRE** usar DTOs o interfaces propias
- **Services** deberían ser los **ÚNICOS** que importan Prisma → también lo hacen `api/webhooks/mercadopago/route.ts`, `api/checkout/start/route.ts`, `lib/admin/audit-logger.ts` y varias páginas de `app/admin/`

## Requiere Revisión

- [ ] Verificar que todos los índices estén optimizados para las queries frecuentes
- [ ] Revisar cascada de eliminación (onDelete: Cascade)
- [ ] Confirmar que los enums coincidan con los usados en código
- [ ] Verificar que no haya modelos sin uso
- [ ] Revisar que los campos DateTime tengan defaults correctos
