# E-Commerce

Plataforma e-commerce completa construida como **Modular Monolith** con Next.js 16 App Router, React 19, TypeScript strict mode, Prisma 7, PostgreSQL y NextAuth v5.

---

## Stack

| Capa     | Tecnología                                           |
| -------- | ---------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 |
| State    | Zustand v5 (carrito global)                          |
| Forms    | React Hook Form + Zod v4                             |
| Backend  | TypeScript strict · Prisma 7 ORM                     |
| Database | PostgreSQL 16 (Docker local / Neon producción)       |
| Auth     | NextAuth v5 (Google OAuth + Magic Links)              |
| Pagos    | MercadoPago                                          |
| Imágenes | Cloudinary                                           |
| Testing  | Vitest                                               |

## Arquitectura

```
Server Components
  └─ Server Actions (thin orchestrators)
       └─ Services (lógica de negocio · Prisma)
            └─ PostgreSQL
```

- **Server Components** por defecto. Client Components solo cuando es estrictamente necesario.
- Actions son orquestadores delgados: auth, validación Zod, error handling → delegan a Services.
- Services contienen toda la lógica de negocio y queries Prisma (`server-only`).

---

## Instalación (Desarrollo)

### 1. Clonar e instalar dependencias

> **Requisitos:** Node **24.x** y pnpm **>=10** (definidos en `package.json` → `engines`). Verificá con `node -v` y `pnpm -v` antes de instalar.

```bash
git clone <tu-repositorio>
cd new-ecommerce-java
pnpm install
```

### 2. Configurar variables de entorno

#### Con Docker (recomendado)

```bash
cp .env.templete .env.docker
```

Editá `.env.docker` y completá todas las variables requeridas. El archivo ya viene con la `DATABASE_URL` apuntando al servicio `db` de Docker, así que no necesitás cambiarla.

> **Requeridas:** `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY`, `MAIL_FROM`.
>
> **Recomendadas (según feature):** `APP_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` (fallback "Satoru Store"), `MERCADOPAGO_WEBHOOK_SECRET` (si falta, la verificación de firma del webhook queda **deshabilitada** porque el código cae a `""`), `MERCADOPAGO_PUBLIC_KEY`.
>
> **Cloudinary:** `CLOUDINARY_URL` **o** bien las tres variables separadas `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (opcionales comentadas en `.env.templete`).

#### Sin Docker

```bash
cp .env.templete .env
```

Editá `.env` y completá todas las variables requeridas, incluyendo `DATABASE_URL` con tu PostgreSQL local.

> **Requeridas:** `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY`, `MAIL_FROM`.
>
> **Recomendadas (según feature):** `APP_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`, `MERCADOPAGO_WEBHOOK_SECRET` (sin ella el webhook no valida firmas), `MERCADOPAGO_PUBLIC_KEY`.

### 3. Levantar el entorno completo

El proyecto está dockerizado. Docker levanta la app + PostgreSQL con hot reload:

```bash
sup          # o: docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Abrí [http://localhost:3000](http://localhost:3000).

> **Nota:** La primera vez tarda en buildear. Las siguientes es instantáneo por los volumes.
>
> **Migraciones + seed en cada boot:** El entrypoint de desarrollo (`scripts/docker-dev-entrypoint.sh`) corre automáticamente:
>
> 1. `npx prisma migrate deploy`
> 2. `npx tsx prisma/seed-dev.ts` — **DESTRUCTIVO**: borra catálogo (products, variants, colors, images), usuarios, órdenes, pagos, categorías y provincias, y reescribe el catálogo local de **8 productos** + usuarios de test en **cada restart del contenedor**. Cualquier cambio local en esos datos se pierde al reiniciar.
>
> ⚠️ **Caveat en fresh clone:** `scripts/` está en `.gitignore` y **no se sube al repo**, así que `docker-compose.dev.yml` ejecuta `sh scripts/docker-dev-entrypoint.sh` con un archivo que no existe → el quickstart con `sup` **falla en un clone nuevo** hasta que copies/restaures el script (pedirlo al maintainer) o levantás sin entrypoint.

---

## Comandos

### Docker (desarrollo)

```bash
sup            # Levantar todo (app + db) con logs
supd           # Levantar todo en background
sdown          # Detener
srestart       # Reiniciar
slogs          # Ver logs en tiempo real
sstatus        # Estado de contenedores
sexec          # Entrar al contenedor de la app
sdb            # Consola PostgreSQL
sclean         # Limpiar todo (contenedores + volúmenes + imágenes)
```

### Desarrollo local (sin Docker)

```bash
pnpm run dev            # Dev server (Turbopack)
pnpm run build          # Build producción
pnpm start              # Iniciar producción
pnpm run lint           # Lint
pnpm run test           # Vitest (watch)
pnpm run test:run       # Vitest (una vez)
npx tsc --noEmit        # Type check
```

---

## Aliases (para tu shell)

Agregá estos alias en tu `~/.bashrc` o `~/.zshrc` para trabajar más rápido:

### Docker (base)

```bash
alias dcdev='docker compose -f docker-compose.yml -f docker-compose.dev.yml'
alias dcprod='docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod'
```

> ⚠️ **`dcprod`:** requiere `.env.prod`, archivo que **no existe en el repo y nunca estuvo documentado**. Sin él, cualquier comando `dcprod`/`pup`/`pdown` falla. Crealo localmente antes de usarlo (no commitearlo).

### SAURON Dev

```bash
alias sup='dcdev up --build'              # Levantar todo (con logs)
alias supd='dcdev up --build -d'          # Levantar todo (background)
alias sdown='dcdev down'                  # Detener
alias sdownv='dcdev down -v'              # Detener y borrar volúmenes
alias srestart='dcdev restart'            # Reiniciar
alias slogs='dcdev logs -f'               # Logs de todo
alias slogsa='dcdev logs -f app'          # Logs solo app
alias slogsdb='dcdev logs -f db'          # Logs solo DB
alias sexec='dcdev exec app sh'           # Entrar al contenedor
alias sdb='dcdev exec db psql -U sauron -d sauron_db'  # PostgreSQL
alias sstatus='dcdev ps'                  # Estado de contenedores
alias sbuild='dcdev build --no-cache'     # Rebuild limpio
alias sclean='dcdev down -v --rmi local'  # Limpiar TODO
```

### SAURON Prod

```bash
alias pup='dcprod up --build -d'
alias pdown='dcprod down'
alias plogs='dcprod logs -f'
alias pstatus='dcprod ps'
```

### Git

```bash
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline -10'
alias gp='git push'
alias gc='git commit -m'
alias gco='git checkout'
alias gb='git branch'
```

### Atajos combinados

```bash
# ⚠️ DESTRUCTIVO — Reset completo de DB
alias dbreset='sdown && sup && sleep 3 && sexec npx prisma migrate deploy && sexec npx tsx prisma/seed.ts'
```

> 🛑 **`dbreset` borra TODO**: orders, payments, users, categories, provinces y todo el catálogo, y recrea los usuarios de test (`superadmin@test.com`, `admin@test.com`, `user@test.com`, `blocked@test.com`, etc.). **Nunca correrlo contra una DB con datos reales.**
>
> Además `prisma/seed.ts` referencia imágenes de `img/products/`, que está en `.gitignore` → **en un fresh clone el seed falla o crea productos sin imágenes** hasta que exista ese directorio.

```bash
# Build limpio local
alias clean='rm -rf .next node_modules && pnpm install && pnpm run build'
```

---

## Seeds

| Comando | Qué hace | Seguridad |
| ------- | -------- | --------- |
| `pnpm seed` (`prisma/seed.ts`) | **DESTRUCTIVO**: borra users, orders, payments, categorías, provincias y catálogo completo, y reescribe el catálogo con imágenes de **Cloudinary** + usuarios de test | Solo local: bloquea con `exit 1` si `NODE_ENV=production` o si `DATABASE_URL` apunta a `neon.tech`. En Docker: `docker exec <container> npx tsx prisma/seed.ts` |
| `pnpm seed:users` (`prisma/seed-users.ts`) | **Idempotente** (upsert, nunca borra): crea/actualiza el super admin `diegoalexisaguirre2@gmail.com` + `user@test.com` + `blocked@test.com` (status `BLOCKED`) | Local only: bloquea production, Neon y cualquier URL no-local (`exit 1`) |
| `pnpm seed:prod` (`prisma/seed-prod.ts`) | Solo provincias + categorías (datos base). **Único seed pensado para producción** | Idempotente: salta si ya hay datos |
| `npx tsx prisma/seed-dev.ts` | Catálogo local de **8 productos** con imágenes de `public/products/` + usuarios de test. **Se corre solo en cada boot del contenedor dev** (entrypoint) | Local only (bloquea production/Neon/no-local). ⚠️ **Borra catálogo, usuarios, órdenes y pagos en cada restart** |

---

## Estructura del Proyecto

```
src/
├── actions/            # Server Actions (thin orchestrators)
│   ├── auth/           # Magic link, register, Google
│   ├── order/          # Place, get, list
│   ├── product/        # Get, paginate
│   ├── category/       # Get categorías
│   ├── provincies/     # Get provincias
│   ├── address/        # CRUD direcciones
│   ├── admin/          # CRUD dominios (admin)
│   └── payment/        # Payment actions: MP preference, admin approval
├── app/                # Pages y rutas (App Router)
│   ├── (auth)/         # Login, register
│   ├── (shop)/         # Productos, carrito, checkout, órdenes
│   ├── admin/          # Panel de administración
│   └── api/            # API endpoints y webhooks
├── components/         # UI Components (React)
│   ├── ui/             # Componentes genéricos (hand-rolled)
│   ├── admin/          # Componentes del panel admin
│   ├── product/        # Componentes de producto
│   ├── products/       # Listado de productos
│   ├── mercadopago/    # MercadoPagoButton
│   └── provider/       # Context Providers (client)
├── services/           # Business logic (server-only · 12 services)
├── store/              # Client-side state (Zustand)
│   ├── address/        # useAddressStore
│   ├── cart/           # useCartStore
│   └── ui/             # useUIStore
├── lib/                # Utilidades compartidas (16 entradas)
│   ├── admin/          # auth-utils (requireAdmin), audit-logger
│   ├── schemas/        # Zod schemas
│   ├── storage/        # Storage utilities
│   ├── validations/    # Validation schemas
│   ├── prisma.ts       # Cliente Prisma singleton
│   ├── mailer.ts       # Cliente Resend (emails)
│   ├── auth-status.ts  # Gate fail-closed de User.status
│   ├── errors.ts       # Error handler unificado
│   ├── html-escape.ts  # XSS escaping para emails
│   ├── mercadopago.ts  # Cliente MercadoPago
│   ├── url.ts          # isLocalUrl (open redirect guard)
│   └── ...             # utils.ts, zod.ts, magic-link-email.ts, image-utils.ts
├── config/             # Configuración
├── generated/prisma/   # Auto-generado por Prisma
├── types/              # Global type definitions
├── interfaces/         # Type contracts
├── hooks/              # Custom hooks
├── seed/               # Seed scripts
└── utils/              # Utilidades generales
```

---

## Rutas Principales

### Shop (público)

| Ruta                | Descripción                |
| ------------------- | -------------------------- |
| `/`                 | Home con grid de productos |
| `/product/[slug]`   | Detalle de producto        |
| `/gender/[gender]`  | Productos por género       |
| `/cart`             | Carrito de compras         |
| `/checkout/address` | Formulario de dirección    |
| `/checkout`         | Resumen y confirmación     |
| `/orders`           | Órdenes del usuario        |
| `/orders/[id]`      | Detalle de orden           |

### Auth

| Ruta               | Descripción            |
| ------------------ | ---------------------- |
| `/login`           | Inicio de sesión       |
| `/new-account`     | Registro               |

### Admin (protegido)

| Ruta                            | Descripción           |
| ------------------------------- | --------------------- |
| `/admin`                        | Dashboard             |
| `/admin/products`               | CRUD productos        |
| `/admin/products/[id]/variants` | Gestión de variantes  |
| `/admin/products/[id]/colors`   | Gestión de colores    |
| `/admin/orders`                 | Gestión de órdenes    |
| `/admin/users`                  | Gestión de usuarios   |
| `/admin/categories`             | Gestión de categorías |
| `/admin/payments`               | Pagos                 |
| `/admin/audit`                  | Logs de auditoría     |

### API

| Método | Ruta                            | Descripción                  |
| ------ | ------------------------------- | ---------------------------- |
| `POST` | `/api/webhooks/mercadopago`     | Webhook de pagos             |
| `POST` | `/api/checkout/start`           | Iniciar checkout             |
| `GET`  | `/api/auth/magic-link`          | Redirect legacy (links viejos) |

---

## Flujo de Checkout

```
Carrito → Dirección → Checkout → Confirmar → Pago
```

### Métodos de pago soportados

| Método | Flujo | Confirmación |
|--------|-------|-------------|
| **MercadoPago** | Redirect automático a MP checkout | Webhook MP → automática |
| **Efectivo/Transferencia** | Orden creada con instrucciones | Admin aprueba manualmente |

### MercadoPago
1. Usuario selecciona "MercadoPago" en checkout
2. Clic "Finalizar Compra" → crea orden → redirect a MP
3. Usuario paga en MP
4. Webhook confirma → orden pagada + stock descontado

### Efectivo / Transferencia
1. Usuario selecciona "Efectivo/Transferencia" en checkout
2. Clic "Finalizar Compra" → crea orden → muestra instrucciones
3. Usuario paga (transferencia o efectivo al retirar)
4. Admin entra al panel → órdenes → "Confirmar pago recibido"
5. Orden pagada + stock descontado

---

## Dominios

| #   | Dominio         | Estado       |
| --- | --------------- | ------------ |
| 01  | Auth            | ✅ Funcional |
| 02  | Products        | ✅ Funcional |
| 03  | Orders          | ✅ Funcional |
| 04  | Payments        | ✅ Funcional |
| 05  | Cart & Checkout | ✅ Funcional |
| 06  | Admin           | ✅ Funcional |
| 07  | Addresses       | ✅ Funcional |
| 08  | Uploads         | ✅ Funcional |
| 09  | Database        | ✅ Estable   |

---

## Webhooks (Ngrok)

Para exponer endpoints locales a internet (ej. MercadoPago webhooks):

```bash
# Autenticar (primera vez)
npx ngrok config add-authtoken TU_TOKEN

# Crear túnel
npx ngrok http 3000
```

Usá la URL HTTPS de Ngrok para configurar los webhooks en tu pasarela de pagos.

---

## Producción (deploy)

Deploy en **Vercel** (config en [`vercel.json`](./vercel.json)):

- `buildCommand`: **`npx prisma generate && next build --turbopack`** — solo genera el cliente Prisma y buildea. **No se corren migraciones ni seeds en el deploy.**
- `installCommand`: `pnpm install --frozen-lockfile`

Reglas de producción:

- 🛑 **NUNCA** correr `pnpm seed` ni `pnpm seed:users` contra Neon: ambos scripts tienen guards que los frenan con `exit 1` si `NODE_ENV=production` o si `DATABASE_URL` apunta a `neon.tech`. No intentar bypassearlos.
- **Migraciones:** `npx prisma migrate deploy` debe correrse **manualmente** contra Neon cada vez que cambia el schema (hoy hay 19 migraciones en `prisma/migrations/`, todas aplicadas).
- **Seed en prod:** si hace falta datos base, solo `pnpm seed:prod` (provincias + categorías). Nunca `seed` ni `seed:users`.
- **Imágenes:** en producción se sirven desde **Cloudinary**. `public/products/` está en `.gitignore` y existe solo para dev local (seed-dev).

### Estado de usuarios (BLOCKED)

`User.status` (`ACTIVE` / `BLOCKED` / `DELETED`) se valida en [`auth.ts`](./auth.ts) en dos puntos:

1. **`signIn` callback** — magic link y Google: un usuario `BLOCKED` no puede iniciar sesión (respuesta uniforme, sin revelar por qué).
2. **`jwt` callback (refresh)** — se re-consulta el status en cada lectura de sesión: si el usuario es bloqueado a mitad de sesión, `return null` **limpia la cookie** antes de que expire el token.

Fail-closed: solo `ACTIVE` tiene acceso (`isStatusActive()` en `src/lib/auth-status.ts`). Services y actions deben respetar este estado — no asumir que una sesión válida implica un usuario activo.

---

## Variables de Entorno

Ver [`.env.templete`](./.env.templete) para la lista completa y documentación de cada variable.

---

## Documentación

La documentación detallada de cada dominio se encuentra en [`docs/`](./docs/):

| Archivo                  | Contenido                         |
| ------------------------ | --------------------------------- |
| `00-proyecto-overview.md`| Overview general del proyecto     |
| `01-auth.md`             | Sistema de autenticación          |
| `02-products.md`         | Catálogo de productos y variantes |
| `03-orders.md`           | Gestión de órdenes                |
| `04-payments.md`         | Integración MercadoPago           |
| `05-cart-checkout.md`    | Carrito y flujo de checkout       |
| `06-admin.md`            | Panel de administración           |
| `07-addresses.md`        | Direcciones y provincias          |
| `08-uploads.md`          | Gestión de imágenes               |
| `09-database.md`         | Schema y modelos de datos         |
| `mercadopago-webhook.md` | Detalle técnico del webhook       |

---

## License

Private — All rights reserved.
