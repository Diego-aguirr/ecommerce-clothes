# 06 — Admin (Panel de Administración)

## Nombre
Panel de Administración

## Función
Dashboard completo para gestionar productos, variantes, colores, órdenes, usuarios, categorías, pagos y auditoría. Solo accesible para usuarios con rol `admin`.

## Importancia
🟠 **ALTO** — Es la herramienta operativa del negocio.

## Archivos Involucrados

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/admin/products.ts` | CRUD productos |
| `src/actions/admin/variants.ts` | CRUD variantes |
| `src/actions/admin/colors.ts` | CRUD colores |
| `src/actions/admin/orders.ts` | Gestión de órdenes |
| `src/actions/admin/users.ts` | Gestión de usuarios |
| `src/actions/admin/categories.ts` | CRUD categorías |
| `src/actions/admin/upload.ts` | Subida de imágenes |

### Services
| Archivo | Función |
|---------|---------|
| `src/services/admin.service.ts` | Backing de cada lista paginada y del dashboard: `getDashboardStats`, `getPaginatedProductsAdmin`, `getPaginatedOrdersAdmin`, `getPaginatedPaymentsAdmin`, `getPaginatedUsersAdmin`, `getPaginatedAuditLogs` |

### Components
| Archivo | Función |
|---------|---------|
| `src/components/admin/ui/admin-sidebar.tsx` | Sidebar del admin |
| `src/components/admin/ui/pagination.tsx` | Paginación admin |
| `src/components/admin/dashboard/stat-card.tsx` | Tarjetas de estadísticas |
| `src/components/admin/products/product-wizard.tsx` | Wizard de creación (steps `step-*.tsx`) |
| `src/components/admin/products/edit-product-tabs.tsx` | Tabs del formulario de edición |
| `src/app/admin/products/[id]/edit-product-form.tsx` | Formulario de edición (page-level) |
| `src/components/admin/products/product-thumbnail.tsx` | Thumbnail de producto |

### Pages
| Ruta | Función |
|------|---------|
| `admin/page.tsx` | Dashboard principal |
| `admin/products/page.tsx` | Lista de productos |
| `admin/products/new/page.tsx` | Crear producto |
| `admin/products/[id]/page.tsx` | Editar producto |
| `admin/products/[id]/variants/page.tsx` | Gestionar variantes |
| `admin/products/[id]/colors/page.tsx` | Gestionar colores |
| `admin/orders/page.tsx` | Lista de órdenes |
| `admin/orders/[id]/page.tsx` | Detalle de orden |
| `admin/users/page.tsx` | Lista de usuarios |
| `admin/categories/page.tsx` | Lista de categorías |
| `admin/payments/page.tsx` | Pagos |
| `admin/audit/page.tsx` | Logs de auditoría |

### Modelo Relacionado
- `AuditLog` — Registro de acciones admin (acción, entidad, target, metadata)

## Seguridad

- Las actions admin usan `requireAdmin()` — excepto `src/actions/admin/users.ts`, que usa `requireSuperAdmin()`, y las páginas `admin/users`, `admin/payments`, `admin/audit`, que se protegen a nivel de página con `requireSuperAdmin()`. Verifica:
  1. Sesión activa (`session.user`)
  2. Rol es `admin` (`requireSuperAdmin()` exige además `isSuperAdmin`)
- **No consulta la DB**: solo lee `session.user` / `session.user.role` (`src/lib/admin/auth-utils.ts`)
- Si no pasa → **lanza** `unauthorized()` (401) o `forbidden()` (403) de `next/navigation` — no retorna `{ ok: false }`

## Funcionalidades

### Dashboard
- 4 stat cards (`getDashboardStats`): `totalRevenue`, `todayOrders`, `pendingOrders`, `productsCount`
- (No hay widget de "Últimas órdenes" ni de "stock bajo")

### Productos
- Crear/editar/eliminar productos
- Gestión de variantes (talla+color)
- Gestión de colores con imágenes
- Upload de imágenes a Cloudinary

### Órdenes
- Lista paginada de órdenes
- Cambio de estado (pending/paid/cancelled)
- Cambio de estado de entrega (pending/shipped/delivered)
- Tracking code

### Usuarios
- Lista de usuarios
- Cambio de estado (ACTIVE/BLOCKED — `toggleUserBlockService` solo alterna esos dos; `DELETED` no existe en el flujo)
- Asignación de roles

### Auditoría
- Logs de acciones admin
- Filtro por admin, acción, entidad

## Requiere Revisión

- [ ] Verificar que `requireAdmin()` proteja todas las rutas admin
- [ ] Testear CRUD completo de productos con variantes
- [ ] Revisar que las imágenes se suban correctamente a Cloudinary
- [ ] Confirmar que los AuditLog se creen en cada acción
- [ ] Verificar que el dashboard muestre estadísticas correctas
- [ ] Testear cambio de estados de orden y entrega

## Anti-patrones Identificados

- **God Object**: `variants.ts` y `colors.ts` tenían 200+ líneas → se extrajeron a services
- **Bypass Pattern**: Algunas actions admin llamaban Prisma directo → migrado a services
