# 07 — Addresses (Direcciones)

## Nombre
Sistema de Direcciones y Provincias

## Función
Gestiona las direcciones guardadas de los usuarios y el catálogo de provincias argentinas. Las direcciones se usan en el checkout y se copian a la orden como snapshot.

## Importancia
🟡 **MEDIO** — Funcional pero no crítico para el negocio.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/address.service.ts` | CRUD direcciones del usuario |
| `src/services/province.service.ts` | Gestión de provincias |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/address/get-user-address.ts` | Obtener direcciones del usuario |
| `src/actions/address/set-user-address.ts` | Crear/editar dirección |
| `src/actions/address/delete-user-address.ts` | Eliminar dirección |
| `src/actions/provincies/get-provincies.ts` | Obtener provincias (seed automático vía `ensureProvincesExistService()` en `province.service.ts`) |

### Pages
| Ruta | Función |
|------|---------|
| `(shop)/profile/page.tsx` | Perfil (nombre, email, rol, id, expiración de sesión) — sin UI de direcciones |
| `(shop)/checkout/address/page.tsx` | Selección de dirección (única UI para gestionar direcciones) |

### Components
| Archivo | Función |
|---------|---------|
| `src/app/(shop)/checkout/address/ui/AddressForm.tsx` | Formulario de dirección |

### Modelos Relacionados
- `UserAddress` — Direcciones guardadas del usuario
- `Province` — Provincias argentinas
- `OrderAddress` — Snapshot de dirección en la orden

## Estructura de Dirección

```typescript
{
  fullname: string,      // Nombre completo
  street?: string,       // Calle
  apartment?: string,    // Departamento
  zip?: string,          // Código postal
  city?: string,         // Ciudad
  phone: string,         // Teléfono
  dni: string,           // DNI
  description?: string,  // Descripción adicional
  provinceId?: string,   // Provincia
  isDefault: boolean,    // Es dirección predeterminada
}
```

## Flujo en Checkout

```
1. Usuario llega a /checkout/address
2. Se cargan direcciones existentes
3. Usuario selecciona o crea nueva dirección
4. Se guarda con set-user-address.ts
5. Se usa para crear OrderAddress (snapshot)
6. OrderAddress se guarda con la orden
```

## Provincias

Las provincias se seedean con `ensureProvincesExistService()` (`src/services/province.service.ts`, llamado desde `getProvincesService()`) y con `pnpm seed:prod` (`prisma/seed-prod.ts`). Son datos estáticos de Argentina.

## Requiere Revisión

- [ ] Verificar que las direcciones se guarden correctamente
- [ ] Testear que el snapshot en OrderAddress funcione
- [ ] Confirmar que provinces se seedeen correctamente
- [ ] Revisar que pickup no requiera dirección completa
