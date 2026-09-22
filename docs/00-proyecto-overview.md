# E-commerce Platform — Overview del Proyecto

## Qué es

Plataforma e-commerce completa construida como **Modular Monolith** con Next.js 15. Single deployable unit con dominios separados y una capa unificada de services.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| State | Zustand 5 (carrito global) |
| Forms | React Hook Form + Zod 4 |
| Backend | TypeScript strict, Prisma 7 |
| DB | PostgreSQL (Neon) |
| Auth | NextAuth v5 (Google + credenciales) |
| Pagos | MercadoPago |
| Imágenes | Cloudinary |

## Arquitectura — Flujo de Datos

```
Server Components
  → Server Actions (thin orchestrators)
    → Services (lógica de negocio, PRISMA)
      → PostgreSQL
```

## Modelos de Dominio (Prisma)

| Modelo | Descripción | Importancia |
|--------|-------------|-------------|
| Product | Producto principal con precio, tallas, género | 🔴 Core |
| ProductVariant | Variante por talla+color con stock propio | 🔴 Core |
| ProductColor | Colores human-readable con imágenes | 🟠 Alto |
| ProductImage | Imágenes del producto (Cloudinary) | 🟠 Alto |
| StockMovement | Trazabilidad de movimientos de stock | 🟠 Alto |
| User | Usuarios con roles y estados | 🔴 Core |
| Order | Órdenes con items, dirección, pagos | 🔴 Core |
| OrderItem | Items de la orden con snapshot de precio | 🔴 Core |
| OrderAddress | Dirección snapshot de la orden | 🟡 Medio |
| Payment | Registro de pagos con estado y provider | 🔴 Core |
| PaymentLog | Logs de eventos de pago | 🟠 Alto |
| AuditLog | Auditoría de acciones admin | 🟡 Medio |
| Category | Categorías de productos | 🟡 Medio |
| Province | Provincias argentinas | 🟢 Bajo |
| UserAddress | Direcciones guardadas del usuario | 🟡 Medio |

## Dominios del Sistema

| # | Dominio | Archivos clave | Estado |
|---|---------|----------------|--------|
| 01 | Auth | services/auth.service.ts, actions/auth/ | ✅ Funcional |
| 02 | Products | services/product.service.ts, services/variant.service.ts, services/color.service.ts | ✅ Funcional |
| 03 | Orders | services/order.service.ts, actions/order/ | ✅ Funcional |
| 04 | Payments | services/payment.service.ts, api/webhooks/mercadopago/ | ⚠️ Revisar |
| 05 | Cart & Checkout | store/cart/, actions/payment/create-preference.ts, api/checkout/ | ✅ Funcional |
| 06 | Admin | actions/admin/, components/admin/ | ✅ Funcional |
| 07 | Addresses | services/address.service.ts, services/province.service.ts | ✅ Funcional |
| 08 | Uploads | services/upload.service.ts, actions/admin/upload.ts | ✅ Funcional |
| 09 | Database | prisma/schema.prisma | ✅ Estable |

## Rutas Principales

### Shop (público)
- `/` — Home con grid de productos
- `/product/[slug]` — Detalle de producto
- `/gender/[gender]` — Productos por género
- `/cart` — Carrito de compras
- `/checkout/address` — Formulario de dirección
- `/checkout` — Resumen y confirmación
- `/orders` — Órdenes del usuario
- `/orders/[id]` — Detalle de orden
- `/profile` — Perfil del usuario

### Auth
- `/login` — Inicio de sesión
- `/new-account` — Registro

### Admin (protegido)
- `/admin` — Dashboard
- `/admin/products` — CRUD productos
- `/admin/products/[id]/variants` — Gestión de variantes
- `/admin/products/[id]/colors` — Gestión de colores
- `/admin/orders` — Gestión de órdenes
- `/admin/orders/[id]` — Detalle de orden
- `/admin/users` — Gestión de usuarios
- `/admin/categories` — Gestión de categorías
- `/admin/payments` — Pagos
- `/admin/audit` — Logs de auditoría

### API Endpoints
- `POST /api/webhooks/mercadopago` — Webhook de pagos
- `POST /api/checkout/start` — Iniciar checkout

## Servicios (Capa de Negocio)

| Servicio | Función | Importancia |
|----------|---------|-------------|
| auth.service.ts | Registro, login, sesiones | 🔴 Core |
| product.service.ts | CRUD productos, paginación, búsqueda | 🔴 Core |
| variant.service.ts | CRUD variantes, stock, toggle activo | 🔴 Core |
| color.service.ts | CRUD colores, imágenes por color | 🟠 Alto |
| order.service.ts | Crear órdenes, obtener por usuario/ID | 🔴 Core |
| payment.service.ts | Crear preferencias, validar pagos | 🔴 Core |
| user.service.ts | Gestión de usuarios | 🟠 Alto |
| address.service.ts | Direcciones del usuario | 🟡 Medio |
| province.service.ts | Provincias argentinas | 🟢 Bajo |
| category.service.ts | Categorías de productos | 🟡 Medio |
| upload.service.ts | Subida de imágenes a Cloudinary | 🟠 Alto |

## Archivos de Documentación

| Archivo | Contenido |
|---------|-----------|
| `01-auth.md` | Sistema de autenticación |
| `02-products.md` | Catálogo de productos y variantes |
| `03-orders.md` | Gestión de órdenes |
| `04-payments.md` | Integración MercadoPago |
| `05-cart-checkout.md` | Carrito y flujo de checkout |
| `06-admin.md` | Panel de administración |
| `07-addresses.md` | Direcciones y provincias |
| `08-uploads.md` | Gestión de imágenes |
| `09-database.md` | Schema y modelos de datos |
| `mercadopago-webhook.md` | Detalle técnico del webhook |

## Stores (Client-side State)

| Store | Persistencia | Función |
|-------|-------------|---------|
| `useCartStore` | localStorage (`cart-storage`) | Carrito de compras (add, update qty, remove, summary con IVA 21%) |
| `useAddressStore` | localStorage (`address-storage`) | Dirección de envío + método de envío |
| `useUIStore` | No persiste | Estado de UI (sidebar open/close) |

## Middleware

`middleware.ts` protege rutas:
- **Públicas**: home, productos, about, contact, envíos, privacy, terms
- **Auth**: login, register
- **Protegidas**: checkout, orders, profile, admin

## Hooks

| Hook | Función |
|------|---------|
| `useProductVariant` | Selección de variante (color/talla) en el cliente |

## Libs Adicionales

| Archivo | Función |
|---------|---------|
| `src/lib/mailer.ts` | Cliente Resend para emails |
| `src/lib/errors.ts` | Error handler unificado + ActionError class |
| `src/lib/admin/auth-utils.ts` | Guards requireAdmin() + requireSuperAdmin() |
| `src/lib/admin/audit-logger.ts` | Logger de acciones admin (AuditLog) |

## Comandos

```bash
pnpm install && pnpm run dev      # Dev server
pnpm run build                     # Build producción
npx tsc --noEmit                   # Type check
pnpm run lint:fix                  # Fix lint
```
