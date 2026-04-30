---
name: mercadopago
description: >
  Mercado Pago SDK v2 implementation patterns for Next.js App Router.
  Trigger: When building payment gateways, handling webhooks, or generating payment preferences.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Creating payment preferences (checkout links).
- Handling incoming webhooks from Mercado Pago.
- Querying payment status.
- Configuring the Mercado Pago SDK securely.

## Critical Patterns

### 1. Server-Side ONLY (Never leak tokens)
The SDK must **never** be imported or used in a Client Component. All interactions must occur in Server Actions or API Route Handlers.

**Do:**
```typescript
// lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Instanciar solo del lado del servidor
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000, idempotencyKey: 'abc' }
});

export const preference = new Preference(mpClient);
export const payment = new Payment(mpClient);
```

### 2. Idempotency for Safety
Always pass an idempotency key (like the Order ID) when creating a payment preference. This prevents charging the user twice if they refresh or if the network hangs.

```typescript
// actions/payments/create-preference.ts
"use server";
import { preference } from "@/lib/mercadopago";

export async function createPaymentPreference(orderId: string, total: number) {
  try {
    const response = await preference.create({
      body: {
        items: [{ id: "order", title: `Order #${orderId}`, quantity: 1, unit_price: total }],
        external_reference: orderId, // Crucial to link MP with our DB
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_URL}/checkout/failure`,
        },
        auto_return: "approved",
      },
      requestOptions: {
        idempotencyKey: `order-${orderId}`, // Evita cobros duplicados
      }
    });
    return { success: true, init_point: response.init_point };
  } catch (error) {
    return { success: false, message: "Error conectando con MP" };
  }
}
```

### 3. Webhook Signature Validation (Mandatory)
Webhooks must be validated using the `x-signature` header to ensure they genuinely come from Mercado Pago, preventing malicious actors from sending fake "Payment Approved" requests.

**Do:**
```typescript
// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const url = new URL(req.url);
  const dataID = url.searchParams.get("data.id");

  // Si falta la firma, rechazar (403 Forbidden)
  if (!xSignature || !xRequestId || !dataID) {
    return NextResponse.json({ error: "Missing signatures" }, { status: 403 });
  }

  // Lógica para validar firma con el WEBHOOK_SECRET (según docs oficiales)
  // ... validación criptográfica ...

  // Si es válido, actualizar la base de datos usando prisma
  return NextResponse.json({ received: true }, { status: 200 });
}
```

## Resources
- **Docs**: [https://www.mercadopago.com.ar/developers/es/docs](https://www.mercadopago.com.ar/developers/es/docs)
