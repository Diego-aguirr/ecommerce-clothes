# Guía de Flujo para Agentes - Sección Administrador

Este archivo resume las arquitecturas, decisiones y reglas establecidas durante el proceso de mejora de la sección de administración del e-commerce.

## Arquitectura de Capas

```
UI (Admin Pages)
  │
  ▼
Actions (admin/*)
  • Auth (requireAdmin, requireSuperAdmin)
  • Zod validation
  • Error handling
  │
  ▼
Services (services/)
  • Business logic
  • Prisma queries
  • server-only enforced
  │
  ▼
Prisma → PostgreSQL
```

### Flujo de Control

1. **UI** llama a Server Action (ej: `updateProduct()`)
2. **Action** verifica auth → valida input → llama a service
3. **Service** ejecuta lógica de negocio + queries Prisma
4. **Action** retorna `{ ok: true, data }` o `{ ok: false, error }`
5. **UI** muestra resultado

## Roles y Permisos

- El sistema cuenta con dos roles principales a nivel base de datos (`user` y `admin`).
- Dentro de la configuración específica para la aplicación administrativa, se define la protección de `isSuperAdmin` mediante utilidades de autenticación (`requireAdmin`, `requireSuperAdmin`) ubicadas en `src/lib/admin/auth-utils.ts`.

## Base de Datos y Prisma (Sección Admin)

1. **Logística vs. Financiero**:
   - El estado de pago reside en `OrderStatus` (`pending`, `paid`, `cancelled`) y se asocia al checkout o confirmaciones de cobro de pasarela (ej. MercadoPago).
   - El estado de envío es totalmente independiente y reside en `DeliveryStatus` (`pending`, `shipped`, `delivered`).
   - Las manipulaciones del estado de envío se realizan desde `order.service.ts` → `updateDeliveryStatus`.

2. **Control de Inventario (Stock Panel)**:
   - Todo movimiento de stock usa `product.service.ts` → `adjustStock()`.
   - Estas actualizaciones crean registros trazables en `StockMovement`.

3. **Auditoría Estricta (Audit Panel)**:
   - Logger de auditoría en `src/lib/admin/audit-logger.ts` → `logAdminAction`.
   - La tabla `AuditLog` permite visualizar quién (adminId) modificó qué elemento (targetId).

## Server Actions vs. Client Components

Siguiendo la arquitectura Server-First:
- Se debe minimizar el uso de `'use client'` a la estricta necesidad interactiva.
- Formularios enlazados directamente a Server Actions nativas.
- Las Actions delegan a services/ para lógica de negocio.

## Archivos Clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `actions/admin/*.ts` | Thin orchestrators (auth + validación + delegación) |
| `services/order.service.ts` | Lógica de órdenes (createOrder, updateStatus, etc.) |
| `services/product.service.ts` | Lógica de productos (CRUD, stock, paginación) |
| `services/user.service.ts` | Lógica de usuarios (toggleBlock, updateRole) |
| `services/category.service.ts` | Lógica de categorías (CRUD) |
| `services/color.service.ts` | Lógica de colores (CRUD) |
| `services/variant.service.ts` | Lógica de variantes (CRUD) |
| `components/admin/dashboard/` | Dashboard components |
| `components/admin/products/` | Product management components |
| `components/admin/ui/` | Admin-specific UI components |
| `lib/admin/auth-utils.ts` | Guards requireAdmin() + requireSuperAdmin() |
| `lib/admin/audit-logger.ts` | Logger de acciones admin (AuditLog) |

---

> **NOTA PARA FUTUROS AGENTES:** Siempre utilicen el enumerador `DeliveryStatus` para actualizaciones de fletes o logística, no extiendan el `OrderStatus`. Toda mutación importante debe delegarse a services/ que ejecuta queries Prisma.
