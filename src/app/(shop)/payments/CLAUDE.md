Payments Domain Agent Specification
Scope

This domain controls all payment processing logic.

Includes:

payment intents

transaction validation

gateway communication

webhook handling

payment verification

reconciliation

failure handling

refunds coordination

Does NOT include:

order creation

cart logic

UI payment forms

Authority Level

Payments is a financial-critical domain.

Agents must treat it as:

externally verified truth source

Payment state must always match gateway state.

Core Principle

Payments are confirmed only by provider, never by client.

Client success page ≠ successful payment.

Only trusted sources:

webhook confirmation

provider API verification

Creation Rule

Payments may only be created by:

checkout domain

Agents must reject:

manual creation

client-side creation

admin creation

test route creation

Verification Rule

A payment is valid only if:

provider confirms it

signature verified

amount matches order

currency matches order

orderId matches metadata

If any mismatch → reject.

Trust Hierarchy

Always trust in this order:

1 provider webhook
2 provider API verification
3 internal DB record
4 client request

Client input is never authoritative.

Status Machine

Allowed statuses:

created
pending
authorized
confirmed
failed
cancelled
refunded
partially_refunded

Agents must not invent new statuses.

Status Transition Rules

Allowed transitions:

created → pending
pending → authorized
authorized → confirmed
pending → failed
authorized → cancelled
confirmed → refunded
confirmed → partially_refunded

Invalid transitions must throw errors.

Amount Integrity

Payment amount must always equal:

order.total

Agents must block if mismatch.

Never allow:

manual override

client override

rounding edits

Currency Lock

Currency must match order currency.

Agents must reject cross-currency confirmations.

Idempotency Rule

Webhook handlers must be idempotent.

Repeated provider events must:

not duplicate records

not duplicate status changes

not duplicate refunds

Webhook Validation

Agents must verify:

signature header

timestamp

provider secret

If verification fails → reject immediately.

Security Constraints

Agents must never:

expose payment secrets

log raw tokens

return provider payloads to client

store CVV

store raw card numbers

Allowed storage:

last4

brand

expiration month/year

provider transaction id

Order Dependency Rule

Payments depend on orders.

Orders must NOT depend on payments.

Flow:

checkout → payment → confirmation → order activation

Refund Rules

Refunds must:

reference original transaction

store reason

store actor

store timestamp

store amount

Refund must be validated against provider before marking success.

Failure Handling

If payment fails:

order must not activate

inventory must release

user must be notified

retry must be allowed

Agents must never activate order after failed payment.

Logging Requirements

Every payment event must log:

provider event id

timestamp

action

status change

validation result

Logs must be immutable.

Performance Constraints

Agents must optimize:

webhook handling latency

verification calls

retry logic

DB writes

Recommended:

indexed transactionId

indexed orderId

indexed status

Allowed File Boundaries

Payment logic must only exist in:

domain/payments
lib/payments
actions/payments

Agents must not implement payment logic elsewhere.

Extension Rules

Before adding payment feature, agent must:

1 search existing payment logic
2 reuse types
3 reuse gateway client
4 reuse verification logic
5 reuse status machine

Never duplicate payment validation code.

Forbidden Actions

Agents must NOT:

trust client payment status

activate orders from frontend success page

skip webhook validation

modify payment totals

create fake confirmations

store sensitive card data

bypass gateway verification

Completion Checklist

Before finishing payment feature:

provider verification exists

signature validation exists

idempotency implemented

status machine enforced

order match validated

logs written

strict types pass

lint passes

If any fails → implementation invalid.

End Payments Domain Rules
