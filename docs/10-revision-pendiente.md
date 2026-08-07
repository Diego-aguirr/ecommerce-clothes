# Revisión Pendiente — Áreas que Requieren Atención

## Resumen

| Dominio | Estado | Prioridad | Acciones Requeridas |
|---------|--------|-----------|---------------------|
| Auth | ⚠️ Parcial | Alta | Verificar auto-link en producción, testear recuperación contraseña |
| Products | ⚠️ Parcial | Alta | Verificar stock en órdenes, QuickAddToCart con labels |
| Orders | ⚠️ Parcial | Alta | Testear decremento atómico, pickup sin dirección |
| Payments | ✅ Resuelto | Baja | Implementación completa verificada |
| Cart & Checkout | ⚠️ Parcial | Alta | Persistencia de carrito, totales, redirect a MP |
| Admin | ⚠️ Parcial | Media | CRUD completo, AuditLog, dashboard stats |
| Addresses | 🟡 Baja | Baja | Snapshot en OrderAddress, seed de provincias |
| Uploads | 🟡 Baja | Baja | Upload y eliminación en Cloudinary |
| Database | ✅ Estable | Baja | Optimización de índices, cascadas |

## Acciones Críticas (Hacer primero)

### 1. Payments — Flujo Completo End-to-End ✅ RESUELTO
- [x] Verificar que `MERCADOPAGO_WEBHOOK_SECRET` esté configurado en producción
- [x] Testear flujo completo: crear preferencia → pagar → webhook → confirmación
- [x] Verificar que la firma HMAC funcione (no estar en modo dev)
- [x] Confirmar que los PaymentLog se creen correctamente
- [x] Testear comportamiento cuando MP falla al responder

### 2. Orders — Decremento Atómico
- [ ] Verificar que el stock se decrementa una sola vez por orden
- [ ] Testear que la transacción se revierta si falla algo
- [ ] Confirmar que pickup no requiera dirección completa
- [ ] Verificar que los snapshots de precio sean correctos

### 3. Auth — Producción
- [ ] Verificar que el auto-link de Google OAuth funcione
- [ ] Testear flujo completo de recuperación de contraseña
- [ ] Confirmar que el email de verificación se envíe
- [ ] Revisar que `isSuperAdmin` esté protegido

## Acciones Secundarias (Hacer después)

### 4. Products — QuickAddToCart
- [ ] Verificar que muestre labels de color legibles (no "gris_melange")
- [ ] Testear que el toggle de variantes funcione
- [ ] Revisar paginación con filtros combinados

### 5. Cart & Checkout
- [ ] Verificar persistencia del carrito entre sesiones
- [ ] Testear cambio de dirección durante checkout
- [ ] Confirmar que los totales se calculen correctamente

### 6. Admin
- [ ] Verificar que `requireAdmin()` proteja todas las rutas
- [ ] Testear CRUD completo de productos con variantes
- [ ] Confirmar que los AuditLog se creen

### 7. Database
- [ ] Revisar cascada de eliminación
- [ ] Verificar que los índices cubran las queries frecuentes
- [ ] Confirmar que no haya modelos sin uso

## Áreas sin Testing

El proyecto actualmente NO tiene test runner configurado (ni Jest, Vitest, Playwright, Cypress).

**Recomendación**: Configurar al menos:
- **Vitest** para unit tests de services
- **Playwright** para E2E tests del flujo de compra

## Bugs Conocidos No Resueltos

Ninguno documentado actualmente. Los bugs encontrados fueron resueltos:
- OAuthAccountNotLinked (auto-link)
- Double stock decrement (idempotencia)
- Empty strings en pickup (conversión a null)
- QuickAddToCart con strings crudos de DB

## Próximos Pasos

1. ~~Priorizar la verificación de pagos en producción~~ ✅
2. Configurar testing framework
3. Completar los tests pendientes
4. Revisar performance de queries (índices faltantes)
