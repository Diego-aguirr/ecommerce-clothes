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
| ProductVariant | productId, sku, color, isActive | Búsquedas frecuentes |
| ProductColor | productId | Filtrado por producto |
| Order | userId, orderNumber | Búsquedas por usuario |
| OrderItem | orderId, productId, variantId | Joins frecuentes |
| Payment | orderId, providerPaymentId | Búsquedas por orden |

## Reglas de Importación

- **NUNCA** importar tipos de Prisma en componentes `.tsx`
- **NUNCA** importar `src/generated/prisma/` en actions
- **SIEMPRE** usar DTOs o interfaces propias
- **Services** son los ÚNICOS que importan Prisma

## Requiere Revisión

- [ ] Verificar que todos los índices estén optimizados para las queries frecuentes
- [ ] Revisar cascada de eliminación (onDelete: Cascade)
- [ ] Confirmar que los enums coincidan con los usados en código
- [ ] Verificar que no haya modelos sin uso
- [ ] Revisar que los campos DateTime tengan defaults correctos
