# Repository Guidelines

## User Preferences (Permanent)

- **Auto-open files**: Every file touched/edited MUST be opened in VS Code automatically with `code <filename>` after the edit. This applies to ALL file operations (read, write, edit). No exceptions.

---

## How to Use This Guide

Start here for cross-project norms. Folder-specific guidelines live in: `src/AGENTS.md`, `src/app/admin/AGENTS.md`, `src/app/api/AGENTS.md`.

---

## Available Skills

Use these skills for detailed patterns on-demand:

> **Availability:** `skills/` is gitignored and **not present in the repo** — the old `[SKILL.md](skills/...)` links were broken in any fresh clone. These skills exist only where an agent environment installs them locally; if your environment doesn't have a skill, fall back to this file.

### Generic Skills (Any Project)

| Skill | Description | Availability |
|-------|-------------|--------------|
| `typescript` | Const types, flat interfaces, utility types | Local (outside repo) |
| `react-19` | No useMemo/useCallback, React Compiler | Local (outside repo) |
| `nextjs-15` | App Router, Server Actions, streaming | Local (outside repo) |
| `tailwind-4` | cn() utility, no var() in className | Local (outside repo) |
| `zod-4` | New API (z.email(), z.uuid()) | Local (outside repo) |
| `zustand-5` | Persist, selectors, slices | Local (outside repo) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST (when available):

| Action | Skill |
|--------|-------|
| App Router / Server Actions | `nextjs-15` |
| Creating Zod schemas | `zod-4` |
| Using Zustand stores | `zustand-5` |
| Working with Tailwind classes | `tailwind-4` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |

---

## Project Overview

This repository is a production-grade e-commerce platform built with:

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Prisma 7 ORM
- PostgreSQL (Neon)
- NextAuth v5
- Tailwind CSS v4
- Zustand v5
- Zod v4
- MercadoPago (payments)
- Cash/Transfer (manual payments)
- Cloudinary (image optimization)

Agents must assume modern patterns and MUST NOT generate legacy code.

---

## Architecture

### Modular Monolith

This project follows the **Modular Monolith** architectural pattern:
- Single deployable unit (no microservices)
- Domain-driven modules (auth, products, orders, payments, etc.)
- Unified services layer for business logic
- Clear separation of concerns between layers
- Each module has its own actions, services, and types

### Layers (top → bottom)

```
┌─────────────────────────────────────────────────┐
│  UI (Server Components)                         │
│  pages/, components/                            │
└──────────────────┬──────────────────────────────┘
                   │ calls
┌──────────────────▼──────────────────────────────┐
│  Actions (thin orchestrators)                   │
│  • Auth (requireSession, requireAdmin)          │
│  • Zod validation                               │
│  • Error handling → { ok, error, data }         │
│  • 0 direct Prisma queries                      │
└──────────────────┬──────────────────────────────┘
                   │ delegates
┌──────────────────▼──────────────────────────────┐
│  Services (business logic)                      │
│  • Business logic                               │
│  • Prisma queries                               │
│  • Throw errors (not return { ok: false })      │
│  • server-only enforced (12/12)                 │
└──────────────────┬──────────────────────────────┘
                   │ queries
┌──────────────────▼──────────────────────────────┐
│  Prisma → PostgreSQL (Neon)                     │
└─────────────────────────────────────────────────┘
```

### Global Architectural Rule (Highest Priority)

**Server Components first.** Client Components only when strictly necessary.

Default assumptions:
- pages → server
- layouts → server
- data fetching → server
- mutations → server actions

Client components allowed only if:
- user interaction required
- browser APIs required
- animations required
- Zustand store used
- form state required

Never add "use client" without justification.

### Source of Truth Hierarchy

When rules conflict:

1. This file
2. Folder AGENTS.md
3. TypeScript types
4. Prisma schema
5. ESLint rules

---

## Domain Architecture

Project is domain-driven with a unified services layer.

**Domains:**
- auth
- products
- cart
- checkout
- orders
- payments
- admin
- addresses
- uploads
- ui

### Flow Rules

**Action layer:**
- Auth (requireSession, requireAdmin)
- Zod validation
- Error handling → { ok, error, data }
- Delegate to service
- 0 direct Prisma queries

**Service layer:**
- Business logic
- Prisma queries
- Throw errors (not return { ok: false })
- server-only enforced

Agents must place code inside correct domain. Never create new architectural patterns.

---

## Critical Patterns (Implemented)

### Stock Reservation (T7)
- **Reserve at order creation** (`createOrder`): decrement variant stock + create `StockMovement(type: "reserved")` inside the same transaction.
- **Confirm payment** (`confirmPaymentAndUpdateStock`): convert `reserved` → `sale` movement, mark order paid.
- **Release on failure** (`releaseStockReservation`): increment stock + create `released` movement on `REJECTED`/`CANCELLED` webhook status.
- **Race-safe**: `decrement` + validation inside same transaction; PostgreSQL serializes concurrent transactions.
- **Idempotent release**: second call finds no `reserved` movement → no-op.
- **Legacy shim**: orders created before this deploy (no `reserved` movement) fall back to decrement + `sale` movement.

### Idempotency Keys (Webhook)
- **Key**: `mp:${data.id}:${x-request-id}` (MP `data.id` query param + `x-request-id` header).
- **Check at webhook entry** (before transaction): `IdempotencyKey` model with unique constraint + 24h TTL.
- **Duplicate handling**: return 200 + log `duplicate` event with `providerPaymentId` outside transaction.

### Webhook Security
- **Manifest HMAC**: MP signs `data.id` + `x-request-id` + `ts` (NOT the body). Verified with timing-safe compare.
- **Fail-closed**: missing secret, missing ts/v1, malformed header, mismatch → 401.
- **Fetch real state**: call `Payment.get(id)` to MP API; never trust webhook payload.
- **Amount tolerance**: cent-level comparison (`amountsMatch` ±0.005 + toFixed(2) normalization).
- **Anti-fraud**: `approved` but not `accredited` → 500 + durable log, MP retries until accredited.

### Payment Methods
- **MercadoPago**: redirect → webhook → automatic confirm.
- **Cash/Transfer**: order created `CREATED` → client sees instructions → **Super Admin only** confirms via `approveCashPaymentService` → validates `cash` payment, not already paid, updates payment to `APPROVED`, confirms order + deducts stock (transactional).

### Auth (Fail-Closed)
- NextAuth v5: Magic Link (Email) + Google OAuth only. No password login.
- `User.status` (`ACTIVE`/`BLOCKED`/`DELETED`) validated at `signIn` AND on every JWT refresh (mid-session block clears cookie).
- Services/actions must use `isStatusActive()` from `lib/auth-status.ts`; never assume valid session = active user.

### StockMovement Types
| Type | Trigger | Quantity | Note |
|------|---------|----------|------|
| `reserved` | `createOrder` | `-qty` | `Reserva por Orden {orderId}` |
| `sale` | `confirmPaymentAndUpdateStock` | (converts reserved→sale) | `Venta por Orden {orderId}` |
| `released` | `releaseStockReservation` | `+qty` | `Liberación de reserva por Orden {orderId}` |

### PaymentStatus Enum
`CREATED` | `PENDING` | `APPROVED` | `REJECTED` | `CANCELLED` | `REFUNDED` | `CHARGED_BACK`

---

## Coding Standards

### TypeScript
- Always type returns
- Never use `any`
- Prefer `type` over `interface`
- Use discriminated unions
- Const assertions: `const X = { A: "a" } as const`

### Data Access
- All database access through Prisma.
- All Prisma queries in `services/` (never in `actions/`).
- Forbidden: raw SQL, duplicated queries, manual joins already modeled.

### Validation
- All external input validated with Zod (body, forms, params, API payloads).
- Never trust user input.

### State Management
- Global state = Zustand only.
- Rules: use slices, use selectors, never expose full store, never use Context API for global state.

### Forms
- Must use: react-hook-form + zodResolver.
- Never manage form state manually.

### Styling
- Tailwind only.
- Forbidden: CSS modules, styled-components, emotion, external UI frameworks.
- Single class: `className="bg-slate-800 text-white"`
- Merge: `cn(BASE, variant && "variant-class")`
- Dynamic: `style={{ width: "50%" }}`

### Authentication
- NextAuth v5: Magic Link (Email) + Google OAuth only. No password login.
- Use server session helpers (`auth()`), never decode tokens manually, never store auth state client-side.
- No logout action (client-side `signOut` from next-auth/react).

---

## File Placement Rules

| Type | Location |
|------|----------|
| UI Components | `components/{domain}/` |
| Server Actions | `actions/{domain}/` |
| Business Logic | `services/{domain}.service.ts` |
| DB Queries | `services/{domain}.service.ts` |
| Zod Schemas | `lib/validations/` or inline |
| Zustand Stores | `store/{domain}/` |
| Types | `interfaces/` or `types/` |
| Prisma Types | `generated/prisma-v2/` (never import directly in components) |

Never mix responsibilities.

---

## Naming Conventions

- files → kebab-case (actions, utils, lib)
- services → `{domain}.service.ts` (camelCase exports)
- components → PascalCase
- functions → camelCase
- constants → UPPER_CASE
- exports → named exports (never default)

---

## Performance Rules

Always prefer:
- server fetching
- streaming
- partial rendering

Never optimize prematurely.

---

## Security Rules

Always assume production environment.

Required:
- validate input
- sanitize output
- safe errors (no stack traces, no user enumeration)
- never expose secrets
- timing-safe comparisons for secrets
- idempotency keys on webhooks
- fail-closed on all auth checks

---

## Dependency Policy

Agents may only use installed dependencies.

If new dependency is required:
- Justify why, explain size impact, wait for approval.

---

## Forbidden Actions

Agents must NOT:
- refactor unrelated files
- rename folders globally
- change configs silently
- alter Prisma schema without instruction
- introduce new architectural patterns
- downgrade libraries
- put Prisma queries in `actions/` (use `services/`)
- import Prisma types directly in components (use `interfaces/`)
- add "use client" without justification
- use `useMemo`/`useCallback` (React Compiler handles it)

---

## Expected Agent Behavior

When implementing something:
- Locate domain, reuse patterns, respect types, validate inputs, return typed data, avoid client code unless required.
- Delegate to `services/` for business logic.
- Actions are thin orchestrators only.

---

## Definition of Done

Before finishing a task:
- types compile (`npx tsc --noEmit`)
- lint passes (`pnpm run lint`)
- imports valid
- no unused code
- no console logs
- no TODO comments
- architecture respected
- services have `server-only`

---

## Instruction for All Agents

If unsure where code belongs:
1. Check this file
2. Check folder AGENTS.md
3. STOP. Analyze project structure.
4. Never guess.

---

## Project Structure

```
src/
├── actions/              # Server Actions (thin orchestrators)
│   ├── auth/             # Magic link, register, Google (logout = client-side signOut)
│   ├── order/            # Place, get, list
│   ├── product/          # Get, paginate
│   ├── category/         # Get categories
│   ├── address/          # CRUD addresses
│   ├── provincies/       # Get provinces
│   ├── payment/          # MP preference, admin approval
│   └── admin/            # Admin CRUD for all domains
├── app/                  # Pages & Routes (App Router)
│   ├── (auth)/           # Login, register
│   ├── (shop)/           # Products, cart, checkout, orders, payments
│   ├── admin/            # Admin panel: dashboard, products, orders, users, categories, payments, audit
│   └── api/              # API Endpoints: auth, checkout, webhooks
├── components/           # UI Components (React)
│   ├── admin/            # Admin components: dashboard, products, ui
│   ├── mercadopago/      # MercadoPagoButton
│   ├── product/          # Product-specific
│   ├── products/         # Product listings
│   ├── provider/         # Context Providers (client)
│   └── ui/               # Generic: button, card, footer, sidebar, etc.
├── config/               # Configuration
├── generated/prisma-v2/  # Auto-generated by Prisma (output path)
├── hooks/                # Custom hooks
│   └── useProductVariant.ts
├── interfaces/           # Type contracts and data interfaces
├── lib/                  # Shared utilities & Prisma client
│   ├── admin/            # auth-utils (requireAdmin), audit-logger
│   ├── schemas/          # Zod schemas
│   ├── storage/          # Storage utilities
│   ├── validations/      # Validation schemas
│   ├── prisma.ts         # Prisma singleton (src/generated/prisma-v2)
│   ├── auth-status.ts    # Fail-closed User.status gate
│   ├── mailer.ts         # Resend email client
│   ├── mercadopago.ts    # MercadoPago client
│   ├── errors.ts         # Unified error handler
│   ├── html-escape.ts    # XSS escaping for emails
│   ├── url.ts            # isLocalUrl (open redirect guard)
│   ├── magic-link-email.ts
│   ├── image-utils.ts
│   ├── utils.ts
│   └── zod.ts
├── seed/                 # Seed scripts
├── services/             # Business logic (server-only · 12 services)
│   ├── address.service.ts
│   ├── admin.service.ts
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── color.service.ts
│   ├── order.service.ts
│   ├── payment.service.ts
│   ├── product.service.ts
│   ├── province.service.ts
│   ├── upload.service.ts
│   ├── user.service.ts
│   └── variant.service.ts
├── store/                # Client state (Zustand)
│   ├── address/          # useAddressStore
│   ├── cart/             # useCartStore
│   └── ui/               # useUIStore
├── types/                # Global type definitions
└── utils/                # General utilities
```

---

## Commands

```bash
pnpm install && pnpm run dev      # Start dev server
pnpm run build                     # Production build
npx tsc --noEmit                   # TypeScript check
pnpm run lint                      # ESLint (no auto-fix script)
pnpm run test                      # Vitest (watch)
pnpm run test:run                  # Vitest (single run)
# pnpm run test:coverage           # ⚠️ FAILS: @vitest/coverage-v8 not installed
```

---

## Seeds

| Command | Description | Safety |
|---------|-------------|--------|
| `pnpm seed` (`prisma/seed.ts`) | DESTRUCTIVE: wipes users, orders, payments, catalog, provinces, categories; rewrites with Cloudinary images + test users | Blocks in production/Neon |
| `pnpm seed:users` (`prisma/seed-users.ts`) | Idempotent upsert: super admin + test users + blocked user | Local only, blocks prod/Neon |
| `pnpm seed:prod` (`prisma/seed-prod.ts`) | Provinces + categories only (base data) | Idempotent, safe for prod |
| `npx tsx prisma/seed-dev.ts` | Local catalog (8 products) with `public/products/` images + test users. Runs on every dev container boot. **DESTRUCTIVE on every restart** | Local only, blocks prod/Neon |