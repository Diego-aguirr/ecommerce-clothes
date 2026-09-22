# Ecommerce API Agent — Ruleset Oficial

Stack obligatorio: Next.js 15 App Router · Prisma 7 · Zod 4 · NextAuth v5 · TypeScript strict

## Architecture

```
Route Handler (app/api/)
  │
  ▼
Business Logic
  • Services (preferred)
  • Or inline for simple endpoints
  │
  ▼
Prisma → PostgreSQL
```

## Auto-invoke Skills

| Acción | Skill |
|--------|-------|
| Crear endpoint API | `nextjs-15` |
| Validar input | `zod-4` |
| Query DB | `prisma-7` |
| Auth check | `nextauth-5` |
| Testing endpoint | `playwright` |

## CRITICAL RULES — NO NEGOCIABLES

### AUTH

Siempre:
- usar `auth()` server helper
- validar sesión antes de query
- verificar user en DB

Nunca:
- confiar en `session.user` sin DB lookup
- usar datos client-side
- exponer estado de autenticación sensible

### RESPUESTAS API

Formato obligatorio:

```typescript
{ ok: true, data }
{ ok: false, error }
```

Nunca:
- strings sueltos
- booleans sin objeto
- null ambiguo

### SEGURIDAD

Siempre:
- respuesta uniforme en endpoints sensibles
- evitar user enumeration
- tokens criptográficamente seguros
- invalidar tokens previos
- logs internos solamente

Nunca:
- revelar si usuario existe
- revelar estados internos
- devolver stack trace

### VALIDACIÓN

Todo input debe pasar Zod:
- body
- params
- headers
- cookies

Sin validación → implementación inválida.

### DATABASE

Siempre:
- Prisma client único
- queries tipadas
- select minimal fields

Nunca:
- raw SQL
- traer columnas innecesarias
- queries duplicadas

## Logic Separation

| Tipo | Ubicación |
|------|-----------|
| Route handler | `app/api/...` |
| Business logic | `services/{domain}.service.ts` |
| Validation | `lib/validations/` or inline Zod |
| Auth | `auth.ts` + `lib/admin/auth-utils.ts` |

Nunca mezclar responsabilidades.

## API Routes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/webhooks/mercadopago` | Webhook de pagos MercadoPago |
| `POST` | `/api/checkout/start` | Iniciar checkout |
| `POST` | `/api/auth/forgot-password` | Enviar email de recuperación |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña |
| `GET`  | `/api/auth/magic-link` | Redirect legacy (links viejos) |

## Decision Tree — Endpoint

```
¿requiere auth?
  sí → validar session + user DB
  no → validar input

¿modifica datos?
  sí → POST / PATCH / DELETE
  no → GET
```

## Performance

- usar selects parciales
- no bloquear event loop
- delegar tareas largas

Regla:
- <100ms → endpoint
- >100ms → background job

## Errores

Siempre manejar:
- Prisma errors
- JSON parse errors
- missing params
- expired tokens

Nunca:
- throw sin catch
- error sin status code

## Naming

| Elemento | Regla |
|----------|-------|
| Route folder | kebab-case |
| Handler file | `route.ts` |
| Functions | camelCase |
| Constants | UPPER_CASE |

## Checklist Final

Antes de terminar un endpoint:

- [ ] input validado
- [ ] sesión validada (si auth)
- [ ] DB query optimizada
- [ ] tokens seguros
- [ ] errores controlados
- [ ] output uniforme
- [ ] tipos correctos
- [ ] sin console.log
- [ ] sin TODO

Si algo falla → endpoint inválido.
