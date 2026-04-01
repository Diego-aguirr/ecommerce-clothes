# Guía de Flujo para Agentes - Sección Administrador

Este archivo resume las arquitecturas, decisiones y reglas establecidas durante el proceso de mejora de la sección de administración del e-commerce.

## 🏗️ Roles y Permisos
- El sistema cuenta con dos roles principales a nivel base de datos (`user` y `admin`). 
- Dentro de la configuración específica para la aplicación administrativa, se define la protección de `isSuperAdmin` mediante utilidades de autenticación (`requireAdmin`, `requireSuperAdmin`) ubicadas en `src/lib/admin/auth-utils.ts`.

## 📦 Base de Datos y Prisma (Sección Admin)
Durante esta sesión se mejoró la base de datos sin romper el modelo público de NextAuth, instaurando las siguientes características clave para los administradores:

1. **Logística vs. Financiero**: 
   - El estado de pago reside en `OrderStatus` (`pending`, `paid`, `cancelled`) y se asocia al checkout o confirmaciones de cobro de pasarela (ej. MercadoPago).
   - El estado de envío es totalmente independiente y reside en `DeliveryStatus` (`pending`, `shipped`, `delivered`).
   - Las manipulaciones del estado de envío en el panel de control se deben referenciar usando la Server Action correspondiente: `updateDeliveryStatus`.

2. **Control de Inventario (Stock Panel)**:
   - Todo movimiento de stock ejecutado desde el CMS y el panel de administración usa la función `adjustStock()`.
   - Estas actualizaciones del stock **obligatoriamente** crean un registro trazable en la tabla `StockMovement` (incluyendo `type`, `quantity` y `note`).

3. **Auditoría Estricta (Audit Panel)**:
   - Existe un logger imperativo de acciones atado a `src/lib/admin/audit-logger.ts` llamado `logAdminAction`.
   - El loger de auditoría ahora infiere la **entidad** (`entity`: "Order", "Product", "User", "System") dinámicamente según el nombre de la acción o se le puede pasar explícitamente en la metadata de `prisma.auditLog.create`.
   - La tabla de `AuditLog` permite visualizar fácilmente a los SuperAdmin quién (adminId) modificó qué elemento (targetId).

## 🚀 Server Actions vs. Client Components
Siguiendo la arquitectura `Server-First`:
- Se debe minimizar el uso de `'use client'` a la estricta necesidad interactiva.
- Formularios en la sección `admin` están enlazados directamente a `Server Actions` nativas (ej. `action={markAsShipped}`).

## 📌 Historial del Chat de esta sesión:
- Implementación de balance Prisma guardando soporte de Checkout Invitado (`sessionId`) e integrando metodos transaccionales limpios de stock y logs.
- Modificación directa a los archivos de Server Actions en lugar de mezclar lógica en los UI Components.
- Implementación del refactor desde subcarpetas previas hacia el dominio centralizado de `/admin`.

---

> **NOTA PARA FUTUROS AGENTES:** Siempre utilicen el enumerador `DeliveryStatus` para actualizaciones de fletes o logística, no extiendan el `OrderStatus`. Toda mutación importante en stock de recursos que requiera supervisión **debe** envolverse en un `logAdminAction()`.
