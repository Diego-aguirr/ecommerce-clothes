# Payments Domain Agent Specification

## Scope

This domain controls all payment processing logic.

Includes:
- payment intents
- transaction validation
- gateway communication (MercadoPago)
- manual payment handling (cash/transfer)
- webhook handling
- payment verification
- reconciliation
- failure handling
- refunds coordination

Does NOT include:
- order creation (→ `order.service.ts`)
- cart logic (→ `store/cart/`)
- UI payment forms (→ `components/mercadopago/`)
- admin payment approval (→ `actions/admin/orders.ts`)

## Architecture

```
UI (Checkout Page)
  │
  ▼
Action (place-order.ts)
  • Auth (requireSession)
  • Zod validation
  • paymentProvider selection ("mercadopago" | "cash")
  │
  ▼
Service (order.service.ts)
  • Order + Payment creation
  • server-only enforced
  │
  ├─ [if MP] ───────────────────┐
  │                              ▼
  │                    Action (create-preference.ts)
  │                              │
  │                              ▼
  │                    Service (payment.service.ts)
  │                              │
  │                              ▼
  │                    MercadoPago API
  │                              │
  │                              ▼
  │                    Webhook (route.ts)
  │                              │
  │                              ▼
  │                    confirmPaymentAndUpdateStock (order.service.ts)
  │                              │
  │                              ▼
  │                    Order confirmed + stock decremented
  │
  └─ [if Cash] ─────────────────┐
                                ▼
                    Order created with status "pending"
                                │
                                ▼
                    Admin Action (approveManualPayment)
                                │
                                ▼
                    approveCashPaymentService (order.service.ts)
                                │
                                ▼
                    confirmPaymentAndUpdateStock (order.service.ts)
                                │
                                ▼
                    Order confirmed + stock decremented
```

## Core Principle

Payments are confirmed only by trusted sources, never by client.

Client success page ≠ successful payment.

Trusted sources:
1. provider webhook (MP)
2. admin manual approval (cash/transfer)
3. provider API verification

## Trust Hierarchy

Always trust in this order:
1. provider webhook (MP)
2. admin manual approval (cash/transfer)
3. provider API verification
4. internal DB record
5. client request

Client input is never authoritative.

## Verification Rule

A payment is valid only if:
- provider confirms it
- signature verified
- amount matches order
- currency matches order
- orderId matches metadata

If any mismatch → reject.

## Status Machine

Allowed statuses:
- created
- pending
- authorized
- confirmed
- failed
- cancelled
- refunded
- partially_refunded

Agents must not invent new statuses.

Allowed transitions:
- created → pending
- pending → authorized
- authorized → confirmed
- pending → failed
- authorized → cancelled
- confirmed → refunded
- confirmed → partially_refunded

Invalid transitions must throw errors.

## Amount Integrity

Payment amount must always equal `order.total`.

Agents must block if mismatch.
Never allow: manual override, client override, rounding edits.

## Currency Lock

Currency must match order currency.

Agents must reject cross-currency confirmations.

## Idempotency Rule

Webhook handlers must be idempotent.

Repeated provider events must:
- not duplicate records
- not duplicate status changes
- not duplicate refunds

## Security Constraints

Agents must never:
- expose payment secrets
- log raw tokens
- return provider payloads to client
- store CVV
- store raw card numbers

Allowed storage:
- last4
- brand
- expiration month/year
- provider transaction id

## Key Files

| File | Description |
|------|-------------|
| `services/payment.service.ts` | MercadoPago SDK integration, preference creation |
| `services/order.service.ts` | `confirmPaymentAndUpdateStock()` shared function for MP webhook and admin approval |
| `actions/payment/create-preference.ts` | Thin orchestrator for payment creation |
| `actions/order/place-order.ts` | Creates order with paymentProvider selection |
| `actions/admin/orders.ts` | `approveManualPayment()` for cash/transfer approval |
| `components/mercadopago/MercadoPagoButton.tsx` | UI component for checkout |
| `app/api/webhooks/mercadopago/route.ts` | Webhook handler for MercadoPago |
| `app/(shop)/checkout/(checkout)/ui/PlaceOrder.tsx` | Checkout UI with payment method selector |

## Flow

### MercadoPago (Automatic)

```
checkout → place order → create preference → MercadoPago → webhook → confirmPaymentAndUpdateStock → order confirmed
```

### Cash/Transfer (Manual)

```
checkout → place order (provider: "cash") → instructions shown → admin approval → confirmPaymentAndUpdateStock → order confirmed
```

## Failure Handling

If payment fails:
- order must not activate
- inventory must release
- user must be notified
- retry must be allowed

If admin rejects manual payment:
- order must not activate
- stock is not decremented
- user must be notified

Agents must never activate order after failed payment.

## Refund Rules

Refunds must:
- reference original transaction
- store reason
- store actor
- store timestamp
- store amount

Refund must be validated against provider before marking success.

## Forbidden Actions

Agents must NOT:
- trust client payment status
- activate orders from frontend success page
- skip webhook validation
- modify payment totals
- create fake confirmations
- store sensitive card data
- bypass gateway verification
- put Prisma queries in actions (use services)

## Completion Checklist

Before finishing payment feature:

- [ ] provider verification exists
- [ ] signature validation exists
- [ ] idempotency implemented
- [ ] status machine enforced
- [ ] order match validated
- [ ] logs written
- [ ] strict types pass
- [ ] lint passes
- [ ] service has `server-only`

If any fails → implementation invalid.
