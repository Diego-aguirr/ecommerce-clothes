# Agents UI - AI Agent Ruleset

> **Skills Reference**: For detailed patterns, use these skills:
 > - [`typescript`](../skills/typescript/SKILL.md) - Const types, flat interfaces
 > - [`react-19`](../skills/react-19/SKILL.md) - No useMemo/useCallback, compiler
 > - [`nextjs-15`](../skills/nextjs-15/SKILL.md) - App Router, Server Actions
 > - [`tailwind-4`](../skills/tailwind-4/SKILL.md) - cn() utility, no var() in className
 > - [`zod-4`](../skills/zod-4/SKILL.md) - New API (z.email(), z.uuid())
 > - [`zustand-5`](../skills/zustand-5/SKILL.md) - Selectors, persist middleware

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| App Router / Server Actions | `nextjs-15` |
| Building AI chat features | `ai-sdk-5` |
| Creating Zod schemas | `zod-4` |
| Creating/modifying services | `prisma-7` |
| Using Zustand stores | `zustand-5` |
| Working with Tailwind classes | `tailwind-4` |
| Writing Playwright E2E tests | `playwright` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |

---

## CRITICAL RULES - NON-NEGOTIABLE

### React

- ALWAYS: `import { useState, useEffect } from "react"`
- NEVER: `import React`, `import * as React`, `import React as *`
- NEVER: `useMemo`, `useCallback` (React Compiler handles optimization)

### Types

- ALWAYS: `const X = { A: "a", B: "b" } as const; type T = typeof X[keyof typeof X]`
- NEVER: `type T = "a" | "b"`

### Interfaces

- ALWAYS: One level depth only; object property → dedicated interface (recursive)
- ALWAYS: Reuse via `extends`
- NEVER: Inline nested objects

### Styling

- Single class: `className="bg-slate-800 text-white"`
- Merge multiple classes: `className={cn(BASE_STYLES, variant && "variant-class")}`
- Dynamic values: `style={{ width: "50%" }}`
- NEVER: `var()` in className, hex colors

### Scope Rule (ABSOLUTE)

- Used 2+ places → `lib/` or `types/` or `hooks/` (components go in `components/{domain}/`)
- Used 1 place → keep local in feature directory
- This determines ALL folder structure decisions

---

## ARCHITECTURE — Service Layer Pattern

```
UI (Server Components)
  │
  ▼
Actions (thin orchestrators)
  • Auth (requireSession, requireAdmin)
  • Zod validation
  • Error handling → { ok, error, data }
  • 0 Prisma queries direct
  │
  ▼
Services (business logic)
  • Business logic
  • Prisma queries
  • Throw errors (not return { ok: false })
  • server-only enforced
  │
  ▼
Prisma → PostgreSQL
```

### Action Pattern

```typescript
"use server";
import { auth } from "@/auth";
import { someService } from "@/services/some.service";

export async function doSomething(data: FormData) {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  const validated = schema.parse(Object.fromEntries(data));

  try {
    const result = await someService(validated);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
```

### Service Pattern

```typescript
import prisma from "@/lib/prisma";
import "server-only";

export async function someService(input: ValidatedInput) {
  // Business logic here
  const result = await prisma.model.findMany({ ... });

  if (!result) throw new Error("Not found");

  return result;
}
```

---

## DECISION TREES

### Code Location

```
Server action → actions/{domain}/{action}.ts
Business logic → services/{domain}.service.ts
Data transform → actions/{domain}/{domain}.adapter.ts
Types (shared 2+) → types/{domain}.ts | Types (local 1) → {feature}/types.ts
Utils (shared 2+) → lib/ | Utils (local 1) → {feature}/utils/
Hooks (shared 2+) → hooks/ | Hooks (local 1) → {feature}/hooks.ts
shadcn components → components/shadcn/
```

### Component Placement

```
New/Existing UI? → shadcn/ui + Tailwind (NEVER HeroUI for new code)
Used 1 feature? → features/{feature}/components | Used 2+? → components/{domain}/
Needs state/hooks? → "use client" | Server component? → No directive
```

---

## PATTERNS

### Server Component

```typescript
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}
```

### Server Action (Thin Orchestrator)

```typescript
"use server";
import { auth } from "@/auth";
import { createOrderService } from "@/services/order.service";

export async function placeOrder(items: OrderItem[]) {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  try {
    const order = await createOrderService(items);
    return { ok: true, data: order };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
```

### Service (Business Logic)

```typescript
import prisma from "@/lib/prisma";
import "server-only";

export async function createOrderService(items: OrderItem[]) {
  const order = await prisma.order.create({
    data: { /* ... */ },
    include: { items: true },
  });

  if (!order) throw new Error("Failed to create order");
  return order;
}
```

### Form + Validation (Zod 4)

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.email(),  // Zod 4: z.email() not z.string().email()
  id: z.uuid(),      // Zod 4: z.uuid() not z.string().uuid()
});

const form = useForm({ resolver: zodResolver(schema) });
```

### Zustand 5

```typescript
const useStore = create(
  persist(
    (set) => ({
      value: 0,
      increment: () => set((s) => ({ value: s.value + 1 })),
    }),
    { name: "key" },
  ),
);
```

---

## TECH STACK

Next.js 15 | React 19 | TypeScript strict | Prisma 7 | PostgreSQL (Neon)
Tailwind 4 | shadcn/ui | Zod 4 | React Hook Form | Zustand 5 | NextAuth v5
MercadoPago (payments) | Cloudinary (images)

> **Note**: HeroUI exists in `components/ui/` as legacy code. Do NOT add new components there.

---

## PROJECT STRUCTURE

```
src/
├── actions/              - [Server Actions (thin orchestrators)]
│   ├── auth/             - [Auth: login, register, logout]
│   ├── order/            - [Orders: place, get, list]
│   ├── product/          - [Products: get, paginate]
│   ├── address/          - [Addresses: get, set, delete]
│   ├── provincies/       - [Provinces: ensure, get]
│   ├── payment/          - [Payments: create preference]
│   ├── admin/            - [Admin: CRUD all domains]
│   └── index.ts          - [Re-exports]
├── app/                  - [Pages and Routes]
│   ├── (auth)/           - [Auth routes: login, register]
│   ├── (shop)/           - [Shop routes: products, cart, checkout]
│   └── api/              - [API Endpoints (Server)]
├── components/           - [UI Components (React)]
│   ├── product/          - [Product-specific components]
│   ├── products/         - [Product list components]
│   ├── provider/         - [Context Providers (client)]
│   └── ui/               - [Generic components]
├── config/               - [Configuration]
├── generated/            - [Auto-generated code]
│   └── prisma/           - [Generated by Prisma]
├── interfaces/           - [Type contracts and data interfaces]
├── lib/                  - [Shared utilities and Prisma client]
│   └── api/              - [API utilities]
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
```

---

## QA CHECKLIST BEFORE COMMIT

- [ ] `npx tsc --noEmit` passes
- [ ] `pnpm run build` passes
- [ ] All UI states handled (loading, error, empty)
- [ ] No secrets in code (use `.env.local`)
- [ ] Error messages sanitized
- [ ] Server-side validation present
- [ ] Services have `server-only`
- [ ] Actions delegate to services (0 Prisma directo)
