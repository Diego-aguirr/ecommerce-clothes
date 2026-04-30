---
name: prisma-7
description: >
  Prisma v7 Database patterns, performance optimization, and safety rules.
  Trigger: When querying the database, creating complex queries, transactions, or modifying Prisma schema.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Writing database queries in Server Actions or API routes.
- Mutating sensitive data (Orders, Stock, Payments).
- Structuring relations to avoid performance bottlenecks.
- Modifying the `schema.prisma`.

## Critical Patterns

### 1. Avoid N+1 Queries (Use `include` or `select`)
Never loop over an array of objects to fetch related data one by one. Always use Prisma's nested reads (`include` or `select`).

**Bad (N+1 Vulnerability):**
```typescript
const orders = await prisma.order.findMany();
// ❌ Esto ejecuta 1 query por CADA orden en la base de datos
for (const order of orders) {
  order.user = await prisma.user.findUnique({ where: { id: order.userId }});
}
```

**Good (1 Query):**
```typescript
const orders = await prisma.order.findMany({
  include: {
    user: { select: { name: true, email: true } } // ✅ Solo trae lo necesario
  }
});
```

### 2. ACID Transactions for Critical Mutations
When updating money, stock, or order statuses, always use `$transaction` to ensure that if one operation fails, the whole database rolls back. Never leave orphaned records.

**Do:**
```typescript
export async function placeOrder(userId: string, items: CartItem[]) {
  return await prisma.$transaction(async (tx) => {
    // 1. Descontar stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inStock: { decrement: item.quantity } }
      });
    }
    
    // 2. Crear orden
    const order = await tx.order.create({
      data: { userId, total: 100 /* ... */ }
    });

    return order;
  }); // Si falla el paso 2, el stock vuelve a su estado original mágicamente.
}
```

### 3. Soft Deletes (Never Hard Delete)
Never use `prisma.model.delete()` for core entities like Users, Products, or Orders. Use soft deletes to maintain analytical history and audit logs.

**Do:**
```typescript
await prisma.user.update({
  where: { id: userId },
  data: { status: "DELETED", deletedAt: new Date() }
});
```

### 4. Nullable fields mapping
If your schema has optional fields (`String?`), but you receive `undefined` from Zod/Frontend, explicitly cast them to `null` before passing to Prisma to avoid "undefined is not a valid Prisma value" errors.

## Resources
- **Docs**: [https://www.prisma.io/docs/orm/prisma-client](https://www.prisma.io/docs/orm/prisma-client)
