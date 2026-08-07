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

### Components
| Archivo | Función |
|---------|---------|
| `src/components/admin/ui/admin-sidebar.tsx` | Sidebar del admin |
| `src/components/admin/ui/pagination.tsx` | Paginación admin |
| `src/components/admin/dashboard/stat-card.tsx` | Tarjetas de estadísticas |
| `src/components/admin/products/product-form.tsx` | Formulario de producto |
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

- Todas las actions admin usan `requireAdmin()` que verifica:
  1. Sesión activa
  2. Usuario existe en DB
  3. Rol es `admin`
- Si no pasa → retorna `{ ok: false, error: "Unauthorized" }`

## Funcionalidades

### Dashboard
- Estadísticas de ventas
- Últimas órdenes
- Productos con stock bajo

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
- Cambio de estado (ACTIVE/BLOCKED/DELETED)
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
