# 05 — Cart & Checkout

## Nombre
Carrito de Compras y Flujo de Checkout

## Función
Gestiona el carrito persistente (client-side con Zustand) y el flujo completo de checkout: selección de dirección, revisión de items, y confirmación de orden.

## Importancia
🔴 **CRÍTICO** — Es el camino de conversión. Si falla, no hay venta.

## Archivos Involucrados

### Store (Client-side)
| Archivo | Función |
|---------|---------|
| `src/store/cart/cart-store.ts` | Store Zustand del carrito (único archivo en esa carpeta) |
| `src/interfaces/product.interface.ts` | Tipos del carrito (`CartProduct` desde `@/interfaces`) |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/payment/create-preference.ts` | Crear preferencia de pago |
| `src/actions/address/get-user-address.ts` | Obtener direcciones del usuario |
| `src/actions/address/set-user-address.ts` | Guardar dirección |
| `src/actions/provincies/get-provincies.ts` | Obtener/seedear provincias (seed automático vía `ensureProvincesExistService()` en `src/services/province.service.ts`) |

### API Routes
| Archivo | Función |
|---------|---------|
| `src/app/api/checkout/start/route.ts` | Gate de verificación de email (sesión + `emailVerified` → `{ ok: true }`). Sin callers — endpoint legacy |

### Pages
| Ruta | Función |
|------|---------|
| `(shop)/cart/page.tsx` | Carrito de compras |
| `(shop)/checkout/address/page.tsx` | Selección de dirección |
| `(shop)/checkout/(checkout)/page.tsx` | Resumen y confirmación |

### Components
| Archivo | Función |
|---------|---------|
| `src/app/(shop)/cart/ui/ProductIncard.tsx` | Item en el carrito |
| `src/app/(shop)/cart/ui/OrderSummary.tsx` | Resumen de la orden |
| `src/app/(shop)/checkout/(checkout)/ui/PlaceOrder.tsx` | Botón de confirmar |
| `src/app/(shop)/checkout/(checkout)/ui/OrderItems.tsx` | Items en checkout |
| `src/app/(shop)/checkout/(checkout)/ui/AddressDetails.tsx` | Detalle de dirección |
| `src/app/(shop)/checkout/address/ui/AddressForm.tsx` | Formulario de dirección |
| `src/components/ui/shipping-method-selector/ShippingMethodSelector.tsx` | Selector de envío |

## Flujo de Checkout

```
1. Usuario llena carrito (Zustand, persist en localStorage)
2. Clickea "Ir a checkout"
3. /checkout/address → seleccionar/guardar dirección
4. /checkout → resumen de items + dirección + totales
5. Clickea "Confirmar orden"
6. action place-order.ts → crear Order + Payment (status: CREATED) — NO crea preferencia MP
7. action payment/create-preference.ts → preferencia MP (init_point) — llamada después desde PlaceOrder.tsx
8. Redirect a MercadoPago (init_point)
9. Usuario paga
10. Webhook confirma el pago (nunca redirige) → el redirect sale de `back_urls.success` = `/orders/[id]?status=success`
    (efectivo/transferencia: `router.replace(/orders/[id])` en PlaceOrder.tsx)
```

## Carrito (Zustand)

- **Persistencia**: localStorage via persist middleware
- **Items**: Producto + variante + cantidad
- **Cálculo**: Subtotal, impuestos, total, items en carrito (`getSummaryInformation()` no calcula envío)
- **Acciones**: Add, remove, update quantity, clear

## Métodos de Envío

| Método | Costo | Dirección |
|--------|-------|-----------|
| `delivery` | $0 fijo — `shipping = 0` hardcodeado en `order.service.ts` → `calculateTotals()` | Requerida |
| `pickup` | Gratis | Opcional |

## Requiere Revisión

- [ ] Verificar que el carrito persista correctamente entre sesiones
- [ ] Testear cambio de dirección durante checkout
- [ ] Revisar que los totales se calculen correctamente (impuestos, envío)
- [ ] Confirmar que pickup no requiera dirección completa
- [ ] Verificar que el redirect a MercadoPago funcione
- [ ] Testear comportamiento al cancelar pago (volver al checkout)

## Bugs Conocidos y Resueltos

- **Empty strings en pickup**: Los campos de dirección eran "" en vez de null
- **Carrito no se limpiaba después de pago**: Se agregó limpieza post-confirmación
