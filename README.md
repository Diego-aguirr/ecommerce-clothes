# E-Commerce

Plataforma e-commerce completa construida como **Modular Monolith** con Next.js 15 App Router, React 19, TypeScript strict mode, Prisma 7, PostgreSQL y NextAuth v5.

---

## Stack

| Capa     | Tecnología                                           |
| -------- | ---------------------------------------------------- |
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind CSS v4 |
| State    | Zustand v5 (carrito global)                          |
| Forms    | React Hook Form + Zod v4                             |
| Backend  | TypeScript strict · Prisma 7 ORM                     |
| Database | PostgreSQL 15 (Docker local / Neon producción)       |
| Auth     | NextAuth v5 (Google OAuth + credenciales)            |
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

```bash
git clone <tu-repositorio>
cd new-ecommerce-java
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.templete .env
```

Editá `.env` y completá todas las variables requeridas. Consultá el archivo `.env.templete` para el detalle de cada una.

> **Requeridas:** `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY`.

### 3. Levantar el entorno completo

El proyecto está dockerizado. Docker levanta la app + PostgreSQL con hot reload:

```bash
./docker.sh up
```

O con el alias (ver [Aliases](#aliases-para-tu-shell)):

```bash
sup
```

Abrí [http://localhost:3000](http://localhost:3000).

> **Nota:** La primera vez tarda en buildear. Las siguientes es instantáneo por los volumes.

---

## Comandos

### Docker (desarrollo)

```bash
./docker.sh up          # Levantar todo (app + db)
./docker.sh down        # Detener
./docker.sh restart     # Reiniciar
./docker.sh logs        # Ver logs
./docker.sh status      # Estado de contenedores
./docker.sh shell       # Entrar al contenedor de la app
./docker.sh db-shell    # Consola PostgreSQL
./docker.sh clean       # Limpiar todo (contenedores + volúmenes + imágenes)
```

### Desarrollo local

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

### SAURON Dev

```bash
alias sup='dcdev up --build'
alias supd='dcdev up --build -d'
alias sdown='dcdev down'
alias sdownv='dcdev down -v'
alias srestart='dcdev restart'
alias slogs='dcdev logs -f'
alias slogsa='dcdev logs -f app'
alias slogsdb='dcdev logs -f db'
alias sexec='dcdev exec app sh'
alias sdb='dcdev exec db psql -U sauron -d sauron_db'
alias sstatus='dcdev ps'
alias sbuild='dcdev build --no-cache'
alias sclean='dcdev down -v --rmi local'
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
# Reset completo de DB
alias dbreset='sdown && sup && sleep 3 && sexec npx prisma migrate deploy && sexec npx tsx prisma/seed.ts'

# Build limpio
alias clean='rm -rf .next node_modules && pnpm install && pnpm run build'
```

---

## Estructura del Proyecto

```
src/
├── actions/            # Server Actions (thin orchestrators)
│   ├── auth/           # Login, register, logout
│   ├── order/          # Place, get, list
│   ├── product/        # Get, paginate
│   ├── address/        # CRUD direcciones
│   ├── admin/          # CRUD dominios (admin)
│   └── payment/        # Crear preferencia MercadoPago
├── app/                # Pages y rutas (App Router)
│   ├── (auth)/         # Login, register, forgot/reset password
│   ├── (shop)/         # Productos, carrito, checkout, órdenes
│   ├── admin/          # Panel de administración
│   └── api/            # API endpoints y webhooks
├── components/         # UI Components (React)
│   ├── ui/             # Componentes genéricos
│   ├── product/        # Componentes de producto
│   └── provider/       # Context Providers (client)
├── services/           # Business logic (server-only)
├── store/              # Client-side state (Zustand)
│   ├── cart/           # useCartStore
│   └── ui/             # useUIStore
├── lib/                # Utilidades compartidas
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
| `/forgot-password` | Recuperar contraseña   |
| `/reset-password`  | Restablecer contraseña |

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
| `POST` | `/api/auth/forgot-password`     | Enviar email de recuperación |
| `POST` | `/api/auth/reset-password`      | Restablecer contraseña       |
| `GET`  | `/api/auth/verify`              | Verificar email              |
| `POST` | `/api/auth/resend-verification` | Reenviar verificación        |

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

## Variables de Entorno

Ver [`.env.templete`](./.env.templete) para la lista completa y documentación de cada variable.

---

## Documentación

La documentación detallada de cada dominio se encuentra en [`docs/`](./docs/):

| Archivo                  | Contenido                         |
| ------------------------ | --------------------------------- |
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
