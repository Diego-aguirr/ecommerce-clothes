# E-Commerce Platform

A production-ready e-commerce platform built as a **Modular Monolith** with Next.js 16 (App Router), React 19, TypeScript strict, Prisma 7, PostgreSQL, and NextAuth v5.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 |
| State | Zustand v5 (global cart) |
| Forms | React Hook Form + Zod v4 |
| Backend | TypeScript strict · Prisma 7 ORM |
| Database | PostgreSQL 16 (Docker local / Neon production) |
| Auth | NextAuth v5 (Google OAuth + Magic Links) |
| Payments | MercadoPago |
| Images | Cloudinary |
| Testing | Vitest |

---

## Architecture

```
Server Components
  └─ Server Actions (thin orchestrators)
       └─ Services (business logic · Prisma)
            └─ PostgreSQL
```

- **Server Components by default**. Client Components only when strictly necessary (interactivity, browser APIs, animations, Zustand, form state).
- **Actions** are thin orchestrators: auth, Zod validation, error handling → delegate to Services.
- **Services** contain all business logic and Prisma queries (`server-only` enforced).

---

## Quick Start (Development)

### Prerequisites
- Node.js **24.x** and pnpm **≥10** (defined in `package.json` → `engines`)
- Docker & Docker Compose (recommended)

### 1. Clone & Install
```bash
git clone <your-repo>
cd ecommerce-clothes
pnpm install
```

### 2. Configure Environment
```bash
# With Docker (recommended)
cp .env.example .env.docker   # edit required variables

# Without Docker
cp .env.example .env          # edit + add DATABASE_URL
```

**Required variables** (both modes):
| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `CLOUDINARY_URL` | Image uploads |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago API |
| `RESEND_API_KEY` | Transactional emails |
| `MAIL_FROM` | Sender email address |
| `APP_URL` | Absolute URL for emails/webhooks (e.g. `https://your-domain.com`) — **required in production** |
| `MERCADOPAGO_WEBHOOK_SECRET` | HMAC signature validation — **without it, webhook rejects all events in production** |

**Recommended**: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` (fallback "Satoru Store"), `MERCADOPAGO_PUBLIC_KEY`.

### 3. Run with Docker (recommended)
```bash
# Build & start (first run takes ~2 min)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or use the alias
sup
```
Open [http://localhost:3000](http://localhost:3000).

**Entrypoint** (`scripts/docker-dev-entrypoint.sh`) runs on every boot:
1. `npx prisma generate` — **after volume mount** (fixes `Module not found: @/generated/prisma/client`)
2. `npx prisma migrate deploy`
3. `npx tsx prisma/seed-dev.ts` — **DESTRUCTIVE**: recreates catalog (8 products), users, orders, payments, categories, provinces on **every container restart**. Local data changes are lost on restart.

⚠️ **Fresh clone caveat**: `scripts/` is in `.gitignore` and not committed. The quickstart fails until you restore the entrypoint script (ask maintainer) or run without entrypoint.

---

## Commands

### Docker (Development)
```bash
sup            # Start all (with logs)
supd           # Start all (background)
sdown          # Stop
srestart       # Restart
slogs          # Follow logs
sstatus        # Container status
sexec          # Enter app container
sdb            # PostgreSQL console
sclean         # Nuke everything (containers + volumes + images)
```

### Local Development (without Docker)
```bash
pnpm run dev            # Dev server (Turbopack)
pnpm run build          # Production build
pnpm start              # Start production server
pnpm run lint           # ESLint
pnpm run test           # Vitest (watch)
pnpm run test:run       # Vitest (single run)
npx tsc --noEmit        # Type check
```

---

## Project Structure

```
src/
├── actions/            # Server Actions (thin orchestrators)
│   ├── auth/           # Magic link, register, Google
│   ├── order/          # Place, get, list
│   ├── product/        # Get, paginate
│   ├── category/       # Get categories
│   ├── address/        # CRUD addresses
│   ├── admin/          # Admin CRUD
│   └── payment/        # MP preference, admin approval
├── app/                # Pages & routes (App Router)
│   ├── (auth)/         # Login, register
│   ├── (shop)/         # Products, cart, checkout, orders
│   ├── admin/          # Admin panel
│   └── api/            # API endpoints & webhooks
├── components/         # UI Components (React)
│   ├── ui/             # Generic (hand-rolled, no UI framework)
│   ├── admin/          # Admin panel components
│   ├── product/        # Product-specific
│   ├── products/       # Product listings
│   ├── mercadopago/    # MercadoPagoButton
│   └── provider/       # Context Providers (client)
├── services/           # Business logic (server-only · 12 services)
├── store/              # Client state (Zustand)
│   ├── address/        # useAddressStore
│   ├── cart/           # useCartStore
│   └── ui/             # useUIStore
├── lib/                # Shared utilities
│   ├── admin/          # auth-utils, audit-logger
│   ├── schemas/        # Zod schemas
│   ├── storage/        # Storage utilities
│   ├── validations/    # Validation schemas
│   ├── prisma.ts       # Prisma singleton (src/generated/prisma-v2)
│   ├── mailer.ts       # Resend client
│   ├── auth-status.ts  # Fail-closed User.status gate
│   ├── errors.ts       # Unified error handler
│   ├── mercadopago.ts  # MercadoPago client
│   ├── url.ts          # isLocalUrl (open redirect guard)
│   └── ...             # utils, zod, magic-link, image-utils
├── config/             # Configuration
├── generated/prisma-v2/ # Auto-generated by Prisma (output path)
├── types/              # Global type definitions
├── interfaces/         # Type contracts
├── hooks/              # Custom hooks
├── seed/               # Seed scripts
└── utils/              # General utilities
```

---

## Key Routes

### Shop (Public)
| Route | Description |
|-------|-------------|
| `/` | Home with product grid |
| `/product/[slug]` | Product detail |
| `/gender/[gender]` | Products by gender |
| `/cart` | Shopping cart |
| `/checkout/address` | Address form |
| `/checkout` | Order review & payment |
| `/orders` | User orders list |
| `/orders/[id]` | Order detail |

### Auth
| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/new-account` | Register |

### Admin (Protected)
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Products CRUD |
| `/admin/products/[id]/variants` | Variants management |
| `/admin/products/[id]/colors` | Colors management |
| `/admin/orders` | Orders management |
| `/admin/users` | Users management |
| `/admin/categories` | Categories management |
| `/admin/payments` | Payments overview |
| `/admin/audit` | Audit logs |

### API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/webhooks/mercadopago` | Payment webhook |
| `POST` | `/api/checkout/start` | Start checkout (legacy) |
| `GET` | `/api/auth/magic-link` | Legacy magic link redirect |

---

## Checkout Flow

```
Cart → Address → Checkout → Confirm → Payment
```

### Supported Payment Methods

| Method | Flow | Confirmation |
|--------|------|--------------|
| **MercadoPago** | Auto-redirect to MP checkout | Webhook → automatic |
| **Cash / Bank Transfer** | Order created with instructions | Admin approves manually |

#### MercadoPago (Online)
1. User selects "MercadoPago" at checkout
2. Click "Place Order" → creates order → redirects to MP
3. User pays on MercadoPago
4. Webhook confirms → order paid + stock deducted

#### Cash / Bank Transfer (Offline)
> ⚠️ **NOTICE: This flow is incomplete / work in progress.**
> Current implementation: Client selects "Cash/Transfer" → order created with `CREATED` status → client sees bank instructions.
> **Missing**: Admin confirmation UI (only Super Admin can confirm via `approveCashPaymentService`), client "I paid" notification, auto-expiration, admin email notifications.
> This is a collaborative model where admin confirms after verifying payment with client. See [Roadmap](#roadmap) for planned improvements.

1. User selects "Cash / Transfer" at checkout
2. Click "Place Order" → creates order (`CREATED`) + payment (`CREATED`) → shows bank instructions
2. User transfers or pays cash on pickup
3. **Client-Admin communication**: Client sees "Payment pending" + instructions in `/orders/[id]`. Can contact admin via email/WhatsApp (configured via `MAIL_FROM`).
4. **Admin panel** (`/admin/orders`): Lists `cash`/`transfer` orders in `CREATED`/`PENDING`. Filter by payment status/method.
5. **Payment authorization**:
   - **Admin**: Views pending orders
   - **Super Admin** (`isSuperAdmin: true`): **"Confirm payment received"** action → calls `approveCashPaymentService` → validates `cash` payment, not already paid, updates payment to `APPROVED`, confirms order, deducts stock (transactional)
4. On confirmation: order → `paid`, payment → `APPROVED`, stock deducted, confirmation email sent

> **Note**: Currently only **Super Admin** can confirm cash payments. Roadmap: allow regular Admin.

---

## Domains

| # | Domain | Status |
|---|--------|--------|
| 01 | Auth | ✅ Functional |
| 02 | Products | ✅ Functional |
| 04 | Orders | ✅ Functional |
| 05 | Payments | ✅ Functional |
| 05 | Cart & Checkout | ✅ Functional |
| 06 | Admin | ✅ Functional |
| 07 | Addresses | ✅ Functional |
| 08 | Uploads | ✅ Functional |
| 09 | Database | ✅ Stable |

---

## Local Development (Ngrok)

Expose local endpoints for MercadoPago webhooks:
```bash
# One-time setup
npx ngrok config add-authtoken YOUR_TOKEN

# Create tunnel
npx ngrok http 3000
```
Use the HTTPS URL for webhook configuration in MercadoPago.

---

## Production Deploy (Vercel)

Configured in [`vercel.json`](./vercel.json):
- `buildCommand`: `npx prisma generate && next build --turbopack` (generates client + builds only)
- `installCommand`: `pnpm install --frozen-lockfile`

**Production Rules**:
- 🛑 **NEVER** run `pnpm seed` or `pnpm seed:users` against Neon — both block with `exit 1` if `NODE_ENV=production` or `DATABASE_URL` contains `neon.tech`.
- **Migrations**: Run `npx prisma migrate deploy` manually against Neon on schema changes (19 migrations applied to date).
- **Production seed**: Only `pnpm seed:prod` (provinces + categories). Never `seed` or `seed:users`.
- **Images**: Served from **Cloudinary**. `public/products/` is gitignored (local dev only).

### User Status (Fail-Closed)
`User.status` (`ACTIVE` / `BLOCKED` / `DELETED`) validated in [`auth.ts`](./auth.ts):
1. **`signIn` callback** — Magic link & Google: `BLOCKED` users cannot sign in (uniform response, no info leak).
2. **`jwt` callback (refresh)** — Re-checks status on every session read: if blocked mid-session, `return null` clears cookie before token expiry.

Fail-closed: only `ACTIVE` has access (`isStatusActive()` in `src/lib/auth-status.ts`). Services/actions must respect this — never assume valid session = active user.

---

## Environment Variables

See [`.env.example`](./.env.example) for the complete list with descriptions.

---

## Documentation

Detailed domain docs in [`docs/`](./docs/):

| File | Content |
|------|---------|
| `00-proyecto-overview.md` | Project overview, architecture, models, domains |
| `01-auth.md` | Authentication system |
| `02-products.md` | Product catalog & variants |
| `03-orders.md` | Order management |
| `04-payments.md` | MercadoPago integration |
| `05-cart-checkout.md` | Cart & checkout flow |
| `06-admin.md` | Admin panel |
| `07-addresses.md` | Addresses & provinces |
| `08-uploads.md` | Image management (Cloudinary) |
| `09-database.md` | Schema & data models |
| `10-stock-reservation.md` | Stock reservation at order creation (T7) |
| `mercadopago-webhook.md` | Webhook technical deep-dive |

---

## Roadmap

### Cash/Transfer Payments
- [ ] Regular Admin can confirm payments (currently Super Admin only)
- [ ] Auto email to admin on new `cash` order
- [ ] Client "I paid" button → notifies admin
- [ ] Auto-expire pending `cash` orders (configurable, e.g. 48h)

### Admin Panel
- [ ] Sales/pending orders/low stock dashboard
- [ ] Export orders to CSV/Excel
- [ ] User management: block/unblock, role changes

### Technical
- [ ] Webhook integration tests (currently excluded: `vitest.config.ts` excludes `src/app/**`)
- [ ] Rate limiting on public endpoints (checkout, webhooks)
- [ ] Structured JSON logging + correlation IDs
- [ ] Health check endpoint (`/api/health`)

### UX/UI
- [ ] PWA support (offline cart, install prompt)
- [ ] Persistent dark mode toggle
- [ ] Skeleton loaders on critical pages

---

## License

MIT License — see [LICENSE](./LICENSE) for details.