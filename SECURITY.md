# Política de Seguridad

## Versiones Soportadas

Actualmente solo la rama `main` recibe actualizaciones de seguridad.

| Versión | Soportada |
|---------|-----------|
| main    | ✅        |
| < main  | ❌        |

## Reportar una Vulnerabilidad

**NO abras un Issue público** para vulnerabilidades de seguridad.

Envía un email a **diegoalexisaguirre2@gmail.com** con:
- Descripción de la vulnerabilidad
- Pasos para reproducir (si es posible)
- Impacto estimado
- Versión/commit afectado

Nos comprometemos a:
- Acusar recibo en **48 horas**
- Proporcionar una evaluación inicial en **5 días hábiles**
- Mantenerte informado del progreso
- Coordinar divulgación responsable si se confirma

## Áreas Críticas (Auditadas)

| Área | Medidas |
|------|---------|
| **Auth** | NextAuth v5, Magic Links + Google OAuth, fail-closed User.status (ACTIVE/BLOCKED/DELETED), JWT refresh re-valida status en cada request |
| **Webhooks MP** | HMAC-SHA256 sobre manifest (no body), timing-safe compare, idempotency key (data.id + x-request-id), fail-closed sin secreto |
| **Pagos** | Validación monto tolerante a ruido float, log duradero fuera de tx, no trust en callbacks de cliente |
| **DB** | Prisma ORM (previene SQL injection), transacciones atómicas, validación de stock condicional |
| **AuthZ** | `requireAdmin` en actions admin, ownership checks en orders/payments, fail-closed User.status |
| **Headers** | `isLocalUrl` guard contra open redirects, CSP via Next.js, `timingSafeEqual` para HMAC |

## Secretos

- **Nunca** commitees `.env`, `.env.local`, `.env.production`
- Usá `.env.example` como plantilla (sin valores reales)
- Rotá secretos si se expusieron accidentalmente
- `AUTH_SECRET`, `MERCADOPAGO_WEBHOOK_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, `CLOUDINARY_URL`, `RESEND_API_KEY`, `GOOGLE_CLIENT_SECRET` → tratarlos como credenciales de producción

## Dependencias

- `pnpm audit` en CI
- Renovate/Dependabot configurado para updates automáticos de patch/minor
- Major updates requieren revisión manual

## Contacto

Para consultas de seguridad: **diegoalexisaguirre2@gmail.com**