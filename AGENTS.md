# Repository Guidelines

## User Preferences (Permanent)

- **Auto-open files**: Every file touched/edited MUST be opened in VS Code automatically with `code <filename>` after the edit. This applies to ALL file operations (read, write, edit). No exceptions.

## How to Use This Guide

Start here for cross-project norms.

This repository is a domain-driven ecommerce platform built as a **modular monolith** with a unified services layer.

- Each component has an `AGENTS.md` file with specific guidelines (e.g., `api/AGENTS.md`, `src/AGENTS.md`).

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (Any Project)

| Skill        | Description                                 | URL                                    |
| ------------ | ------------------------------------------- | -------------------------------------- |
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `react-19`   | No useMemo/useCallback, React Compiler      | [SKILL.md](skills/react-19/SKILL.md)   |
| `nextjs-15`  | App Router, Server Actions, streaming       | [SKILL.md](skills/nextjs-15/SKILL.md)  |
| `tailwind-4` | cn() utility, no var() in className         | [SKILL.md](skills/tailwind-4/SKILL.md) |
| `playwright` | Page Object Model, MCP workflow, selectors  | [SKILL.md](skills/playwright/SKILL.md) |
| `zod-4`      | New API (z.email(), z.uuid())               | [SKILL.md](skills/zod-4/SKILL.md)      |
| `zustand-5`  | Persist, selectors, slices                  | [SKILL.md](skills/zustand-5/SKILL.md)  |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                                                | Skill              |
| ------------------------------------------------------------------------------------- | ------------------ |
| App Router / Server Actions                                                           | `nextjs-15`        |
| Creating Zod schemas                                                                  | `zod-4`            |
| Handling database transactions, queries, or Prisma schema changes                     | `prisma-7`         |
| Working with Authentication (NextAuth v5 / Auth.js)                                   | `nextauth-5`       |
| Working with payments, webhooks, or generating checkout links                         | `mercadopago`      |
| Using Zustand stores                                                                  | `zustand-5`        |
| Working with Tailwind classes                                                         | `tailwind-4`       |
| Writing React components                                                              | `react-19`         |
| Writing TypeScript types/interfaces                                                   | `typescript`       |
| Writing Playwright E2E tests                                                          | `playwright`       |

---

## Project Overview

This repository is a production-grade ecommerce platform built with:

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Prisma 7 ORM
- PostgreSQL (Neon)
- NextAuth v5
- Tailwind v4
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
- Domain-driven modules (auth, products, orders, etc.)
- Unified services layer for business logic
- Clear separation of concerns between layers
- Each module has its own actions, services, and types

### Layers (top → bottom)

```
┌─────────────────────────────────────────────────┐
│  UI (Server Components)                         │
│  pages/, components/                            │
└──────────────────┬──────────────────────────────┘
                   │ llama
┌──────────────────▼──────────────────────────────┐
│  Actions (thin orchestrators)                   │
│  • Auth (requireSession, requireAdmin)          │
│  • Validación Zod                               │
│  • Manejo de errores → { ok, error, data }      │
│  • 0 queries Prisma directo                     │
└──────────────────┬──────────────────────────────┘
                   │ delega
┌──────────────────▼──────────────────────────────┐
│  Services (business logic)                      │
│  • Lógica de negocio                            │
│  • Queries Prisma                               │
│  • server-only (11/11)                          │
└──────────────────┬──────────────────────────────┘
                   │ consulta
┌──────────────────▼──────────────────────────────┐
│  Prisma → PostgreSQL (Neon)                     │
└─────────────────────────────────────────────────┘
```

### Global Architectural Rule (Highest Priority)

Server Components first.
Client Components only when strictly necessary.

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

Domains:

- auth
- products
- cart
- checkout
- orders
- payments
- admin
- profile
- uploads
- addresses
- ui
- data
- infra

### Flow Rules

Action layer:

- Auth (requireSession, requireAdmin)
- Zod validation
- Error handling → { ok, error, data }
- Delegate to service
- 0 Prisma queries direct

Service layer:

- Business logic
- Prisma queries
- Throw errors (not return { ok: false })
- server-only enforced

Agents must place code inside correct domain.
Never create new architectural patterns.

---

## Coding Standards

### TypeScript

- Always type returns
- Never use any
- Prefer type over interface
- Use discriminated unions

### Data Access

- All database access must go through Prisma.
- All Prisma queries live in services/ (never in actions/)
- Forbidden: raw SQL, duplicated queries, manual joins already modeled

### Validation

- All external input must be validated with Zod.
- Includes: request body, forms, params, API payloads
- Never trust user input.

### State Management

- Global state = Zustand only.
- Rules: use slices, use selectors, never expose full store, never use Context API for global state

### Forms

- Forms must use: react-hook-form + zodResolver
- Never manage form state manually.

### Styling

- Styling must use Tailwind only.
- Forbidden: CSS modules, styled-components, emotion, external UI frameworks

### Authentication

- Auth system = NextAuth v5.
- Agents must: use server session helpers, never decode tokens manually, never store auth state client-side

---

## File Placement Rules

| Type              | Location                     |
| ----------------- | ---------------------------- |
| UI Components     | components/{domain}/         |
| Server Actions    | actions/{domain}/            |
| Business Logic    | services/{domain}.service.ts |
| DB Queries        | services/{domain}.service.ts |
| Zod Schemas       | lib/validations/ or inline   |
| Zustand Stores    | store/{domain}/              |
| Types             | interfaces/ or types/        |
| Prisma Types      | generated/prisma/ (never import directly in components) |

Never mix responsibilities.

---

## Naming Conventions

- files → kebab-case (actions, utils, lib)
- services → {domain}.service.ts (camelCase exports)
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
- safe errors
- no stack traces
- never expose secrets

---

## Dependency Policy

Agents may only use installed dependencies.

If new dependency is required:

- Agent must: justify why, explain size impact, wait approval

---

## Forbidden Actions

Agents must NOT:

- refactor unrelated files
- rename folders globally
- change configs silently
- alter Prisma schema without instruction
- introduce new architectures
- downgrade libraries
- put Prisma queries in actions/ (use services/)
- import Prisma types directly in components (use interfaces/)

---

## Expected Agent Behavior

When implementing something:

- Agent must: locate domain, reuse patterns, respect types, validate inputs, return typed data, avoid client code unless required
- Delegate to services/ for business logic
- Actions are thin orchestrators only

---

## Definition of Done

Before finishing a task:

- types compile
- lint passes
- imports valid
- no unused code
- no console logs
- no TODO comments
- architecture respected
- services have server-only

---

## Instruction for All Agents

If unsure where code belongs:

1. Check this file
2. Check folder AGENTS.md
3. STOP. Analyze project structure.
4. Never guess.

---

## PROJECT STRUCTURE

```
src/
├── actions/              - [Server Actions (thin orchestrators)]
│   ├── auth/             - [Auth actions: login, register, logout]
│   ├── order/            - [Order actions: place, get, list]
│   ├── product/          - [Product actions: get, paginate]
│   ├── address/          - [Address actions: get, set, delete]
│   ├── provincies/       - [Province actions: ensure, get]
│   ├── payment/          - [Payment actions: create preference]
│   ├── admin/            - [Admin actions: CRUD for all domains]
│   └── index.ts          - [Re-exports]
├── app/                  - [Pages and Routes]
│   ├── (auth)/           - [Auth routes: login, register]
│   ├── (shop)/           - [Shop routes: products, cart, checkout, orders, payments]
│   ├── admin/            - [Admin panel: dashboard, products, orders, users, categories, payments, audit]
│   └── api/              - [API Endpoints: auth, checkout, webhooks]
├── components/           - [UI Components (React)]
│   ├── admin/            - [Admin-specific components: dashboard, products, ui]
│   ├── mercadopago/      - [MercadoPago components: MercadoPagoButton]
│   ├── product/          - [Product-specific components]
│   ├── products/         - [Product list components]
│   ├── provider/         - [Context Providers (client)]
│   └── ui/               - [Generic components: button, card, footer, sidebar, etc.]
├── config/               - [Configuration]
├── generated/            - [Auto-generated code]
│   └── prisma/           - [Generated by Prisma]
├── hooks/                - [Custom hooks]
│   └── useProductVariant.ts
├── interfaces/           - [Type contracts and data interfaces]
├── lib/                  - [Shared utilities and Prisma client]
│   ├── admin/            - [Admin utilities: auth-utils, audit-logger]
│   ├── api/              - [API utilities]
│   ├── schemas/          - [Zod schemas]
│   ├── storage/          - [Storage utilities]
│   └── validations/      - [Validation schemas]
├── seed/                 - [Seed scripts for database]
├── services/             - [Business logic layer (server-only)]
│   ├── address.service.ts
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
├── store/                - [Client-side state (Zustand)]
│   ├── address/          - [Address state]
│   ├── cart/             - [Cart state]
│   └── ui/               - [UI state]
├── types/                - [Global type definitions]
└── utils/                - [General utilities]
```

---

## COMMANDS

```bash
pnpm install && pnpm run dev      # Start dev server
pnpm run build                     # Production build
npx tsc --noEmit                   # TypeScript check
pnpm run lint:fix                  # Fix lint issues
pnpm run test                      # Vitest (watch mode)
pnpm run test:run                  # Vitest (single run)
pnpm run test:coverage             # Vitest with coverage
```
