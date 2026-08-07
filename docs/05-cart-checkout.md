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
| `src/store/cart/store.ts` | Store Zustand del carrito |
| `src/store/cart/interface.ts` | Tipos del carrito |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/payment/create-preference.ts` | Crear preferencia de pago |
| `src/actions/address/get-user-address.ts` | Obtener direcciones del usuario |
| `src/actions/address/set-user-address.ts` | Guardar dirección |
| `src/actions/provincies/ensure-provinces.ts` | Asegurar que existan provincias |

### API Routes
| Archivo | Función |
|---------|---------|
| `src/app/api/checkout/start/route.ts` | Iniciar checkout |

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
6. action place-order.ts → crear orden + preferencia MP
7. Redirect a MercadoPago (init_point)
8. Usuario paga
9. Webhook confirma → redirige a /orders/[id]
```

## Carrito (Zustand)

- **Persistencia**: localStorage via persist middleware
- **Items**: Producto + variante + cantidad
- **Cálculo**: Subtotal, impuestos, envío, total
- **Acciones**: Add, remove, update quantity, clear

## Métodos de Envío

| Método | Costo | Dirección |
|--------|-------|-----------|
| `delivery` | Calculado por zona | Requerida |
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
