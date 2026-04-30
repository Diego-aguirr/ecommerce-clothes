---
name: nextauth-5
description: >
  NextAuth v5 (Auth.js) implementation patterns and best practices for App Router.
  Trigger: When working with authentication, sessions, login, logout, OAuth, or protecting routes.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Accessing user sessions
- Protecting routes (middleware or server components)
- Implementing `signIn` and `signOut` logic
- Working with NextAuth v5 callbacks and providers

## Critical Patterns

### 1. Server-Side First (App Router)
Always prefer fetching the session on the server to avoid client-side loading states and layout shifts.

**Do:**
```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  if (!session) return <p>Unauthorized</p>;
  return <p>Welcome {session.user?.name}</p>;
}
```

**Don't:**
```typescript
"use client";
import { useSession } from "next-auth/react"; // Avoid unless interactive UI needs it
```

### 2. Server Actions for Mutations
Use `signIn` and `signOut` from your local `auth.ts` inside Server Actions instead of calling them on the client.

```typescript
// actions/auth.ts
"use server";
import { signIn, signOut } from "@/auth";

export async function loginWithGithub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
```

### 3. Route Protection in Middleware
Use the `auth` middleware to protect routes globally without adding boilerplate to every page.

```typescript
// middleware.ts
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith("/admin");

  if (!isLoggedIn && isProtected) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

### 4. Extending Session Types
Always extend the default NextAuth types if you add custom fields (like `role` or `id`) to the session.

```typescript
// types/next-auth.d.ts
import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
    } & DefaultSession["user"]
  }
}
```

## Resources
- Auth.js Docs: [https://authjs.dev/](https://authjs.dev/)
